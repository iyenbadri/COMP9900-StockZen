import sqlite3
import time

import numpy as np
import pandas as pd
import sqlalchemy
import yfinance as yf

# connect to database
conn = sqlite3.connect("app.sqlite")

overview = []
prices = []


# ==============================================================================
# Importing data from Yfinance
# ==============================================================================
def checkSymbol(stock):
    if stock.info["regularMarketPrice"] == None:
        return False
    else:
        return True


# ==============================================================================
# Importing Time Series Data
# ==============================================================================


def stockTimeSeries(sym):
    "Fetch Time Series for symbol asked"
    stock = yf.Ticker(sym)
    price = stock.history("max")
    price["Stock"] = sym
    return price


def getTimeseries(sym):
    "Can be used for ML to store multiple stock timeseries"
    current_price = stockTimeSeries(sym)
    # current_price.to_csv("Intraday.csv", mode="a", index=False)
    # current_price.to_sql("Intraday", conn, if_exists="append", index=False)
    # conn.commit()
    # Query through database
    return current_price


# ==============================================================================
# Importing Company Overview Data
# ==============================================================================


def stockOverview(sym):
    "Fetches Information for Stock Page also contains calculations, returns a dictionary"
    stock = yf.Ticker(sym)
    if checkSymbol(stock):
        price, stock_change, change_perc = change(sym)
        info = stock.info
        info["Price"] = price
        info["Change"] = stock_change
        info["Change_perc"] = change_perc
        keys = [
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
            "exchange",
            "shortName",
            "longName",
            "regularMarketPrice",
            "logo_url",
            "Stock",
            "Price",
            "Change",
            "Change_perc",
        ]
        inf = {x: info[x] for x in keys}
        return inf
    else:
        return {"message: stock unavailable"}


def getCompanyOverview(sym):
    "Can be used for ML to store multiple stock data"
    overview = stockOverview(sym)
    frame = pd.DataFrame.from_dict([overview])
    frame = frame.applymap(str)
    # overview.to_csv("Overview.csv", mode="a", index=False)
    frame.to_sql("users", conn, if_exists="append", index=False)
    conn.commit()
    # Query through database
    return overview


# ==============================================================================
# Calculations for Portofolio
# ==============================================================================


def change(sym):
    """Returns current price, change and change percentage"""
    price = stockTimeSeries(sym)
    price = price["Close"].tail(2)
    diff = price[1] - price[0]
    change_perc = price.pct_change()[1]
    return price[1], diff, change_perc

