import json
from datetime import datetime
from typing import Dict, Mapping, Sequence, Union

from app.models.schema import Portfolio, Stock, StockPage, User
from app.utils.enums import Status
from flask_login import current_user

from . import api_utils as api
from . import db_utils, utils

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


def reorder_rows(
    table: db_utils.DatabaseObj, new_orders: Sequence[Mapping[str, int]], **filters
):
    """Update row ordering on the database"""
    # loop through json dict list and update each row order
    for item in new_orders:
        id = item["id"]
        item = item["order"]
        db_utils.update_item_columns(table, id, {"order": item}, **filters)


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
        reorder_rows(Portfolio, new_portfolio_orders)
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
            Portfolio,
            portfolio_id,
            {"portfolio_name": new_name, "last_updated": datetime.now()},
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
            # the order of dicts is important: we want stock to override same-named
            # columns from stock_page, e.g. id
            {**to_dict(stock_page), **to_dict(stock)}
            for stock, stock_page in sqla_tuples
        ]
        return dict_list
    except:
        return Status.FAIL


def reorder_stock_list(
    portfolio_id: int, new_stock_orders: Sequence[Mapping[str, int]]
) -> Status:
    """Update stock list ordering on the database"""
    try:
        reorder_rows(Stock, new_stock_orders, **{"portfolio": portfolio_id})
        return Status.SUCCESS
    except:
        return Status.FAIL


def add_stock(portfolio_id: int, stock_page_id: int) -> Status:
    """Add a stock to the database, return success status"""
    try:
        # do not allow stock to be added if not in stock_pages
        # .one() will throw an error
        StockPage.query.filter_by(id=stock_page_id).one()

        new_stock = Stock(
            user_id=current_user.id,
            portfolio_id=portfolio_id,
            stock_page_id=stock_page_id,
        )

        db_utils.insert_item(new_stock)
        return Status.SUCCESS
    except:
        return Status.FAIL


def fetch_stock(stock_id: int) -> Union[Stock, Status]:
    """Get existing stock by id, return item or success status"""
    try:
        sqla_tuple = db_utils.query_with_join(
            Stock, stock_id, [StockPage], [Stock, StockPage]
        )
        stock_dict, stock_page_dict = map(to_dict, sqla_tuple)

        # the order of dicts is important: we want stock to override same-named
        # columns from stock_page, e.g. id
        return {**stock_page_dict, **stock_dict}
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


def update_stock_page(stock_page_id: int) -> Status:
    """Update a stock page on the database, return success status"""
    try:
        sym = utils.id_to_code(stock_page_id)
        price, change, perc_change, prev_close, info = api.fetch_stock_data(sym)
        info_json = json.dumps(info)  # store info as serialised json string

        db_utils.update_item_columns(
            StockPage,
            stock_page_id,
            {
                "price": price,
                "change": change,
                "perc_change": perc_change,
                "prev_close": prev_close,
                "info": info_json,
                "last_updated": datetime.now(),  # update with current timestamp
            },
        )
        return Status.SUCCESS
    except:
        return Status.FAIL


def fetch_stock_page(stock_page_id: int) -> Union[Dict, Status]:
    """Get a stock page from the database, return item dict or fail status"""
    try:
        sqla_item = db_utils.query_item(StockPage, stock_page_id)
        item = to_dict(sqla_item)

        # need to deserialise info json and return combined dict
        info_json = item.pop("info")
        info = json.loads(info_json)

        return {**item, **info}

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
