import os

from dotenv import load_dotenv

from app import create_app

load_dotenv()  # load all env vars

create_app()


# ==============================================================================
# Dev Mode browser
#   open the server in browser automatically if in dev mode
# ==============================================================================

if os.environ.get("FLASK_ENV") == "development" and not os.environ.get(
    "WERKZEUG_RUN_MAIN"
):
    import webbrowser

    webbrowser.open_new("http://127.0.0.1:5000/")
