import os
from random import randrange, uniform
from typing import Tuple

import pandas as pd
from app import create_app, db
from app.models.schema import Portfolio, User
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
    return email, generic_password


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
            order=last_id,
        )
        try:
            db_utils.insert_item(new_portfolio)
            print("Dummy portfolio added")
        except:
            print(
                f"Could not add dummy portfolio: {portfolio_name} for user_id: {random_id}"
            )


def generate_dummy_data(n_users=2, n_portfolios_max=20):
    """
    Generates dummy user data
    """
    # USERS
    email, generic_password = generate_dummy_users(n_users)

    # PORTFOLIOS
    # get last active id, for other table allocation
    last_id = User.query.order_by(User.id.desc()).first().id
    start_id = last_id - n_users + 1
    end_id = last_id + 1
    user_id_range = (start_id, end_id)

    for _ in range(n_users):
        n_portfolios = randrange(2, n_portfolios_max)

        generate_dummy_portfolios(n_portfolios, user_id_range)

    print(
        f"\n\t****************************************\n\
        The following dummy account may be used for testing:\n\n\
        username: {email}\n\
        password: {generic_password}\n\n\
        ****************************************\n"
    )


def populate_symbols(engine):
    """Populates Stock Page with all USA stock codes, names, and exchange names"""
    try:
        filepath = os.path.join(os.path.dirname(__file__), "stock_symbols.csv")
        df_symbols = pd.read_csv(filepath)

        df_symbols = df_symbols[["code", "stock_name", "exchange"]]
        df_symbols.to_sql("stock_pages", engine, if_exists="append", index=False)

        print("Stock symbols loaded")
    except Exception as e:
        print(e)


if __name__ == "__main__":

    app = create_app()

    with app.app_context():
        engine = db.engine
        populate_symbols(engine)
        generate_dummy_data()
