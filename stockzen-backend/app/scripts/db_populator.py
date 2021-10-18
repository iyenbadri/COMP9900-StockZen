from random import randrange, uniform
from typing import Tuple

from app import app
from app.models.schema import Portfolio, User
from app.utils import db_utils as db
from app.utils.crud_utils import add_stock_page, add_user
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


def generate_dummy_portfolios(n_portfolios: int):
    """
    Generates n random portfolios
    """
    last_id = 0
    last_row = Portfolio.query.order_by(Portfolio.id.desc()).first()
    if last_row:
        last_id = last_row.id

    for _ in range(n_portfolios):
        # random_id = randrange(*user_id_range)
        random_id = 1
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
            db.insert_item(new_portfolio)
            print("Dummy portfolio added")
            return Status.SUCCESS
        except:
            print(
                f"Could not add dummy portfolio: {portfolio_name} for user_id: {random_id}"
            )
            return Status.FAIL


def generate_dummy_stock_pages(n_pages=100):
    """
    Generates dummy stock page data
    """
    for _ in range(n_pages):
        code = faker.lexify(text="????")
        stock_name = faker.company()
        if add_stock_page(code, stock_name) == Status.FAIL:
            print("Could not add dummy stock page")
        else:
            print("Dummy stock page added")


def generate_dummy_data(n_users=10, n_portfolios_max=30):
    """
    Generates dummy user data
    """
    generate_dummy_users(n_users)

    for _ in range(n_users):
        n_portfolios = randrange(0, n_portfolios_max)

        generate_dummy_portfolios(n_portfolios)


if __name__ == "__main__":
    with app.app_context():
        generate_dummy_data(10)
        generate_dummy_stock_pages()
