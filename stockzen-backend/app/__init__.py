import os

from config import APP_DB_PATH
from dotenv import load_dotenv
from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

load_dotenv()  # load all env vars

app = Flask(__name__)

# ==============================================================================
# Database
# ==============================================================================
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # silence deprecation warning
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{APP_DB_PATH}"  # path to db here
db = SQLAlchemy()
db.init_app(app)

# Set the following flag in .flaskenv to create a new database at APP_DB_PATH
# Should only be done for the first run in production
CREATE_NEW_DB = os.environ.get("CREATE_NEW_DB")
if CREATE_NEW_DB == "True":
    with app.app_context():
        from app.database.schema import User

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

all_apis.init_app(app)

# ==============================================================================
# Dev Mode browser
#   open the server in browser automatically if in dev mode
# ==============================================================================

if os.environ.get("FLASK_ENV") == "development" and not os.environ.get(
    "WERKZEUG_RUN_MAIN"
):
    import webbrowser

    webbrowser.open_new("http://127.0.0.1:5000/")
