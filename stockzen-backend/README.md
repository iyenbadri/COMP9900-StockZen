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
2. Add your email configs.
3. `POPULATE_NEW_DB=True` flag will populate your db with dummy data to get you up and running. You can change this to `False` to keep the db tables completely empty. Please delete db and rerun the backend whenever any changes are made to the db tables to ensure the schema is always consistent.

### How it runs:

- `flask run` calls `stockzen.py`, which calls `app/__init__.py` which calls `app/apis/__init__.py`
- `apis/__init__.py`'s only job is to consolidate all the backend APIs into the main app
  - this allows us to define separate API namespaces cleanly

### Scripts

- Run `flask price-alert run` to price alert script.

## Architecture

**Core:**

    - Python
    - Flask-RESTX
    - SQLite
    - SQLALchemy ORM
    - Flask-Login
    - Flask-Mail
    - Flask-Executor

**Others:** - faker - python-dotenv (for environment variable access)

## Tests

To run a verbose endpoints integration tests, navigate to `stockzen-backend` and do:

```sh
    pytest -vv
```

Please write complete tests for each new endpoint, adding test fixtures within `stockzen-backend/app/tests/conftest.py` as necessary.
These tests are also automatically run on GitHub Actions, and will block merging if they fail.
