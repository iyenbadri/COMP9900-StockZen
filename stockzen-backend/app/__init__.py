import os
from sqlite3 import Connection as SQLite3Connection

from config import APP_DB_PATH
from dotenv import load_dotenv
from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy, event
from sqlalchemy.engine import Engine

load_dotenv()  # load all env vars

app = Flask(__name__)

# ==============================================================================
# Database
# ==============================================================================
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # silence deprecation warning
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{APP_DB_PATH}"  # path to db here
db = SQLAlchemy()
db.init_app(app)


# HACK: FK temporarily unenforced until StockPage populating script can be built,
#           otherwise Stocks cannot be added due to FK integrity issue
# Turn on PRAGMA for foreign keys integrity
# @event.listens_for(Engine, "connect")
# def _set_sqlite_pragma(dbapi_connection, connection_record):
#     if isinstance(dbapi_connection, SQLite3Connection):
#         cursor = dbapi_connection.cursor()
#         cursor.execute("PRAGMA foreign_keys=ON;")
#         cursor.close()


# Set the following flag in .flaskenv to create a new database at APP_DB_PATH
# Should only be done for the first run in production
CREATE_NEW_DB = os.environ.get("CREATE_NEW_DB")
if CREATE_NEW_DB == "True":
    with app.app_context():
        from app.models.schema import User

        db.create_all()

# ==============================================================================
# Login Manager
# ==============================================================================
SESSION_KEY = os.environ.get("SESSION_KEY")
app.secret_key = SESSION_KEY
login_manager = LoginManager()

login_manager.init_app(app)

# ==============================================================================
# Initialise backend APIs
# ==============================================================================
from .apis import all_apis

all_apis.init_app(app, validate=True)

# ==============================================================================
# Dev Mode browser
#   open the server in browser automatically if in dev mode
# ==============================================================================

if os.environ.get("FLASK_ENV") == "development" and not os.environ.get(
    "WERKZEUG_RUN_MAIN"
):
    import webbrowser

    webbrowser.open_new("http://127.0.0.1:5000/")
