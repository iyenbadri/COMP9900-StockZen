import os
from typing import List, Optional, TypeVar, Union

from app import db
from app.models.schema import LotBought, LotSold, Portfolio, Stock, StockPage, User
from flask_login import current_user
from sqlalchemy import asc, func, or_

DatabaseObj = TypeVar(
    "DatabaseObj", Portfolio, Stock, User, LotBought, LotSold, StockPage
)

# ==============================================================================
# Helpers
# ==============================================================================


def debug_exception(error):
    if os.environ.get("FLASK_ENV") == "development":
        print(
            f"{type(error).__name__} at line {error.__traceback__.tb_lineno} of {__file__}: {error}"
        )
    raise error


# ==============================================================================
# Shared DB Utils
# ==============================================================================


def query_item(table: DatabaseObj, item_id: int, **filters) -> Optional[DatabaseObj]:
    """Query a database table using item id, returns query item or None
    **filters is of form **{col_type: id}; e.g. {"portfolio": 1}
    """
    try:
        queries = [table.id == item_id, table.user_id == current_user.id]
        print(queries)
        for col_type, id in filters.items():
            queries.append(getattr(table, f"{col_type}_id") == id)
        item = table.query.filter(*queries).one()
        return item
    except Exception as e:
        debug_exception(e)


def query_all(table: DatabaseObj, **filters: int) -> Optional[List[DatabaseObj]]:
    """Query a database table using item parent, returns list of query items or None
    **filters is of form **{col_type: id}; e.g. {"portfolio": 1}
    """
    try:
        queries = [table.user_id == current_user.id]
        for col_type, id in filters.items():
            queries.append(getattr(table, f"{col_type}_id") == id)
        item_list = table.query.filter(*queries).all()
        return item_list
    except Exception as e:
        debug_exception(e)


def insert_item(new_row: DatabaseObj) -> None:
    """Commit a new database DB object (a row), throws exception on fail"""
    try:
        db.session.add(new_row)
        db.session.commit()
    except Exception as e:
        debug_exception(e)


def update_item(
    table: DatabaseObj,
    item_id: int,
    target_col: str,
    new_value: Union[int, str, float],
    **filters: int,
) -> None:
    """Update table column, throws exception on fail"""
    try:
        item = query_item(table, item_id, **filters)
        setattr(item, target_col, new_value)  # updates target_col
        db.session.commit()
    except Exception as e:
        debug_exception(e)


def delete_item(table: DatabaseObj, item_id: int, **filters: int) -> None:
    """Delete item from database, throws exception on fail
    **filters is of form **{col_type: id}; e.g. {"portfolio": 1}
    """
    try:
        item = query_item(table, item_id, **filters)
        db.session.delete(item)
        db.session.commit()
    except Exception as e:
        debug_exception(e)


# ==============================================================================
# User DB Utils
# ==============================================================================


def query_user(email: str) -> Optional[User]:
    """Query a user from the database by email, returns query result or None.
    Emails are unique, so .one() ensures error thrown if >1 result
    """
    try:
        user = User.query.filter(func.lower(User.email) == func.lower(email)).one()
        return user
    except Exception as e:
        debug_exception(e)


# ==============================================================================
# Stock Pages DB Utils
# ==============================================================================


def query_stock_pages(search_string: str):
    try:
        stocks = (
            StockPage.query.filter(
                or_(
                    StockPage.stock_name.ilike(search_string + "%"),
                    StockPage.code.ilike(search_string + "%"),
                )
            )
            .order_by(StockPage.code.asc(), StockPage.stock_name.asc())
            .limit(30)
            .all()
        )
        return stocks
    except Exception as e:
        debug_exception(e)
