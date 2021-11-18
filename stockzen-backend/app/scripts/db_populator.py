import os
from datetime import datetime, timedelta
from random import randrange, sample, uniform

import app.utils.crud_utils as crud
import pandas as pd
from app import create_app, db
from app.config import TOP_COMPANIES
from app.models.schema import (
    Challenge,
    ChallengeEntry,
    LotBought,
    LotSold,
    Portfolio,
    Stock,
    StockPage,
)
from app.utils import db_utils
from app.utils.enums import Status
from app.utils.utils import bulk_challenge_fetch, debug_exception, id_to_code
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

    for _ in range(n_users - 1):
        email = faker.ascii_safe_email()
        first_name = faker.first_name()
        last_name = faker.last_name()
        if crud.add_user(email, first_name, last_name, generic_password) == Status.FAIL:
            print(f"Could not add dummy user: {email}, {first_name}, {last_name}")
        else:
            print("Dummy user added")
    # Add last one with demo credentials
    email = "demo@demo.com"
    first_name = "Demo"
    last_name = "User"
    if crud.add_user(email, first_name, last_name, generic_password) == Status.FAIL:
        print(f"Could not add demo user: {email}, {first_name}, {last_name}")
    else:
        print("Demo user added")

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
    STOCK_PAGE_RANGE = 5760

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
        N_CHALLENGES = 2

        # convert top companies to stock_page_ids
        def code_to_id(code):
            return StockPage.query.filter_by(code=code).first().id

        top_ids = [code_to_id(company) for company in TOP_COMPANIES]

        # Create closing challenge
        challenge = Challenge(
            start_date=datetime.now() - timedelta(weeks=2),
            is_active=True,
            is_open=False,
        )
        db_utils.insert_item(challenge)
        print("Challenge added")
        #  custom active/open challenge
        challenge = Challenge(
            start_date=datetime.now() - timedelta(weeks=1), is_active=True, is_open=True
        )
        db_utils.insert_item(challenge)
        print("Challenge added")

        # Add entries to FIRST challenge only
        # Only do for the last 5 users (or n_users whichever smaller)
        min = n_users - 5 + 1
        if min < 1:
            min = 1
        for i_users in range(min, n_users + 1):
            random_ids = sample(top_ids, 5)  # select 5 at random
            for i in range(1, 6):  # 5 companies per entry
                chosen_id = random_ids[i - 1]
                entry = ChallengeEntry(
                    challenge_id=N_CHALLENGES - 1,
                    user_id=i_users,
                    stock_page_id=chosen_id,
                    code=id_to_code(chosen_id),
                )
                db_utils.insert_item(entry)
                print("Challenge Entry added")
        # Update start, end, perc_change
        bulk_challenge_fetch()

        active = Challenge.query.filter_by(id=1).first()  # manually set to inactive
        active.is_active = False
        db.session.commit()
    except Exception as e:
        debug_exception(e, suppress=True)


# For DEMO
def populate_demo_user(user_id, portfolio_id, stock_id):
    try:
        db_utils.insert_item(Portfolio(user_id=user_id, portfolio_name="My Portfolio 1"))
        db_utils.insert_item(
            Stock(user_id=user_id, portfolio_id=portfolio_id, stock_page_id=13)
        )
        db_utils.insert_item(
            LotBought(
                user_id=user_id,
                stock_id=stock_id,
                trade_date=datetime.now(),
                units=100,
                unit_price=150.00,
            )
        )
        db_utils.insert_item(
            LotSold(
                user_id=user_id,
                stock_id=stock_id,
                trade_date=datetime.now(),
                units=50,
                unit_price=155.00,
            )
        )

        db_utils.insert_item(
            Stock(user_id=user_id, portfolio_id=portfolio_id, stock_page_id=3644)
        )
        db_utils.insert_item(
            LotBought(
                user_id=user_id,
                stock_id=stock_id + 1,
                trade_date=datetime.now(),
                units=40,
                unit_price=700.00,
            )
        )
    except Exception as e:
        debug_exception(e, suppress=True)


def generate_dummy_data(n_users=4, n_portfolios=2, n_stocks=4, n_lots=5):
    """
    Generates dummy user data
    """
    # USERS
    email, generic_password = generate_dummy_users(n_users)

    # PORTFOLIOS

    for user_id in range(1, n_users):  # skip demo user
        generate_dummy_portfolios(n_portfolios, user_id)
        generate_dummy_stocks(n_stocks, n_portfolios, user_id)
        generate_dummy_lots(n_lots, n_stocks, user_id)
    # Demo user special case
    demo_id = n_users
    populate_demo_user(
        demo_id, (demo_id - 1) * n_portfolios + 1, (demo_id - 1) * n_stocks + 1
    )

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
