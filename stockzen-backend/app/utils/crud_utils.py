from typing import Mapping, Sequence, Union

import numpy as np
import pandas as pd
from app import db
from app.models.schema import Portfolio, Stock, StockPage, User
from app.utils.enums import Status
from flask_login import current_user
from sqlalchemy.orm import load_only

from . import api_utils as api
from . import db_utils

# ==============================================================================
# Helpers
# ==============================================================================


def to_dict(object, timestamp=False) -> Union[dict, Status]:
    """Converts query result object to dict form for easier jsonification
    Use :param timestamp to retain last_updated timestamp
    """
    try:
        tmp_dict = {}
        for key in object.__mapper__.c.keys():
            if key != "last_updated" or timestamp:
                tmp_dict[key] = getattr(object, key)
        return tmp_dict
    except:
        return Status.FAIL


# ==============================================================================
# User Utils
# ==============================================================================


def add_user(email: str, first_name: str, last_name: str, plain_password: str) -> Status:
    """Add a user to the database, return success status"""
    new_user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
    new_user.set_password(plain_password)  # carry out hash and save to user object

    try:
        db_utils.insert_item(new_user)
        return Status.SUCCESS
    except:
        return Status.FAIL


# ==============================================================================
# Portfolio Utils
# ==============================================================================


def get_portfolio_list() -> Status:
    """Get user's portfolios from database, return item or success status"""
    try:
        sqla_list = db_utils.query_all(Portfolio)
        dict_list = [to_dict(obj) for obj in sqla_list]
        return dict_list
    except:
        return Status.FAIL


def reorder_portfolio_list(new_portfolio_orders: Sequence[Mapping[str, int]]) -> Status:
    """Update portfolio list ordering on the database"""
    try:
        # loop through json dict list and update each row order
        for portfolio in new_portfolio_orders:
            portfolio_id = portfolio["id"]
            order = portfolio["order"]
            db_utils.update_item_columns(Portfolio, portfolio_id, {"order": order})

        return Status.SUCCESS
    except:
        return Status.FAIL


def add_portfolio(portfolio_name: str) -> Status:
    """Add a portfolio to the database, return success status"""
    new_portfolio = Portfolio(
        user_id=current_user.id,
        portfolio_name=portfolio_name,
    )
    try:
        db_utils.insert_item(new_portfolio)
        return Status.SUCCESS
    except:
        return Status.FAIL


def fetch_portfolio(portfolio_id: int) -> Union[Portfolio, Status]:
    """Get existing portfolio by id, return item or success status"""
    try:
        sqla_item = db_utils.query_item(Portfolio, portfolio_id)
        return to_dict(sqla_item)
    except:
        return Status.FAIL


def update_portfolio_name(portfolio_id: int, new_name: str) -> Status:
    """Update existing portfolio name, return success status"""
    try:
        db_utils.update_item_columns(
            Portfolio, portfolio_id, {"portfolio_name": new_name}
        )
        return Status.SUCCESS
    except:
        return Status.FAIL


def delete_portfolio(portfolio_id: int) -> Status:
    """Delete existing portfolio by id, return success status"""
    try:
        db_utils.delete_item(Portfolio, portfolio_id)
        return Status.SUCCESS
    except:
        return Status.FAIL


# ==============================================================================
# Stock Utils
# ==============================================================================


def get_stock_list(portfolio_id: int) -> Status:
    """Get portfolio stocks from database, return success status"""
    try:
        sqla_tuples = db_utils.query_all_with_join(
            main_table=Stock,
            join_tables=[StockPage],
            columns=[Stock, StockPage],
            **{"portfolio": portfolio_id},
        )
        dict_list = [
            {
                **to_dict(stock),
                "code": stock_page.code,
                "stock_name": stock_page.stock_name,
            }
            for stock, stock_page in sqla_tuples
        ]
        return dict_list
    except:
        return Status.FAIL


def add_stock(portfolio_id: int, stock_page_id: int) -> Status:
    """Add a stock to the database, return success status"""
    new_stock = Stock(
        user_id=current_user.id, portfolio_id=portfolio_id, stock_page_id=stock_page_id
    )
    try:
        db_utils.insert_item(new_stock)
        return Status.SUCCESS
    except:
        return Status.FAIL


def fetch_stock(stock_id: int) -> Union[Stock, Status]:
    """Get existing stock by id, return item or success status"""
    try:
        sqla_item = db_utils.query_item(Stock, stock_id)
        return to_dict(sqla_item)
    except:
        return Status.FAIL


def delete_stock(stock_id: int) -> Status:
    """Delete existing stock by id, return success status"""
    try:
        db_utils.delete_item(Stock, stock_id)
        return Status.SUCCESS
    except:
        return Status.FAIL


# ==============================================================================
# Stock Page Utils
# ==============================================================================
def symbol(conn):
    file = "symbol.csv"
    symbol = pd.read_csv(file)
    symbols = symbol[["code", "stock_name", "exchange"]]
    symbols.to_sql("stock_pages", conn, if_exists="fail", index=False)
    conn.commit()


def update_stock_page(stock_id: int):
    stock = (
        StockPage.query.options(load_only(StockPage.code)).filter_by(id=stock_id).one()
    )
    sym = stock.code
    print(sym)
    try:
        db_utils.update_item_columns(StockPage, stock_id, api.stockOverview(sym))
        return Status.SUCCESS
    except:
        return Status.FAIL


# TODO: rudimentary function for db population, needs updating
def add_stock_page(code: str, stock_name: str) -> Status:
    """Add a stock page to the database, return success status"""
    new_stock_page = StockPage(code=code, stock_name=stock_name)
    try:
        db_utils.insert_item(new_stock_page)
        return Status.SUCCESS
    except:
        return Status.FAIL


# ==============================================================================
# Lot Utils
# ==============================================================================
# TODO

# ==============================================================================
# Search Utils
# ==============================================================================


def search_stock(stock_query: str) -> Status:
    """Search for stocks by similar name/code, return success status"""
    try:
        stock_list = db_utils.search_query(stock_query)
        return stock_list
    except:
        return Status.FAIL
