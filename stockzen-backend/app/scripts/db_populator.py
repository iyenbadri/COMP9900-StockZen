import json
import os
from random import randrange, uniform
from typing import Tuple

import pandas as pd
from app import app, db
from app.models.schema import Portfolio, StockPage, User
from app.utils import db_utils
from app.utils.crud_utils import add_user
from app.utils.enums import Status
from faker import Faker

# ==============================================================================
# Dummy User Populator
# ==============================================================================
"""
Run with: python3 -m app.scripts.db_populator
"""
faker = Faker()


def generate_dummy_users(n_users: int):
    """
    Generates n random users with the same password
    """
    generic_password = "Password1!"

    for _ in range(n_users):
        email = faker.ascii_safe_email()
        first_name = faker.first_name()
        last_name = faker.last_name()
        if add_user(email, first_name, last_name, generic_password) == Status.FAIL:
            print(f"Could not add dummy user: {email}, {first_name}, {last_name}")
        else:
            print("Dummy user added")


def generate_dummy_portfolios(n_portfolios: int, user_id_range: Tuple[int, int]):
    """
    Generates n random portfolios
    """
    last_id = 0
    last_row = Portfolio.query.order_by(Portfolio.id.desc()).first()
    if last_row:
        last_id = last_row.id

    for _ in range(n_portfolios):
        random_id = randrange(*user_id_range)
        # random_id = 1
        portfolio_name = faker.bs()
        stock_count = randrange(0, 20)
        value = round(uniform(-100000, 100000), 4)
        change = round(uniform(-1000, 1000), 4)
        perc_change = round(uniform(-50, 50), 4)
        gain = round(uniform(-10000, 10000), 4)
        perc_gain = round(uniform(-150, 150), 4)

        last_id += 1  # to maintain unique order
        new_portfolio = Portfolio(
            user_id=random_id,
            portfolio_name=portfolio_name,
            stock_count=stock_count,
            value=value,
            change=change,
            perc_change=perc_change,
            gain=gain,
            perc_gain=perc_gain,
            # order=last_id,
        )
        try:
            db_utils.insert_item(new_portfolio)
            print("Dummy portfolio added")
            return Status.SUCCESS
        except:
            print(
                f"Could not add dummy portfolio: {portfolio_name} for user_id: {random_id}"
            )
            return Status.FAIL


def generate_dummy_stock_pages():
    """
    Generates dummy stock page data (DEPRECATED)
    """

    # Read the file and parse it.
    with open(os.path.join(os.path.dirname(__file__), "listing.json")) as f:
        listing = json.load(f)

    for stock in listing:
        try:
            # Check if code is already or not
            q = (
                db.session.query(StockPage)
                .filter(StockPage.code == stock["symbol"])
                .exists()
            )
            if db.session.query(q).scalar():
                continue

            # Create and add it to database
            db.session.add(
                StockPage(code=stock["symbol"], stock_name=stock["description"])
            )

        except KeyboardInterrupt:
            # Stop the loop if Ctrl+C is pressed
            break
        except Exception as ex:
            print(ex)
            db.session.rollback()
            break

    # Commit to database
    db.session.commit()


def generate_dummy_data(n_users=10, n_portfolios_max=30, n_stock_pages=100):
    """
    Generates dummy user data
    """
    # USERS
    generate_dummy_users(n_users)

    # PORTFOLIOS
    # get last active id, for other table allocation
    last_id = User.query.order_by(User.id.desc()).first().id
    start_id = last_id - n_users + 1
    end_id = last_id + 1
    user_id_range = (start_id, end_id)

    for _ in range(n_users):
        n_portfolios = randrange(0, n_portfolios_max)

        generate_dummy_portfolios(n_portfolios, user_id_range)

    # STOCK PAGES
    generate_dummy_stock_pages()


def populate_symbols(engine):
    """Populates Stock Page with all USA stock codes, names, and exchange names"""
    try:
        # throw error if table already has rows

        df_symbols = pd.read_csv("app/scripts/stock_symbols.csv")
        df_symbols = df_symbols[["code", "stock_name", "exchange"]]
        df_symbols.to_sql("stock_pages", engine, if_exists="append", index=False)
        db.session.commit()
    except Exception as e:
        debug_exception
        db.session.rollback()


if __name__ == "__main__":
    with app.app_context():
        engine = db.engine
        populate_symbols(engine)
        # generate_dummy_data()
        # generate_dummy_stock_pages()
