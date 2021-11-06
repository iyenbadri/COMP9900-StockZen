from contextlib import suppress
from datetime import datetime

from app import db, executor
from app.config import STALENESS_INTERVAL
from app.models.schema import LotBought, LotSold, Portfolio, Stock, StockPage
from app.utils import crud_utils, db_utils, utils
from app.utils.enums import LotType, Status
from flask import current_app
from flask_login import current_user
from sqlalchemy.orm import load_only
from sqlalchemy.sql import func

# ==============================================================================
# Cascade Operations
# ==============================================================================


def cascade_updates(refresh_data=False):
    """Update all of a user's portfolios calculations
    :param: refresh_data determines if the latest data is fetched"""
    try:
        # Get all portfolios associated with the current user and do updates for all
        portfolios = db_utils.query_all(Portfolio)
        for portfolio in portfolios:
            portfolio_id = portfolio.id
            propagate_portfolio_updates(portfolio_id, refresh_data)

    except Exception as e:
        print("Update cascade was unsuccessful")
        utils.debug_exception(e, suppress=True)


def propagate_portfolio_updates(portfolio_id, refresh_data=False):
    """Cascade update calculations for all portfolio rows"""
    print("\n" + "#" * 30)
    print(f"Cascading updates for portfolio: {portfolio_id}")

    # Get all stock rows and stock pages associated with this portfolio_id
    stock_tuples = (
        Portfolio.query.join(Stock, Portfolio.id == Stock.portfolio_id)
        .join(StockPage, Stock.stock_page_id == StockPage.id)
        .with_entities(Stock, StockPage)
        .filter(Portfolio.id == portfolio_id)
        .all()
    )

    # Collect all yfinance requests and run concurrently if flag is set
    if refresh_data:
        id_list = []
        for _, stock_page in stock_tuples:
            id_list.append(stock_page.id)
        executor.map(api_request, id_list)

    # Perform all calculation updates to database
    for stock, _ in stock_tuples:
        print("\n" + "*" * 30)
        try:
            stock_id = stock.id
            propagate_stock_updates(stock_id)

        except Exception as e:
            utils.debug_exception(e, suppress=True)
    # 4. finally update portfolio calculations
    update_portfolio(portfolio_id)


def propagate_stock_updates(stock_id):
    """Cascade update calculations from StockPage to Lots, Stock, Portfolio"""
    try:
        print(f"Propagating calculation updates for stockId: {stock_id}")
        # 1. get all BUY lot_id's that correspond to the stock and update their calcs
        update_stock_lots(LotType.BUY, stock_id)
        # 2. get all SELL lot_id's that correspond to the stock and update their calcs
        update_stock_lots(LotType.SELL, stock_id)
        # 3. update stock calculations
        update_stock(stock_id)

    except Exception as e:
        utils.debug_exception(e, suppress=True)


def api_request(stock_page_id: int, interval: str = STALENESS_INTERVAL):
    """Update Stock Page with data from yfinance, if fail try to use latest (cached) data
    :param: default interval is STALENESS_INTERVAL (90s), can also be TOP_STOCKS_INTERVAL (1hr)"""
    # Do not send API requests in testing mode
    if current_app.config["TESTING"]:
        return

    try:
        # only need to fetch if the data is stale or timestamp is NULL (i.e. never been updated before)
        last_updated = db_utils.query_item(StockPage, stock_page_id).last_updated
        try:
            elapsed = datetime.now() - last_updated
        except:
            pass  # let the if statement handle the error

        # Check if timestamp is NULL or data is stale
        if not last_updated or elapsed.seconds > interval:
            print(f"Data for stock_page {stock_page_id} is stale: fetching from yfinance")
            if crud_utils.update_stock_page(stock_page_id) == Status.FAIL:
                raise ConnectionError(
                    f"Could not fetch latest data for stockPageId: {stock_page_id}, attempting to return from cache."
                )
            else:
                print(f"Updated yfinance data for stockPageId: {stock_page_id}")
    except Exception as e:
        # Use cached data instead
        utils.debug_exception(e, suppress=True)
        print(f"Using cached data for stockPageId: {stock_page_id}")
    finally:
        # Raise error if price is still not available
        is_valid_price = db_utils.query_item(StockPage, stock_page_id).price
        if not is_valid_price:
            print(f"API & Cached data for stockPageId: {stock_page_id} were both invalid")


# ==============================================================================
# Calculation Operations
# ==============================================================================
def update_stock_lots(type: LotType, stock_id: int):
    """Update all lots associated with a stock row on the database"""
    if type == LotType.BUY:
        sqla_tuples = db_utils.query_all_with_join(
            LotBought, [Stock], [LotBought, Stock], **{"stock": stock_id}
        )
        for lot_bought, _ in sqla_tuples:
            try:
                value, change = calc_lot_bought(lot_bought.id)
                lot_bought.value = value
                lot_bought.change = change
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                utils.debug_exception(e, suppress=True)
                print(f"Error updating calcs for lot_bought with id: {lot_bought.id}")
    elif type == LotType.SELL:
        sqla_tuples = db_utils.query_all_with_join(
            LotSold, [Stock], [LotSold, Stock], **{"stock": stock_id}
        )
        for lot_sold, _ in sqla_tuples:
            try:
                realised = calc_lot_sold(lot_sold.id)
                lot_sold.realised = realised
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                utils.debug_exception(e, suppress=True)
                print(f"Error updating calcs for lot_sold with id: {lot_sold.id}")


def update_lot(type: LotType, lot_id: int = None):
    """Update a single lot on the database"""
    try:
        if type == LotType.BUY:
            value, change = calc_lot_bought(lot_id)
            db_utils.update_item_columns(
                LotBought,
                lot_id,
                {
                    "value": value,
                    "change": change,
                    "last_updated": datetime.now(),  # update with current timestamp
                },
            )

        elif type == LotType.SELL:
            realised = calc_lot_sold(lot_id)
            db_utils.update_item_columns(
                LotSold,
                lot_id,
                {
                    "realised": realised,
                    "last_updated": datetime.now(),  # update with current timestamp
                },
            )
        else:
            raise ValueError("Incorrect type provided")
    except Exception as e:
        utils.debug_exception(e)


def update_stock(stock_id: int):
    """Update a stock row with calculated data on the database"""
    try:
        avg_price, gain, perc_gain, value = calc_stock(stock_id)
        db_utils.update_item_columns(
            Stock,
            stock_id,
            {
                "avg_price": avg_price,
                "gain": gain,
                "perc_gain": perc_gain,
                "value": value,
                "last_updated": datetime.now(),  # update with current timestamp
            },
        )
    except Exception as e:
        utils.debug_exception(e)


def update_portfolio(portfolio_id: int):
    """Update a portfolio row with calculated data on the database"""
    try:
        stock_count, value, change, gain, perc_change, perc_gain = calc_portfolio(
            portfolio_id
        )
        db_utils.update_item_columns(
            Portfolio,
            portfolio_id,
            {
                "stock_count": stock_count,
                "value": value,
                "change": change,
                "perc_change": perc_change,
                "gain": gain,
                "perc_gain": perc_gain,
                "last_updated": datetime.now(),  # update with current timestamp
            },
        )
    except Exception as e:
        utils.debug_exception(e)


# ==============================================================================
# Lot Calculations
# ==============================================================================


def calc_lot_bought(lot_id: int):
    """Lot bought Calculations to return value and change amounts"""
    try:

        lot_bought, stockpage = (
            LotBought.query.with_entities(LotBought, StockPage)
            .join(Stock, Stock.id == LotBought.stock_id)
            .join(StockPage, Stock.stock_page_id == StockPage.id)
            .filter(LotBought.id == lot_id)
            .one()
        )
        units = lot_bought.units
        current_price = stockpage.price
        daily_change = stockpage.change

        # attempt to calculate value, change; leave as None if error
        value = None
        change = None
        with suppress(TypeError, ZeroDivisionError):
            value = units * current_price
            change = units * daily_change

        return value, change
    except Exception as e:
        utils.debug_exception(e)


def calc_lot_sold(lot_id: int):
    """Calculates profit/loss from the sold stock as realised"""
    try:
        lot_sold = db_utils.query_item(LotSold, lot_id)
        buy_avg_price = (
            Stock.query.options(load_only(Stock.avg_price))
            .filter_by(id=lot_sold.stock_id)
            .one()
            .avg_price
        )
        sold_unit_price = lot_sold.unit_price
        sold_units = lot_sold.units
        realised = sold_units * (sold_unit_price - (buy_avg_price or 0))
        return realised
    except Exception as e:
        utils.debug_exception(e)


# ==============================================================================
# Stock Calculations
# ==============================================================================


def calc_stock(stock_id: int):
    """Calculates stock table columns using Stock, StockPage and Lots"""

    try:
        # get current stock price
        _, stock_page = db_utils.query_with_join(
            Stock, stock_id, [StockPage], [Stock, StockPage]
        )
        current_price = stock_page.price

        # get calculated metrics for the stock row
        units_bought, total_price = (
            LotBought.query.filter(LotBought.stock_id == stock_id)
            .with_entities(
                func.sum(LotBought.units),
                func.sum(LotBought.units * LotBought.unit_price),
            )
            .one()
        )
        units_bought = units_bought or 0
        # get number of units sold, default 0 if none sold yet
        units_sold = (
            LotSold.query.with_entities(func.sum(LotSold.units))
            .filter(LotSold.stock_id == stock_id)
            .scalar()
        ) or 0

        # carry out calculations for avg_price, gain, perc_gain
        avg_price = None
        units_held = 0
        gain = None
        perc_gain = None
        value = None
        with suppress(TypeError, ZeroDivisionError):
            avg_price = total_price / units_bought
            units_held = units_bought - units_sold
            value = units_held * current_price
            gain = (current_price - avg_price) * units_held
            perc_gain = gain / (units_held * avg_price) * 100

        return avg_price, gain, perc_gain, value
    except Exception as e:
        utils.debug_exception(e)


# ==============================================================================
# Portfolio Calculations
# ==============================================================================
def calc_portfolio(portfolio_id: int):
    """Calculations for Portfolio table using Stock table data"""
    try:
        # get calculated metrics for the portfolio
        stock_count, value, gain = (
            Stock.query.with_entities(
                func.count(), func.sum(Stock.value), func.sum(Stock.gain)
            )
            .filter(Stock.portfolio_id == portfolio_id)
            .one()
        )
        # separate query for change as it requires join
        change = (
            Stock.query.join(LotBought)
            .filter(Stock.portfolio_id == portfolio_id)
            .with_entities(func.sum(LotBought.change))
            .scalar()
        )

        # attempt to calculate; leave as None if error
        perc_change = None
        perc_gain = None
        with suppress(TypeError, ZeroDivisionError):
            perc_change = change / value * 100
            perc_gain = gain / value * 100

        return stock_count, value, change, gain, perc_change, perc_gain
    except Exception as e:
        utils.debug_exception(e)


# ==============================================================================
# Summary Banner Calculations
# ==============================================================================
def calc_summary():
    """Calculations for Performance Summary Banner using portfolio table data"""
    try:
        value, change, gain = (
            Portfolio.query.with_entities(
                func.sum(Portfolio.value),
                func.sum(Portfolio.change),
                func.sum(Portfolio.gain),
            )
            .filter(Portfolio.user_id == current_user.id)
            .one()
        )
        holdings = value
        # attempt to calculate; leave as None if error
        today = None
        overall = None
        with suppress(TypeError, ZeroDivisionError):
            today = change / holdings * 100
            overall = gain / holdings * 100

        return holdings, today, overall

    except Exception as e:
        utils.debug_exception(e)
