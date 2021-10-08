from typing import List, Union

from app import db
from app.models.schema import LotBought, LotSold, Portfolio, Stock, User
from flask_login import current_user
from sqlalchemy import func

# ==============================================================================
# Helper/Shared DB Utils
# ==============================================================================


def insert_row(new_row: Union[Portfolio, Stock, User, LotBought, LotSold]) -> bool:
    """Commit a new database SQLA object (i.e a row), returns success bool"""
    try:
        db.session.add(new_row)
        db.session.commit()
        return True
    except:
        return False


def to_dict(object, keep_date=False):
    """Converts query result object to dict form for easier jsonification
    Use keep_date to retain last_updated timestamp
    """
    _dict = {}
    for key in object.__mapper__.c.keys():
        if key != "last_updated" or keep_date:
            _dict[key] = getattr(object, key)
    return _dict


# ==============================================================================
# User DB Utils
# ==============================================================================


def query_user(email: str) -> Union[User, None]:
    """Query a user from the database by email, returns query result or None
    Emails are unique, so .one() ensures error thrown if >1 result
    """
    try:
        user = User.query.filter(func.lower(User.email) == func.lower(email)).one()
        return user
    except:
        return False


# ==============================================================================
# Portfolio DB Utils
# ==============================================================================


def query_portfolio_all() -> Union[List[Portfolio], None]:
    """Query a portfolio from the database by user_id, returns query result or None"""
    portfolios_list = Portfolio.query.filter(Portfolio.user_id == current_user.id).all()
    return portfolios_list


def update_portfolio(id: int, target_col: str, new_value: Union[int, str, float]) -> bool:
    """Update portfolio column on database, returns success bool"""
    try:
        portfolio = Portfolio.query.filter(Portfolio.id == id).one()
        setattr(portfolio, target_col, new_value)  # updates target_col
        db.session.commit()
        return True
    except:
        return False


def delete_portfolio(id: int):
    """Delete portfolio from database, returns success bool"""
    try:
        portfolio = Portfolio.query.filter(Portfolio.id == id).one()
        db.session.delete(portfolio)
        db.session.commit()
        return True
    except:
        return False


# ==============================================================================
# Stock DB Utils
# ==============================================================================


def query_portfolio_stocks(portfolio_id: int) -> Union[List[Stock], None]:
    """Query a portfolio's stocks from the database, returns query result or None"""
    portfolios_list = Stock.query.filter(
        Stock.user_id == current_user.id, Stock.portfolio_id == portfolio_id
    ).all()
    return portfolios_list


def update_stock(id: int, target_col: str, new_value: Union[int, str, float]) -> bool:
    """Update stock column on database, returns success bool"""
    try:
        stock = Stock.query.filter(Stock.id == id).one()
        setattr(stock, target_col, new_value)  # updates target_col
        db.session.commit()
        return True
    except:
        return False


def delete_stock(id: int):
    """Delete stock from database, returns success bool"""
    try:
        stock = Stock.query.filter(Stock.id == id).one()
        db.session.delete(stock)
        db.session.commit()
        return True
    except:
        return False


# ==============================================================================
# Lot DB Utils
# ==============================================================================


# XXX: for debug
# except Exception as e:
# print(
#     f"{type(e).__name__} at line {e.__traceback__.tb_lineno} of {__file__}: {e}"
# )
