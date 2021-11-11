import os
from sqlite3 import Connection as SQLite3Connection

from flask import Flask
from flask_executor import Executor
from flask_login import LoginManager
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
from sqlalchemy.engine import Engine

# Flask Extensions
db = SQLAlchemy()
login_manager = LoginManager()
executor = Executor()
mail = Mail()


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

    # Turn on PRAGMA for foreign keys integrity
    @event.listens_for(Engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        if isinstance(dbapi_connection, SQLite3Connection):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON;")
            cursor.close()

    # ==============================================================================
    # Login Manager
    # ==============================================================================
    SESSION_KEY = os.environ.get("SESSION_KEY")
    app.secret_key = SESSION_KEY

    login_manager.init_app(app)

    # ==============================================================================
    # Concurrency Manager
    # ==============================================================================
    executor.init_app(app)

    # ==============================================================================
    # Initialise backend APIs
    # ==============================================================================
    from .apis import all_apis

    all_apis.init_app(app, validate=True)  # validation flag for all api.models

    mail.init_app(app)


    from .commands import price_alert
    price_alert.init_app(app)

    return app
