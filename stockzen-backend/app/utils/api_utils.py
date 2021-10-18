import sqlite3
import time

import numpy as np
import pandas as pd
import sqlalchemy
import yfinance as yf
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import util

# connect to database
conn = sqlite3.connect("app.sqlite")

import app.utils.crud_utils as crud
import app.utils.db_utils as uti

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
    stock = yf.Ticker(sym)
    price = stock.history("max")
    price["Stock"] = sym
    return price


def getTimeseries(sym):
    current_price = stockTimeSeries(sym)
    # current_price.to_csv("Intraday.csv", mode="a", index=False)
    current_price.to_sql("Intraday", conn, if_exists="append", index=False)
    conn.commit()
    # Query through database
    return current_price


# ==============================================================================
# Importing Company Overview Data
# ==============================================================================


def stockOverview(sym):
    stock = yf.Ticker(sym)
    if checkSymbol(stock):
        info = stock.info
        info["Stock"] = sym
        return info
    else:
        return {"message: stock unavailable"}


def getCompanyOverview(sym):
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
    mprice = stockTimeSeries(sym)
    mprice = mprice["Close"].tail(2)
    change = mprice.pct_change()
    return change[1]


# def stock(sym):
# stock = {
#     # "id": np.nan,  # Column(Integer, primary_key=True, autoincrement=True, nullable=False)
#     # "user_id": getuserid(),  # Column(Integer, ForeignKey("users.id"), nullable=False)
#     # "portfolio_id": np.nan,  # Column(Integer, ForeignKey("portfolios.id"), nullable=False)
#     # "stock_page_id": np.nan,  # Column(
#     # Integer, ForeignKey("stock_pages.id"), nullable=False)
#     # to get current price and percent_change
#     "code": sym,
#     "stock_name":,
#     "price": getTimeseries(sym)["Open"][1],  # = stock_pages.price
#     "change": change(sym),  # = stock_pages.change
#     "perc_change": 100 * change(sym),  # = stock_pages.perc_change
#     "avg_price": ,  # = bought.avg_price
#     "units_held": ,  # sum(bought.units) - sum(sold.units)  -> not displayed
#     "gain": ,  # (stocks.price - bought.avg_price) * stocks.units_held
#     "perc_gain": ,  # stocks.gain / (stocks.units_held * bought.avg_price)
#     "value":,  # sum(bought.value)
# }
# stocks = pd.DataFrame.from_dict([stock])
# stocks["id"] = (
#     np.nan,
# )  # Column(Integer, primary_key=True, autoincrement=True, nullable=False)
# stocks["user_id"] = (2,)  # Column(Integer, ForeignKey("users.id"), nullable=False)
# stocks["portfolio_id"] = (
#     1,
# )  # Column(Integer, ForeignKey("portfolios.id"), nullable=False)
# stocks["stock_page_id"] = 1

# stocks.to_sql("stocks", conn, if_exists="append", index=False)

# def portfolio(sym):
# portfolio={'id':np.nan, #Column(Integer, primary_key=True, autoincrement=True, nullable=False)
# 'user_id':, # Column(Integer, ForeignKey("users.id"), nullable=False)
# 'portfolio_name':,# Column(String(50), nullable=False)
# 'stock_count':,# Column(Integer, default=0)  # count(stocks)
# "value":,#Column(Float, default=0)  # sum(stocks.value)
# 'change': change(sym), #Column(Float, default=0)  # sum(stocks.change)
# 'perc_change':,# Column(Float, default=0)  # portfolios.change / portfolios.value
# 'gain':,# Column(Float, default=0)  # sum(stocks.gain)
# 'perc_gain':,#Column(Float, default=0)  # portfolios.gain / portfolios.value
# 'prediction':, #Column(Integer, default=0)  # -1 for down, 0 no change, 1 for up
# 'confidence' :,# Column(Float, default=0)
# last_updated:}
# portfolio = pd.DataFrame.from_dict([portfolio])
# portfolio.to_sql("Portfolio", conn, if_exists='', index=False)


# stock("aapl")
# # symbol(conn)
