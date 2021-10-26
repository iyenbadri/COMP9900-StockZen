import yfinance as yf
from pandas.core.frame import DataFrame

from utils.db_utils import debug_exception
from utils.enums import Status

# ==============================================================================
# Helper
# ==============================================================================


def has_price(stock):
    """Checks if Price exists on stock data"""
    return stock.info["regularMarketPrice"] != None


# ==============================================================================
# Importing Data from yfinance
# ==============================================================================


def fetch_time_series(sym: str, period: str = "max") -> DataFrame:
    """Fetch Time Series for symbol asked"""

    stock = yf.Ticker(sym)
    return stock.history(period)


def fetch_stock_overview(sym):
    """Fetches Information and calculations for Stock Page,
    returns a dict of filtered company data
    """
    try:
        stock = yf.Ticker(sym)

        if not has_price(stock):
            raise KeyError("Stock has no regularMarketPrice")

        price, change, change_perc = calc_stock_price(sym)
        info = stock.info
        info["price"] = price
        info["change"] = change
        info["change_perc"] = change_perc
        keep = [
            "zip",
            "sector",
            "fullTimeEmployees",
            "longBusinessSummary",
            "city",
            "phone",
            "state",
            "country",
            "companyOfficers",
            "website",
            "maxAge",
            "address1",
            "industry",
            "ebitdaMargins",
            "profitMargins",
            "grossMargins",
            "operatingCashflow",
            "revenueGrowth",
            "operatingMargins",
            "ebitda",
            "targetLowPrice",
            "recommendationKey",
            "grossProfits",
            "freeCashflow",
            "targetMedianPrice",
            "currentPrice",
            "earningsGrowth",
            "currentRatio",
            "returnOnAssets",
            "numberOfAnalystOpinions",
            "targetMeanPrice",
            "debtToEquity",
            "returnOnEquity",
            "targetHighPrice",
            "totalCash",
            "totalDebt",
            "totalRevenue",
            "totalCashPerShare",
            "financialCurrency",
            "revenuePerShare",
            "quickRatio",
            "recommendationMean",
            "shortName",
            "longName",
            "regularMarketPrice",
            "logo_url",
            "price",
            "change",
            "change_perc",
        ]
        filtered_info = {col: info[col] for col in keep}
        return filtered_info

    except:
        return Status.FAIL


# ==============================================================================
# Calculations for Portfolio
# ==============================================================================


def calc_stock_price(sym: str):
    """Returns current price, change and change percentage"""
    try:
        df_price = fetch_time_series(sym, period="2d")
        df_price = df_price["Close"]

        current_price = df_price[1]
        change = current_price - df_price[0]
        change_perc = df_price.pct_change()[1]

        return current_price, change, change_perc

    except Exception as e:
        debug_exception(e)
