TESTING = False
APP_DB_PATH = "database/app.sqlite"
SQLALCHEMY_DATABASE_URI = f"sqlite:///{APP_DB_PATH}"
SQLALCHEMY_TRACK_MODIFICATIONS = False  # silence deprecation warning
EXECUTOR_TYPE = "thread"  # flask-executor thread or processes
EXECUTOR_MAX_WORKERS = 8  # max concurrents
EXECUTOR_PROPAGATE_EXCEPTIONS = True  # don't swallow exceptions
SEARCH_LIMIT = 30

MAIL_SERVER = "smtp.mailtrap.io"
MAIL_PORT = 2525
MAIL_USERNAME = "a15b07c5c03683"
MAIL_PASSWORD = "69cce18ae605e1"
MAIL_USE_TLS = True
MAIL_USE_SSL = False
MAIL_SENDER = "alert@stockzen.com"
MAIL_DEBUG = False

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
