import yfinance as yf

# connect to database


# ==============================================================================
# Importing data from Yfinance
# ==============================================================================
def check_symbol(stock):
    if stock.info["regularMarketPrice"] == None:
        return False
    else:
        return True


# ==============================================================================
# Importing Time Series Data
# ==============================================================================


def stock_time_series(sym, time: bool):
    "Fetch Time Series for symbol asked"
    if time:
        period = "max"
    else:
        period = "2d"
    stock = yf.Ticker(sym)
    history = stock.history(period)
    return history


# ==============================================================================
# Importing Company Overview Data
# ==============================================================================


def stock_overview(sym):
    "Fetches Information for Stock Page also contains calculations, returns a dictionary"
    stock = yf.Ticker(sym)
    if check_symbol(stock):
        price, stock_change, change_perc = change(sym)
        info = stock.info
        info["price"] = price
        info["change"] = stock_change
        info["change_perc"] = change_perc
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
            "shortName",
            "longName",
            "regularMarketPrice",
            "logo_url",
            "price",
            "change",
            "change_perc",
        ]
        inf = {x: info[x] for x in keys}
        return inf
    else:
        return {"message: stock unavailable"}


# ==============================================================================
# Calculations for Portofolio
# ==============================================================================


def change(sym):
    """Returns current price, change and change percentage"""
    price = stock_time_series(sym)
    price = price["Close"].tail(2)
    diff = price[1] - price[0]
    change_perc = price.pct_change()[1]
    return price[1], diff, change_perc
