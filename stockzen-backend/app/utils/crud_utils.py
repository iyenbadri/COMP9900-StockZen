from app.models.schema import Portfolio, Stock
from app.utils.enums import Response
from flask_login import current_user

from . import db_utils as db

# TODO: Refactor all similar functions, to be decoupled, maybe remove some crud utils
#       and use db utils directly in APIs - additional complexity not needed

# ==============================================================================
# Portfolio Utils
# ==============================================================================


def get_portfolio_list() -> Response:
    """Get user's portfolios from database, return response status"""
    raw_list = db.query_portfolio_all()
    dict_list = [db.to_dict(obj) for obj in raw_list]
    return dict_list


def add_portfolio(portfolio_name: str) -> Response:
    """Add a portfolio to the database, return response status"""
    new_portfolio = Portfolio(
        user_id=current_user.id,
        portfolio_name=portfolio_name,
    )
    if db.insert_row(new_portfolio):
        return Response.PORTFOLIO_ADDED
    else:
        return Response.PORTFOLIO_NOT_ADDED


def update_portfolio_name(portfolio_id: int, new_name: str) -> Response:
    """Update existing portfolio name, return response status"""
    if db.update_portfolio(portfolio_id, "portfolio_name", new_name):
        return Response.PORTFOLIO_UPDATED
    else:
        return Response.PORTFOLIO_NOT_UPDATED


def delete_portfolio(portfolio_id: int) -> Response:
    """Delete existing portfolio by id, return response status"""

    if db.delete_portfolio(portfolio_id):
        return Response.PORTFOLIO_DELETED
    else:
        return Response.PORTFOLIO_NOT_DELETED


# ==============================================================================
# Stock Utils
# ==============================================================================


def get_stock_list(portfolio_id: int) -> Response:
    """Get portfolio stocks from database, return response status"""
    raw_list = db.query_portfolio_stocks(portfolio_id)
    dict_list = [db.to_dict(obj) for obj in raw_list]
    return dict_list


def add_stock(portfolio_id: str, stock_page_id: int) -> Response:
    """Add a stock to the database, return response status"""
    new_stock = Stock(
        user_id=current_user.id, portfolio_id=portfolio_id, stock_page_id=stock_page_id
    )
    if db.insert_row(new_stock):
        return Response.STOCK_ADDED
    else:
        return Response.STOCK_NOT_ADDED


def delete_stock(stock_id: int) -> Response:
    """Delete existing stock by id, return response status"""
    if db.delete_stock(stock_id):
        return Response.STOCK_DELETED
    else:
        return Response.STOCK_NOT_DELETED


# ==============================================================================
# Lot Utils
# ==============================================================================
