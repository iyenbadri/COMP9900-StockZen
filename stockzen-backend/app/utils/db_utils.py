import os
from typing import Any, List, Mapping, NewType, Optional, Sequence, TypeVar, Union

from app import db
from app.models.schema import LotBought, LotSold, Portfolio, Stock, StockPage, User
from config import SEARCH_LIMIT
from flask_login import current_user
from sqlalchemy import func, or_
from sqlalchemy.orm import load_only
from sqlalchemy.sql.operators import collate

DatabaseObj = TypeVar(
    "DatabaseObj", Portfolio, Stock, User, LotBought, LotSold, StockPage
)
ColumnName = NewType("ColumnName", str)
ColumnVal = TypeVar("ColumnVal", int, str, float)

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
        filter_list = [table.id == item_id, table.user_id == current_user.id]
        print(filter_list)
        for col_type, id in filters.items():
            filter_list.append(getattr(table, f"{col_type}_id") == id)
        item = table.query.filter(*filter_list).one()
        return item
    except Exception as e:
        debug_exception(e)


def query_all(table: DatabaseObj, **filters) -> Optional[List[DatabaseObj]]:
    """Query a database table using item parent, returns list of query items or None
    **filters is of form **{col_type: id}; e.g. {"portfolio": 1}
    """
    try:
        filter_list = [table.user_id == current_user.id]
        for col_type, id in filters.items():
            filter_list.append(getattr(table, f"{col_type}_id") == id)
        item_list = table.query.filter(*filter_list).all()
        return item_list
    except Exception as e:
        debug_exception(e)


def query_all_with_join(
    main_table: DatabaseObj,
    join_tables: Sequence[DatabaseObj],
    columns: Sequence[Any],  # SQLA object or column
    **filters,
) -> Optional[List[DatabaseObj]]:
    """Query database tables with join, returns list of query items or None
    *columns are the required columns in the output
    **filters is of form **{col_type: id}; e.g. {"portfolio": 1}
    """
    try:
        filter_list = [main_table.user_id == current_user.id]
        for col_type, id in filters.items():
            filter_list.append(getattr(main_table, f"{col_type}_id") == id)

        item_list = (
            main_table.query.join(*join_tables)
            .with_entities(*columns)
            .filter(*filter_list)
            .all()
        )

        return item_list
    except Exception as e:
        debug_exception(e)


def insert_item(new_row: DatabaseObj) -> None:
    """Commit a new database DB object (a row), throws exception on fail"""
    try:
        db.session.add(new_row)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        debug_exception(e)


def update_item_columns(
    table: DatabaseObj,
    item_id: int,
    col_val_pairs: Mapping[ColumnName, ColumnVal],
    **filters: int,
) -> None:
    """Update table column, throws exception on fail
    :param col_val_pairs is a dict of column names:values to be updated"""
    try:
        item = query_item(table, item_id, **filters)
        for target_col, new_value in col_val_pairs.items():
            setattr(item, target_col, new_value)  # updates target_col
        db.session.commit()
    except Exception as e:
        db.session.rollback()
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
        db.session.rollback()
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


def search_query(search_string: str):
    """Query for stocks by name/code, returns list of query results or None."""
    try:
        # defer loading of all irrelevant columns
        search_cols = ["id", "code", "stock_name"]

        results_list = (
            StockPage.query.options(load_only(*search_cols))
            .filter(
                or_(
                    StockPage.code.ilike(f"{search_string}%"),
                    StockPage.stock_name.ilike(f"%{search_string}%"),
                )
            )
            .order_by(
                # case-insensitive ascending order
                collate(StockPage.code, "NOCASE").asc(),
                collate(StockPage.stock_name, "NOCASE").asc(),
            )
            .limit(SEARCH_LIMIT)  # configurable in config.py
            .all()
        )
        return results_list
    except Exception as e:
        debug_exception(e)
