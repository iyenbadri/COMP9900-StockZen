TESTING = False
APP_DB_PATH = "database/app.sqlite"
SQLALCHEMY_DATABASE_URI = f"sqlite:///{APP_DB_PATH}"
SQLALCHEMY_TRACK_MODIFICATIONS = False  # silence deprecation warning
SEARCH_LIMIT = 30
UPDATE_MIN_INTERVAL = 90  # min seconds before a stock page is considered stale
