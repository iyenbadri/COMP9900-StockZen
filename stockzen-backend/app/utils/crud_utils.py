from typing import Union

from app.models.schema import Portfolio, Stock, User
from app.utils.enums import Status
from flask_login import current_user

from . import db_utils as db

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
        db.insert_item(new_user)
        return Status.SUCCESS
    except:
        return Status.FAIL


# ==============================================================================
# Portfolio Utils
# ==============================================================================


def get_portfolio_list() -> Status:
    """Get user's portfolios from database, return item or success status"""
    try:
        sqla_list = db.query_all(Portfolio)
        dict_list = [to_dict(obj) for obj in sqla_list]
        return dict_list
    except:
        return Status.FAIL


def add_portfolio(portfolio_name: str) -> Status:
    """Add a portfolio to the database, return success status"""
    new_portfolio = Portfolio(
        user_id=current_user.id,
        portfolio_name=portfolio_name,
    )
    try:
        db.insert_item(new_portfolio)
        return Status.SUCCESS
    except:
        return Status.FAIL


def fetch_portfolio(portfolio_id: int) -> Union[Portfolio, Status]:
    """Get existing portfolio by id, return item or success status"""
    try:
        sqla_item = db.query_item(Portfolio, portfolio_id)
        return to_dict(sqla_item)
    except:
        return Status.FAIL


def update_portfolio_name(portfolio_id: int, new_name: str) -> Status:
    """Update existing portfolio name, return success status"""
    try:
        db.update_item(Portfolio, portfolio_id, "portfolio_name", new_name)
        return Status.SUCCESS
    except:
        return Status.FAIL


def delete_portfolio(portfolio_id: int) -> Status:
    """Delete existing portfolio by id, return success status"""
    try:
        db.delete_item(Portfolio, portfolio_id)
        return Status.SUCCESS
    except:
        return Status.FAIL


# ==============================================================================
# Stock Utils
# ==============================================================================


def get_stock_list(portfolio_id: int) -> Status:
    """Get portfolio stocks from database, return success status"""
    try:
        sqla_list = db.query_all(Stock, **{"portfolio": portfolio_id})
        dict_list = [to_dict(obj) for obj in sqla_list]
        return dict_list
    except:
        return Status.FAIL


def add_stock(portfolio_id: int, stock_page_id: int) -> Status:
    """Add a stock to the database, return success status"""
    new_stock = Stock(
        user_id=current_user.id, portfolio_id=portfolio_id, stock_page_id=stock_page_id
    )
    try:
        db.insert_item(new_stock)
        return Status.SUCCESS
    except:
        return Status.FAIL


def fetch_stock(stock_id: int) -> Union[Stock, Status]:
    """Get existing stock by id, return item or success status"""
    try:
        sqla_item = db.query_item(Stock, stock_id)
        return to_dict(sqla_item)
    except:
        return Status.FAIL


def delete_stock(stock_id: int) -> Status:
    """Delete existing stock by id, return success status"""
    try:
        db.delete_item(Stock, stock_id)
        return Status.SUCCESS
    except:
        return Status.FAIL


# ==============================================================================
# Lot Utils
# ==============================================================================
