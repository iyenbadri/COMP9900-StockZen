from datetime import datetime, timedelta
import os

TESTING = False
APP_DB_PATH = "database/app.sqlite"
SQLALCHEMY_DATABASE_URI = f"sqlite:///{APP_DB_PATH}"
SQLALCHEMY_TRACK_MODIFICATIONS = False  # silence deprecation warning
EXECUTOR_TYPE = "thread"  # flask-executor thread or processes
EXECUTOR_MAX_WORKERS = 8  # max concurrents
EXECUTOR_PROPAGATE_EXCEPTIONS = True  # don't swallow exceptions
SEARCH_LIMIT = 30

# ------------------------------------------------------------------------------
# Top Stocks
# ------------------------------------------------------------------------------
STALENESS_INTERVAL = 90  # min seconds before a stock page is considered stale
TOP_STOCKS_INTERVAL = (
    3600  # min seconds before a top performance stock is considered stale
)
N_TOP_PERFORMERS = 5  # number of top performing stocks to return
TOP_COMPANIES = [
    "AAPL",
    "MSFT",
    "AMZN",
    "TSLA",
    "GOOGL",
    "FB",
    "NVDA",
    "BRK-B",
    "JPM",
    "JNJ",
    "UNH",
    "HD",
    "V",
    "BAC",
    "PG",
    "MA",
    "DIS",
    "ADBE",
    "NFLX",
    "PYPL",
]  # ref: https://www.investopedia.com/ask/answers/08/find-stocks-in-sp500.asp

# ------------------------------------------------------------------------------
# Price Alerts
# ------------------------------------------------------------------------------
MAIL_SERVER = "smtp.mailtrap.io"
MAIL_PORT = 2525
MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
MAIL_USE_TLS = True
MAIL_USE_SSL = False
MAIL_SENDER = "alert@stockzen.com"
MAIL_DEBUG = False

# ------------------------------------------------------------------------------
# Portfolio Challenge
# ------------------------------------------------------------------------------
SLEEP_INTERVAL = 15 * 60  # while loop sleep interval for challenge script
CHALLENGE_PERIOD = timedelta(
    weeks=1
)  # length of each challenge round (after submission phase) in seconds
CHALLENGE_START = datetime.now() + timedelta(
    hours=1
)  # datetime when the challenge evaluation period starts
