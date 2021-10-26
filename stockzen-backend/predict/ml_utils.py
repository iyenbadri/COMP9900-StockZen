import sqlite3

import app.utils.api_utils as api
import pandas as pd

conn = sqlite3.connect("database/app.sqlite")


def get_company_overview(sym):
    "Can be used for ML to store multiple stock data"
    overview = api.fetch_stock_overview(sym)
    frame = pd.DataFrame.from_dict([overview])
    frame = frame.applymap(str)
    # overview.to_csv("Overview.csv", mode="a", index=False)
    frame.to_sql("company_overview", conn, if_exists="fails", index=False)
    conn.commit()
    # Query through database
    return overview


def get_time_series(sym):
    "Can be used for ML to store multiple stock timeseries"
    time_series = api.fetch_time_series(sym)
    time_series["Stock"] = sym
    # time_series.to_csv("Intraday.csv", mode="a", index=False)
    time_series.to_sql("intraday", conn, if_exists="fails", index=False)
    # conn.commit()
    # Query through database
    return time_series
