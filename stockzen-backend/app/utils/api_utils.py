from datetime import datetime, timedelta

import yfinance as yf
from app import db
from app.config import CHALLENGE_PERIOD, STALENESS_INTERVAL
from app.models.schema import ChallengeEntry, StockPage
from app.utils import api_utils, crud_utils, db_utils, utils
from app.utils.enums import Status
from flask import current_app
from pandas.core.frame import DataFrame

# ==============================================================================
# Importing Data from yfinance
# ==============================================================================


def fetch_time_series(
    sym: str,
    period: str = "max",
    interval: str = "1d",
    actions: bool = False,
    start: datetime = None,
    end: datetime = None,
) -> DataFrame:
    """Fetch Time Series for symbol asked"""
    try:
        stock = yf.Ticker(sym)
        return stock.history(
            period=period, interval=interval, start=start, end=end, actions=actions
        )
    except Exception as e:
        utils.debug_exception(e, suppress=True)


def fetch_stock_data(sym):
    """Fetches Information and calculations for Stock Page,
    returns price, change, perc_change, and an info dict
    """
    try:
        stock = yf.Ticker(sym)
        info = stock.info
        if not has_data(stock):
            raise RuntimeError(f"Stock details could not be fetched for {sym}")

        change, perc_change, price, prev_close = calc_change(sym, info)

        return price, change, perc_change, prev_close, info

    except Exception as e:
        utils.debug_exception(e)


def fetch_historical_data(sym, period):
    """Fetches historical data for Stock Page"""
    try:
        # get df of historical data from yfinance
        df = fetch_time_series(sym, period=period, actions=False)
        if len(df) == 0:
            raise RuntimeError("Stock history could not be fetched")

        df = df.reset_index(level=0)  # turn date index into real column
        df.columns = df.columns.str.lower()  # column names to lowercase
        df["date"] = df["date"].astype(str)  # convert timestamp to str for jsonificaiton

        # convert to dict list of daily records
        history_dicts = df.to_dict(orient="records")
        return history_dicts

    except Exception as e:
        # important to suppress so that cache can be accessed
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


# ==============================================================================
# Calculations for Portfolio
# ==============================================================================


def calc_change(
    sym: str,
    info: dict = None,
    period: str = "2d",
    interval: str = "1d",
    start=None,
    end=None,
):
    """Returns current price, change and change percentage"""
    try:
        try:
            price = info["regularMarketPrice"]
            prev_close = info["previousClose"]
        except:
            df_price = fetch_time_series(sym, period, interval, start=start, end=end)[
                "Close"
            ]

            price = df_price[-1]
            prev_close = df_price[0]
        finally:
            change = price - prev_close
            perc_change = change / prev_close * 100

            return change, perc_change, price, prev_close

    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


# ==============================================================================
# Helper
# ==============================================================================


def has_data(stock):
    return stock.info["regularMarketPrice"] is not None


# ------------------------------------------------------------------------------
# Bulk API Functions
# ------------------------------------------------------------------------------


def api_stock_request(stock_page_id: int, interval: str = STALENESS_INTERVAL):
    """Update Stock Page with data from yfinance, if fail try to use latest (cached) data
    :param: default interval is STALENESS_INTERVAL (90s), can also be TOP_STOCKS_INTERVAL (1hr)"""
    # Do not send API requests in testing mode
    if current_app.config["TESTING"]:
        return

    try:
        # only need to fetch if the data is stale or timestamp is NULL (i.e. never been updated before)
        last_updated = db_utils.query_item(StockPage, stock_page_id).last_updated
        try:
            elapsed = datetime.now() - last_updated
        except:
            pass  # let the if statement handle the error

        # Check if timestamp is NULL or data is stale
        if not last_updated or elapsed.seconds > interval:
            print(f"Data for stock_page {stock_page_id} is stale: fetching from yfinance")
            if crud_utils.update_stock_page(stock_page_id) == Status.FAIL:
                raise ConnectionError(
                    f"Could not fetch latest data for stockPageId: {stock_page_id}, attempting to return from cache."
                )
            else:
                print(f"Updated yfinance data for stockPageId: {stock_page_id}")
    except Exception as e:
        # Use cached data instead
        utils.debug_exception(e, suppress=True)
        print(f"Using cached data for stockPageId: {stock_page_id}")
    finally:
        # Raise error if price is still not available
        is_valid_price = db_utils.query_item(StockPage, stock_page_id).price
        if not is_valid_price:
            print(f"API & Cached data for stockPageId: {stock_page_id} were both invalid")


def api_history_request(stock_page_id: int, start_date: datetime):
    """Update challenge entries with this stock_page_id"""
    # Do not send API requests in testing mode
    if current_app.config["TESTING"]:
        return

    # Check valid date, return if end_date is in the future
    end_date = start_date + CHALLENGE_PERIOD
    if end_date > datetime.now():
        raise RuntimeError("Challenge end date is in the future")

    try:
        sym = utils.id_to_code(stock_page_id)
        _, perc_change, price, prev_close = api_utils.calc_change(
            sym, interval="5m", start=start_date, end=end_date
        )
        # get all entries with with this particular stock_page_id
        entries = ChallengeEntry.query.filter_by(stock_page_id=stock_page_id).all()

        for entry in entries:
            entry.code = sym
            entry.start_price = prev_close
            entry.end_price = price
            entry.perc_change = perc_change

        db.session.commit()

    except Exception as e:
        print(f"Error when getting challenge history for stockPageId:{stock_page_id}")
        utils.debug_exception(e, suppress=True)
