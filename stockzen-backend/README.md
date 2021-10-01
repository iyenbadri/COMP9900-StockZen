# stockzen-backend

StockZen app backend server + APIs - serves app data to the frontend.

---

## Project Structure

_Taking `stockzen-backend` as root_

- Entry point: `./stockzen.py`
- App logic: `./app/`
- Machine learning related: `./predict/`
- Environment variables: `./.flaskenv`
- Config variables: `./config.py`

---

## Instructions

### **Install**

Do this initially (and often) to get updates:

```sh
    # ⚠️make sure you're in the virtual environment first
   (.venv) $ pip install -r requirements.txt
```

### **Dependencies**

```sh
    # ⚠️make sure you're in the virtual environment first
    (.venv) $ pip freeze > requirements.txt
```

Please remember to do this after you install any additional `pip` dependencies, so that others can also access the packages from `requirements.txt`

### **Env File**

We use `.flaskenv` to keep track of environment variables. Please do the following:

1. Add your Alpha Vantage API key as `AV_API_KEY=<your-key>`
2. ⚠️ On the very FIRST run of the backend, add `CREATE_NEW_DB=True` to get the backend to create a new SQLite database.

   - Once you have confirmed that the file has been created in `stockzen-backend/app/database/app.sqlite`, **change this flag to `CREATE_NEW_DB=False` so that your database doesn't get overwritten every time the app compiles**.

### How it runs:

- `flask run` calls `stockzen.py`, which calls `app/__init__.py` which calls `app/apis/__init__.py`
- `apis/__init__.py`'s only job is to consolidate all the backend APIs into the main app
  - this allows us to define separate API namespaces cleanly

## Architecture

**Core:**

    - Python
    - Flask-RESTX
    - SQLite
    - SQLALchemy ORM
    - Flask-Login

**Others:**

    - python-dotenv (for environment variable access)
