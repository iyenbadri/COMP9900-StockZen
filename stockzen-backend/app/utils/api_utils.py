import app.utils.utils as util
import yfinance as yf
from app.utils.enums import Status
from pandas.core.frame import DataFrame

# ==============================================================================
# Importing Data from yfinance
# ==============================================================================


def fetch_time_series(sym: str, period: str = "max") -> DataFrame:
    """Fetch Time Series for symbol asked"""

    stock = yf.Ticker(sym)
    return stock.history(period)


def fetch_stock_data(sym):
    """Fetches Information and calculations for Stock Page,
    returns price, change, change_perc, and an info dict
    """
    try:
        stock = yf.Ticker(sym)

        change, change_perc = calc_change(sym)
        info = stock.info

        return info["currentPrice"], change, change_perc, info

    except Exception as e:
        util.debug_exception(e, True)
        return Status.FAIL


# ==============================================================================
# Calculations for Portfolio
# ==============================================================================


def calc_change(sym: str):
    """Returns current price, change and change percentage"""
    try:
        df_price = fetch_time_series(sym, period="2d")
        df_price = df_price["Close"]

        change = df_price[1] - df_price[0]
        change_perc = df_price.pct_change()[1]

        return change, change_perc

    except Exception as e:
        util.debug_exception(e, True)
        return Status.FAIL
