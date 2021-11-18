import os

from dotenv import load_dotenv
from flask_sqlalchemy import inspect

from app import create_app, db
from app.scripts.db_populator import generate_dummy_data, populate_symbols

load_dotenv()  # load all env vars

app = create_app()

# ==============================================================================
# Database Population
# ==============================================================================

# Set the following flag in .flaskenv to create a new database at APP_DB_PATH
POPULATE_NEW_DB = os.environ.get("POPULATE_NEW_DB")
engine = db.get_engine(app)
has_tables = inspect(engine).has_table("users")  # pick a table to check
with app.app_context():
    # this will not replace any existing tables, only makes new ones
    db.create_all()
    # seed initial symbols
    if not has_tables:
        populate_symbols(engine)
    # add dummy data if flag is set
    if (
        os.environ.get("FLASK_ENV") == "development"
        and POPULATE_NEW_DB == "True"
        and not has_tables
    ):
        generate_dummy_data()

# ==============================================================================
# Dev Mode browser
#   open the server in browser automatically if in dev mode
# ==============================================================================

if os.environ.get("FLASK_ENV") == "development" and not os.environ.get(
    "WERKZEUG_RUN_MAIN"
):
    import webbrowser

    webbrowser.open_new("http://127.0.0.1:5000/")
