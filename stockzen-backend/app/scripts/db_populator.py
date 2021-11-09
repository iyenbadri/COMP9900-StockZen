import os
from datetime import datetime, timedelta
from random import randrange, uniform

import app.utils.crud_utils as crud
import pandas as pd
from app import create_app, db
from app.models.schema import (
    Challenge,
    ChallengeEntry,
    LotBought,
    LotSold,
    Portfolio,
    Stock,
)
from app.utils import db_utils
from app.utils.enums import Status
from app.utils.utils import id_to_code
from dateutil.parser import parse
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
        if crud.add_user(email, first_name, last_name, generic_password) == Status.FAIL:
            print(f"Could not add dummy user: {email}, {first_name}, {last_name}")
        else:
            print("Dummy user added")
    return email, generic_password


def generate_dummy_portfolios(n_portfolios: int, user_id: int):
    """
    Generates n random portfolios per user
    """
    for portfolio_id in range(1, n_portfolios + 1):
        portfolio_name = faker.bs()
        stock_count = randrange(0, 20)
        value = round(uniform(-100000, 100000), 4)
        change = round(uniform(-1000, 1000), 4)
        perc_change = round(uniform(-50, 50), 4)
        gain = round(uniform(-10000, 10000), 4)
        perc_gain = round(uniform(-150, 150), 4)

        new_portfolio = Portfolio(
            user_id=user_id,
            portfolio_name=portfolio_name,
            stock_count=stock_count,
            value=value,
            change=change,
            perc_change=perc_change,
            gain=gain,
            perc_gain=perc_gain,
            order=portfolio_id,
        )
        try:
            db_utils.insert_item(new_portfolio)
            print("Dummy portfolio added")
        except:
            print(
                f"Could not add dummy portfolio: {portfolio_name} for user_id: {user_id}"
            )


def generate_dummy_stocks(n_stocks: int, n_portfolios: int, user_id: int):
    STOCK_PAGE_RANGE = 7567

    for stock_id in range(1, n_stocks + 1):
        new_stock = Stock(
            user_id=user_id,
            portfolio_id=randrange(
                (user_id - 1) * n_portfolios + 1, user_id * n_portfolios + 1
            ),
            stock_page_id=randrange(1, STOCK_PAGE_RANGE + 1),
            avg_price=round(uniform(-10000, 10000), 4),
            gain=round(uniform(-10000, 10000), 4),
            perc_gain=round(uniform(-150, 150), 4),
            value=round(uniform(-100000, 100000), 4),
            order=stock_id,
        )
        try:
            db_utils.insert_item(new_stock)
            print("Dummy stock added")
        except:
            print(f"Could not add dummy stock for user_id: {id}")


def generate_dummy_lots(n_lots: int, n_stocks: int, user_id: int):
    range_low = (user_id - 1) * n_stocks + 1
    range_high = user_id * n_stocks + 1
    for stock_id in range(range_low, range_high):
        for i_lot in range(1, n_lots + 1):
            new_lot_bought = LotBought(
                user_id=user_id,
                stock_id=stock_id,
                trade_date=parse(
                    f"20{randrange(00,22):02}-{randrange(1,13):02}-{randrange(1,29):02}"
                ),
                units=randrange(0, 1000),
                unit_price=round(uniform(0.1000, 1000), 4),
                value=None,
                change=None,
            )
            try:
                db_utils.insert_item(new_lot_bought)
                print("Dummy buy lot added")
            except:
                print(f"Could not add dummy buy lot for user_id: {user_id}")

            if i_lot % 2 == 0:  # only do half as many Sold Lots
                units_sold = randrange(0, 1000)
                unit_price = round(uniform(0.1000, 1000), 4)
                new_lot_sold = LotSold(
                    user_id=user_id,
                    stock_id=stock_id,
                    trade_date=parse(
                        f"20{randrange(00,22):02}-{randrange(1,13):02}-{randrange(1,29):02}"
                    ),
                    units=units_sold,
                    unit_price=unit_price,
                    amount=units_sold * unit_price,
                    realised=None,
                )
                try:
                    db_utils.insert_item(new_lot_sold)
                    print("Dummy sell lot added")
                except:
                    print(f"Could not add dummy sell lot for user_id: {user_id}")


def generate_dummy_challenges(n_users):
    try:
        # Create some challenges
        challenge = Challenge(
            start_date=datetime.now() - timedelta(weeks=2), is_active=False
        )
        db_utils.insert_item(challenge)
        print("Challenge added")
        challenge = Challenge(
            start_date=datetime.now() - timedelta(weeks=1), is_active=True
        )
        db_utils.insert_item(challenge)
        print("Challenge added")

        # Add entries to challenges
        for i_users in range(1, n_users + 1):
            for i in range(1, 6):
                entry = ChallengeEntry(
                    challenge_id=1,
                    user_id=i_users,
                    stock_page_id=i,
                    code=id_to_code(i),
                    start_price=None,
                    end_price=None,
                    perc_change=None,
                )
                db_utils.insert_item(entry)
                print("Challenge Entry added")
    except Exception as e:
        print(e)


def generate_dummy_data(n_users=2, n_portfolios=2, n_stocks=4, n_lots=5):
    """
    Generates dummy user data
    """
    # USERS
    email, generic_password = generate_dummy_users(n_users)

    # PORTFOLIOS

    for user_id in range(1, n_users + 1):
        generate_dummy_portfolios(n_portfolios, user_id)
        generate_dummy_stocks(n_stocks, n_portfolios, user_id)
        generate_dummy_lots(n_lots, n_stocks, user_id)
    generate_dummy_challenges(n_users)

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
        df_symbols["info"] = "{}"  # fill with empty json string

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
