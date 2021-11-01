from app.models.schema import LotBought, LotSold, Stock, StockPage
from app.utils import db_utils as utils
from app.utils.enums import Status
from sqlalchemy.orm import load_only
from sqlalchemy.sql import func

# ==============================================================================
# Stock Updates in Portfolio Calculations
# ==============================================================================


def calc_stock_data(stock_id: int):
    """Calculates stock table columns using Stock and stockpage table"""
    try:
        sqla_tuples = utils.query_with_join(
            main_table=Stock,
            item_id=stock_id,
            join_tables=[StockPage],
            columns=[Stock, StockPage],
        )
        current_price = sqla_tuples[1].price
        avg_price = (
            LotBought.query.with_entities(func.avg(LotBought.unit_price))
            .filter(LotBought.stock_id == stock_id)
            .one()
        )[0]
        units_bought = (
            LotBought.query.with_entities(func.sum(LotBought.units))
            .filter(LotBought.stock_id == stock_id)
            .one()
        )[0]
        value = (
            LotBought.query.with_entities(func.sum(LotBought.value))
            .filter(LotBought.stock_id == stock_id)
            .one()
        )[0]
        change = (
            LotBought.query.with_entities(func.sum(LotBought.change))
            .filter(LotBought.stock_id == stock_id)
            .one()
        )[0]
        units_sold = (
            LotSold.query.with_entities(func.avg(LotSold.units))
            .filter(LotSold.stock_id == stock_id)
            .one()
        )[0]
        units_held = units_bought - units_sold
        gain = (current_price - avg_price) * units_held
        perc_gain = gain / (units_held * avg_price)
        return avg_price, units_held, gain, perc_gain, value, change
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


# ==============================================================================
# Portfolio Updates Calculations
# ==============================================================================
def calc_portfolio_data(portfolio_id: int):
    """Calculations for Portfolio table using Stock table data"""
    try:
        stock_count = len(
            Stock.query.options(load_only(Stock.portfolio_id))
            .filter_by(portfolio_id=portfolio_id)
            .all()
        )
        value = (
            Stock.query.with_entities(func.sum(Stock.value))
            .filter_by(portfolio_id=portfolio_id)
            .one()
        )[0]
        change = (
            Stock.query.with_entities(func.sum(Stock.change))
            .filter_by(portfolio_id=portfolio_id)
            .one()
        )[0]
        gain = (
            Stock.query.with_entities(func.sum(Stock.gain))
            .filter_by(portfolio_id=portfolio_id)
            .one()
        )[0]
        perc_change = 1
        perc_gain = 1
        return stock_count, value, change, gain, perc_change, perc_gain
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


# ==============================================================================
# Lot Update Calculations
# ==============================================================================
def calc_lot_data(lot_id: int):
    """Lot bought Calculations to return value and change amounts"""
    try:
        lot = utils.query_item(LotBought, lot_id)
        stock_page_id = (
            Stock.query.options(load_only(Stock.stock_page_id))
            .filter_by(id=lot.stock_id)
            .one()
            .stock_page_id
        )
        stockpage = utils.query_item(StockPage, stock_page_id)
        units = lot.units
        current_price = stockpage.price
        daily_change = stockpage.change
        value = units * current_price
        change = units * daily_change
        return value, change
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def calc_lot_sold(lot_id: int):
    """Calculates profit/loss from the sold stock as realised"""
    try:
        lot_sold = utils.query_item(LotSold, lot_id)
        buy_avg_price = (
            Stock.query.options(load_only(Stock.avg_price))
            .filter_by(id=lot_sold.stock_id)
            .one()
            .avg_price
        )
        sold_unit_price = lot_sold.unit_price
        sold_units = lot_sold.units
        realised = sold_units * (sold_unit_price - buy_avg_price)
        return realised
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL
