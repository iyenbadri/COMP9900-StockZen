import sqlite3
import time
from datetime import date

import pandas as pd
from alpha_vantage.fundamentaldata import FundamentalData
from alpha_vantage.techindicators import TechIndicators
from alpha_vantage.timeseries import TimeSeries

# connect to database
conn = sqlite3.connect("app.sqlite")

AV_API_KEY = "pl61gsixsminvi4"

# top 20 stocks dictionary
stocks = {
    1: "AAPL",
    2: "MSFT",
    3: "GOOG",
    4: "GOOGL",
    5: "AMZN",
    6: "FB",
    7: "TSLA",
    8: "NVDA",
    9: "JPM",
    10: "V",
    11: "JNJ",
    12: "BABA",
    13: "WMT",
    14: "BAC",
    15: "UNH",
    16: "HD",
    17: "MA",
    18: "PG",
    19: "DIS",
    20: "PYPL",
}

# AlphaVantage data Access
ts = TimeSeries(key=AV_API_KEY, output_format="pandas")
tx = TimeSeries(key=AV_API_KEY, output_format="csv")
fd = FundamentalData(key=AV_API_KEY, output_format="pandas")
ti = TechIndicators(key=AV_API_KEY, output_format="pandas")

# Storing to csv and database using dataframes
# time delay of 12 seconds
# Appends stock name for all entries
for i in stocks:

    # TimeSeries Intraday
    data = ts.get_intraday(stocks[i])[0]
    data["Stock"] = stocks[i]
    data.reset_index(inplace=True)
    data.to_csv("Intraday.csv", mode="a", index=False)
    data.to_sql("Intraday", conn, if_exists="append", index=False)
    conn.commit()
    time.sleep(12)

    # TimeSeries Daily Adjusted
    data = ts.get_daily_adjusted(stocks[i])[0]
    data["Stock"] = stocks[i]
    data.reset_index(inplace=True)
    data.to_csv("Daily_Adjusted.csv", mode="a", index=False, header=False)
    data.to_sql("Daily_Adjusted", conn, if_exists="append", index=False)
    conn.commit()
    time.sleep(12)

    # TimeSeries Quote Endpoint
    data = ts.get_quote_endpoint(stocks[i])[0]
    data["Stock"] = stocks[i]
    data.reset_index(inplace=True)
    data.to_csv("Quote_Endpoint.csv", mode="a", index=False, header=False)
    data.to_sql("Quote_Endpoint", conn, if_exists="append", index=False)
    conn.commit()
    time.sleep(12)

    # TimeSeries Intraday Extended
    data = tx.get_intraday_extended(
        symbol=stocks[i], interval="1min", slice="year2month12"
    )
    data = pd.DataFrame(list(data[0]))
    header_row = 0
    data.columns = data.iloc[header_row]
    data = data.drop(header_row)
    data["Stock"] = stocks[i]
    data.reset_index(inplace=True)
    data.to_csv("TimeseriesExtended.csv", mode="a", index=False, header=False)
    data.to_sql("TimeseriesExtended", conn, if_exists="append", index=False)
    conn.commit()
    time.sleep(12)

    # Company Overview Details
    data = fd.get_company_overview(stocks[i])[0]
    data["Stock"] = stocks[i]
    data.reset_index(inplace=True)
    data.to_csv("Overview.csv", mode="a", index=False, header=False)
    data.to_sql("Overview", conn, if_exists="append", index=False)
    conn.commit()
    time.sleep(12)

    # Tech Indicator Simple Moving Average
    data = ti.get_sma(stocks[i])[0]
    data["Stock"] = stocks[i]
    data.reset_index(inplace=True)
    data.to_csv("SMA.csv", mode="a", index=False, header=False)
    data.to_sql("SMA", conn, if_exists="append", index=False)
    conn.commit()
    time.sleep(12)

    # Tech Indicator Exponential Moving Average
    data = ti.get_ema(stocks[i])[0]
    data["Stock"] = stocks[i]
    data.reset_index(inplace=True)
    data.to_csv("EMA.csv", mode="a", index=False, header=False)
    data.to_sql("EMA", conn, if_exists="append", index=False)
    conn.commit()
    time.sleep(12)
