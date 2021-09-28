import os

from flask import Flask
from flask_login import LoginManager

app = Flask(__name__)

SESSION_KEY = os.environ.get("SESSION_KEY")
app.secret_key = SESSION_KEY
login = LoginManager()

login.init_app(app)

from .apis import all_apis

all_apis.init_app(app)

# open the server in browser automatically if in dev mode
if os.environ.get("FLASK_ENV") == "development" and not os.environ.get(
    "WERKZEUG_RUN_MAIN"
):
    import webbrowser

    webbrowser.open_new("http://127.0.0.1:5000/")
