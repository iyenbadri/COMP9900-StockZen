import json
from datetime import datetime, timedelta
from typing import Dict, Mapping, Sequence, Union

import app.utils.calc_utils as calc
from app.config import N_TOP_PERFORMERS, TOP_STOCKS_INTERVAL
from app.models.schema import (
    Challenge,
    ChallengeEntry,
    History,
    LotBought,
    LotSold,
    Portfolio,
    Stock,
    StockPage,
    User,
)
from app.utils.enums import LotType, Status
from flask_login import current_user
from sqlalchemy import desc, func
from sqlalchemy.orm import load_only

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
                value = getattr(object, key)
                if type(value) == datetime:
                    value = parse_date_str(value)
                tmp_dict[key] = value

        return tmp_dict
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def parse_date_str(date: datetime) -> str:
    return date.date()


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
    except Exception as e:
        utils.debug_exception(e, suppress=True)
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
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def reorder_portfolio_list(new_portfolio_orders: Sequence[Mapping[str, int]]) -> Status:
    """Update portfolio list ordering on the database"""
    try:
        reorder_rows(Portfolio, new_portfolio_orders)
        return Status.SUCCESS
    except Exception as e:
        utils.debug_exception(e, suppress=True)
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
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def fetch_portfolio(portfolio_id: int) -> Union[Portfolio, Status]:
    """Get existing portfolio by id, return item or success status"""
    try:
        sqla_item = db_utils.query_item(Portfolio, portfolio_id)
        return to_dict(sqla_item)
    except Exception as e:
        utils.debug_exception(e, suppress=True)
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
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def delete_portfolio(portfolio_id: int) -> Status:
    """Delete existing portfolio by id, return success status"""
    try:
        db_utils.delete_item(Portfolio, portfolio_id)
        return Status.SUCCESS
    except Exception as e:
        utils.debug_exception(e, suppress=True)
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
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def reorder_stock_list(
    portfolio_id: int, new_stock_orders: Sequence[Mapping[str, int]]
) -> Status:
    """Update stock list ordering on the database"""
    try:
        reorder_rows(Stock, new_stock_orders, **{"portfolio": portfolio_id})
        return Status.SUCCESS
    except Exception as e:
        utils.debug_exception(e, suppress=True)
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
    except Exception as e:
        utils.debug_exception(e, suppress=True)
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
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def delete_stock(stock_id: int) -> Status:
    """Delete existing stock by id, return success status"""
    try:
        db_utils.delete_item(Stock, stock_id)
        return Status.SUCCESS
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


# ==============================================================================
# Stock Page Utils
# ==============================================================================


def update_stock_page(stock_page_id: int) -> Status:
    """Update a stock page on the database, return success status"""
    try:
        sym = utils.id_to_code(stock_page_id)
        print(f"Fetching stock: {sym}")

        price, change, perc_change, prev_close, info = api.fetch_stock_data(sym)

        # force fail if price is None so that we don't overwrite last good value
        if not price:
            raise ValueError("Stock price not found, aborting stock_page update")

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
    except Exception as e:
        # still need to update timestamp if fail so that min interval will skip this row
        db_utils.update_item_columns(
            StockPage, stock_page_id, {"last_updated": datetime.now()}
        )
        utils.debug_exception(e, suppress=True)
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

    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def fetch_stock_history(stock_page_id: int, period: str = "1y") -> Union[Dict, Status]:
    """Get stock history from the database, return item dict or fail status"""
    try:
        # use stock symbol to query yfinance api
        sym = utils.id_to_code(stock_page_id)
        history_dicts = api.fetch_historical_data(sym, period)

        # Get data from cache if failed to fetch, otherwise save fresh data and return
        if history_dicts == Status.FAIL:
            sqla_items = db_utils.query_all(History, **{"stock_page": stock_page_id})
            if len(sqla_items) == 0:
                raise LookupError("No history data found in cache")
            history_dicts = [json.loads(sqla_item.history) for sqla_item in sqla_items]
        else:
            # delete old cache and insert new items
            # TODO: currently not optimised - will need to revisit
            db_utils.delete_items(History, **{"stock_page": stock_page_id})
            for dict in history_dicts:
                history = History(stock_page_id=stock_page_id, history=json.dumps(dict))
                db_utils.insert_item(history)

        # add stock_page_id to each dict then return
        history_dicts = [
            {"stock_page_id": stock_page_id, **dict} for dict in history_dicts
        ]
        return history_dicts
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def fetch_top_stocks() -> Union[Dict, Status]:
    """Get top performing stocks from database and return dict list"""
    try:
        # Return N top performing stocks
        # Only consider recent updates
        min_timestamp = datetime.now() - timedelta(seconds=TOP_STOCKS_INTERVAL)
        sqla_list = (
            StockPage.query.options(
                load_only(
                    StockPage.id,
                    StockPage.code,
                    StockPage.price,
                    StockPage.perc_change,
                    StockPage.last_updated,
                )
            )
            .filter(StockPage.last_updated > min_timestamp)
            .order_by(StockPage.perc_change.desc())
            .limit(N_TOP_PERFORMERS)
            .all()
        )
        dict_list = [to_dict(obj) for obj in sqla_list]
        return dict_list
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


# ==============================================================================
# Lot Utils
# ==============================================================================
def get_lot_list(type: LotType, stock_id: int) -> Union[Dict, Status]:
    """Get stock lots from database, return success status"""
    try:
        # assign table var according to type of buy/sell
        table = LotBought if type == LotType.BUY else LotSold

        sqla_list = db_utils.query_all(table, **{"stock": stock_id})
        dict_list = [to_dict(obj) for obj in sqla_list]
        return dict_list
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def add_lot(
    type: LotType, stock_id: int, trade_date: datetime, units: int, unit_price: float
) -> Status:
    """Add a Lot to the database, return success status
    :param type: is either "buy" or "sell"
    """
    try:
        if type == LotType.BUY:
            lot = LotBought(
                user_id=current_user.id,
                stock_id=stock_id,
                trade_date=trade_date,
                units=units,
                unit_price=unit_price,
            )
        elif type == LotType.SELL:
            lot = LotSold(
                user_id=current_user.id,
                stock_id=stock_id,
                trade_date=trade_date,
                units=units,
                unit_price=unit_price,
                amount=units * unit_price,
            )
        else:
            raise ValueError("Incorrect type provided")

        db_utils.insert_item(lot)
        return Status.SUCCESS

    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def delete_lot(type: LotType, lot_id: int) -> Status:
    """Delete existing lot by id, return success status"""
    try:
        table = LotBought if type == LotType.BUY else LotSold

        db_utils.delete_item(table, lot_id)
        return Status.SUCCESS
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def fetch_lot(type: LotType, lot_id: int) -> Union[Dict, Status]:
    """Get existing lot by id, return item or success status"""
    try:
        table = LotBought if type == LotType.BUY else LotSold

        sqla_item = db_utils.query_item(table, lot_id)
        return to_dict(sqla_item)
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


# ==============================================================================
# Search Utils
# ==============================================================================


def search_stock(stock_query: str) -> Status:
    """Search for stocks by similar name/code, return success status"""
    try:
        stock_list = db_utils.search_query(stock_query)
        return stock_list
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


# ==============================================================================
# Summary Utils
# ==============================================================================
def get_performance_summary() -> Status:
    """Get performance summary banner data for this user"""
    holdings, today, overall = calc.calc_summary()

    return {"holdings": holdings, "today": today, "overall": overall}


# ==============================================================================
# Challenge Utils
# ==============================================================================


def get_leaderboard_results() -> Union[Dict, Status]:
    """Return dict list of best performing user portfolios during current challenge period"""
    try:
        leaderboard = []
        prev_challenge_id, _ = utils.get_prev_challenge()

        if not prev_challenge_id:
            return Status.NOT_EXIST

        # Get a ranked list of users and their avg perc_changes
        result_tuples = (
            ChallengeEntry.query.join(Challenge)
            .filter(Challenge.id == prev_challenge_id)
            .with_entities(
                ChallengeEntry.user_id,
                func.avg(ChallengeEntry.perc_change).label("avg_change"),
            )
            .group_by(ChallengeEntry.user_id)
            .order_by(desc("avg_change"))
            .limit(10)  # max of 10 results
            .all()
        )

        # Append each user's stock codes to the results
        for user_id, avg_change in result_tuples:
            stock_codes = (
                ChallengeEntry.query.join(Challenge)
                .filter(
                    Challenge.id == prev_challenge_id, ChallengeEntry.user_id == user_id
                )
                .order_by(ChallengeEntry.perc_change.desc())
                .with_entities(ChallengeEntry.code)
                .all()
            )

            stock_codes = [tuple[0] for tuple in stock_codes]
            leaderboard.append(
                {
                    "user_id": user_id,
                    "perc_change": avg_change,
                    "stock_codes": stock_codes,
                }
            )
        return leaderboard
    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL
