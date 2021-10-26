import os

from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy, event
from sqlalchemy.engine import Engine

db = SQLAlchemy()
login_manager = LoginManager()


def create_app(test_config=None):

    app = Flask(__name__)
    app.config.from_pyfile("config.py")

    if test_config:
        # update with testing config if passed in
        app.config.update(test_config)

    # ==============================================================================
    # Database
    # ==============================================================================
    db.init_app(app)

    # Set the following flag in .flaskenv to create a new database at APP_DB_PATH
    # Should only be done for the first run in production
    CREATE_NEW_DB = os.environ.get("CREATE_NEW_DB")
    if CREATE_NEW_DB == "True":
        with app.app_context():
            db.create_all()

    # HACK: FK temporarily unenforced until StockPage populating script can be built,
    #           otherwise Stocks cannot be added due to FK integrity issue
    # Turn on PRAGMA for foreign keys integrity
    # @event.listens_for(Engine, "connect")
    # def _set_sqlite_pragma(dbapi_connection, connection_record):
    #     if isinstance(dbapi_connection, SQLite3Connection):
    #         cursor = dbapi_connection.cursor()
    #         cursor.execute("PRAGMA foreign_keys=ON;")
    #         cursor.close()

    # ==============================================================================
    # Login Manager
    # ==============================================================================
    SESSION_KEY = os.environ.get("SESSION_KEY")
    app.secret_key = SESSION_KEY

    login_manager.init_app(app)

    # ==============================================================================
    # Initialise backend APIs
    # ==============================================================================
    from .apis import all_apis

    all_apis.init_app(app, validate=True)  # validation flag for all api.models

    return app
