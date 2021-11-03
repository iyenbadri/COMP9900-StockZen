from datetime import datetime

from app import db
from app.config import UPDATE_MIN_INTERVAL
from app.models.schema import LotBought, LotSold, Portfolio, Stock, StockPage
from app.utils import crud_utils, db_utils, utils
from app.utils.enums import LotType, Status
from sqlalchemy.orm import load_only
from sqlalchemy.sql import func


def cascade_updates(portfolio_id: int):
    """Update all of a user's portfolios with latest calculated data"""
    print("\n" + "#" * 30)
    print(f"Cascading updates for portfolio: {portfolio_id}")
    try:
        sqla_tuples = (
            Portfolio.query.join(Stock, Portfolio.id == Stock.portfolio_id)
            .join(StockPage, Stock.stock_page_id == StockPage.id)
            .with_entities(Stock, StockPage)
            .filter(Portfolio.id == portfolio_id)
            .all()
        )
    except Exception as e:
        utils.debug_exception(e)

    for stock, stock_page in sqla_tuples:
        try:
            print("\n" + "*" * 30)  #
            stock_id = stock.id
            stock_page_id = stock_page.id

            # Update Stock Page with data from yfinance, if fail try to use latest (cached) data
            try:
                # only need to fetch if the data is stale or timestamp is NULL (i.e. never been updated before)
                last_updated = db_utils.query_item(StockPage, stock_page_id).last_updated
                now = datetime.now()
                try:
                    elapsed = now - last_updated
                except:
                    pass  # let the if statement handle the error
                if not last_updated or elapsed.seconds > UPDATE_MIN_INTERVAL:
                    print(
                        f"Data for stock_page {stock_page_id} is stale: fetching from yfinance"
                    )
                    if crud_utils.update_stock_page(stock_page_id) == Status.FAIL:
                        raise ConnectionError(
                            f"Could not fetch latest data for stockPageId: {stock_page_id}, attempting to return from cache."
                        )
            except Exception as e:
                utils.debug_exception(e, suppress=True)

            # Raise error if cached data is also not available
            if not db_utils.query_item(StockPage, stock_page_id).price:
                raise RuntimeError(
                    f"Cached value for stockPageId: {stock_page_id} is not valid"
                )
            else:
                print(f"Fetched cached data for stockPageId: {stock_page_id}")

            # Cascade the updates from StockPage to Lots, Stock, Portfolio
            # 1. get all BUY lot_id's that correspond to the stock and update their calcs
            update_stock_lots(LotType.BUY, stock_id)
            # 2. get all SELL lot_id's that correspond to the stock and update their calcs
            update_stock_lots(LotType.SELL, stock_id)
            # 3. update stock calculations
            update_stock(stock_id)
            # 4. update portfolio calculations
            update_portfolio(portfolio_id)

        except Exception as e:
            utils.debug_exception(e, suppress=True)


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
    """Update a stock row with calculated data on the database, return success status"""
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
    """Update a portfolio on the database"""
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
        ) or 0
        sold_unit_price = lot_sold.unit_price
        sold_units = lot_sold.units
        realised = sold_units * (sold_unit_price - buy_avg_price)
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

        # get number of units bought, total price, and value
        units_bought, total_price, value = (
            LotBought.query.with_entities(
                func.sum(LotBought.units),
                func.sum(LotBought.units * LotBought.unit_price),
                func.sum(LotBought.value),
            )
            .filter(LotBought.stock_id == stock_id)
            .one()
        )
        # if no value, default to 0
        units_bought = units_bought or 0
        total_price = total_price or 0
        value = value or 0

        # get number of units sold
        units_sold = (
            LotSold.query.with_entities(func.sum(LotSold.units))
            .filter(LotSold.stock_id == stock_id)
            .scalar()
        ) or 0

        # carry out calculations for avg_price, gain, perc_gain
        try:
            avg_price = total_price / units_bought
        except Exception as e:
            print(f"Could not calculate avg_price, error: {e}. Setting avg_price = 0")
            avg_price = 0

        units_held = units_bought - units_sold
        gain = (current_price - avg_price) * units_held

        try:
            perc_gain = gain / (units_held * avg_price)
        except Exception as e:
            print(f"Could not calculate perc_gain, error: {e}. Setting perc_gain = 0")
            perc_gain = 0

        return avg_price, gain, perc_gain, value
    except Exception as e:
        utils.debug_exception(e)


# ==============================================================================
# Portfolio Calculations
# ==============================================================================
def calc_portfolio(portfolio_id: int):
    """Calculations for Portfolio table using Stock table data"""
    try:
        stock_count, value, change, gain = (
            Stock.query.with_entities(
                func.count(),
                func.sum(Stock.value),
                func.sum(StockPage.change),
                func.sum(Stock.gain),
            )
            .join(StockPage)
            .filter(Stock.portfolio_id == portfolio_id)
            .one()
        )
        perc_change = (change / value) or 0
        perc_gain = (gain / value) or 0

        return stock_count, value, change, gain, perc_change, perc_gain

    except Exception as e:
        utils.debug_exception(e)
