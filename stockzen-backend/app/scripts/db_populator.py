from random import randrange

from app.models.schema import User
from app.utils.crud_utils import add_portfolio, add_user
from app.utils.enums import Status
from faker import Faker

# ==============================================================================
# Dummy User Populator
# ==============================================================================
"""
Run with: python3 -m app.scripts.db_populator
"""
faker = Faker()

from app import app

with app.app_context():

    def generate_dummy_users(n):
        """
        Generates n random users with the same password
        """
        generic_password = "Password1!"

        for _ in range(n):
            email = faker.ascii_safe_email()
            first_name = faker.first_name()
            last_name = faker.last_name()
            if add_user(email, first_name, last_name, generic_password) == Status.FAIL:
                print(f"Could not add dummy user: {email}, {first_name}, {last_name}")
            else:
                print("Dummy user added")

    def generate_dummy_portfolios(n, user_id):
        """
        Generates n random portfolios
        """
        for _ in range(n):
            portfolio_name = faker.bs()

            if add_portfolio(portfolio_name, user_id) == Status.FAIL:
                print(f"Could not add dummy portfolio: {portfolio_name}")
            else:
                print("Dummy portfolio added")

    def generate_dummy_data(n_users=10, n_portfolios_range=15):
        """
        Generates dummy user data
        """
        generate_dummy_users(n_users)

        # get last active id, for portfolio allocation
        last_id = User.query.order_by(User.id.desc()).first().id

        for _ in range(n_users):
            n_portfolios = randrange(0, n_portfolios_range)

            start_id = last_id + 1
            end_id = last_id + n_users + 2
            generate_dummy_portfolios(n_portfolios, randrange(start_id, end_id))

    if __name__ == "__main__":
        generate_dummy_data(10)
