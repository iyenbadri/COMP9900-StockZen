import app.utils.utils as util
import yfinance as yf
from app.utils.enums import Status
from pandas.core.frame import DataFrame

# ==============================================================================
# Importing Data from yfinance
# ==============================================================================


def fetch_time_series(sym: str, period: str = "max", actions=False) -> DataFrame:
    """Fetch Time Series for symbol asked"""

    stock = yf.Ticker(sym)
    return stock.history(period=period, actions=actions)


def fetch_stock_data(sym):
    """Fetches Information and calculations for Stock Page,
    returns price, change, perc_change, and an info dict
    """
    try:
        stock = yf.Ticker(sym)
        info = stock.info
        if not has_data(stock):
            raise RuntimeError("Stock details could not be fetched")

        change, perc_change, price, prev_close = calc_change(sym, info)

        return price, change, perc_change, prev_close, info

    except Exception as e:
        util.debug_exception(e, suppress=True)
        return Status.FAIL


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
        util.debug_exception(e, suppress=True)
        return Status.FAIL


# ==============================================================================
# Calculations for Portfolio
# ==============================================================================


def calc_change(sym: str, info: dict):
    """Returns current price, change and change percentage"""
    try:
        try:
            price = info["regularMarketPrice"]
            prev_close = info["previousClose"]
        except:
            print(".info not available, fetching time series...")
            df_price = fetch_time_series(sym, period="2d")["Close"]
            df_price = df_price
            price = df_price[1]
            prev_close = df_price[0]  # TODO: THIS MIGHT NOT BE PREV DAY CLOSE
        finally:
            change = price - prev_close
            perc_change = change / prev_close * 100

            return change, perc_change, price, prev_close

    except Exception as e:
        util.debug_exception(e, True)
        return Status.FAIL


# ==============================================================================
# Helper
# ==============================================================================


def has_data(stock):
    return stock.info["regularMarketPrice"] is not None
