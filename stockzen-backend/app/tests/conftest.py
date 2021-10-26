import app.tests.mocks as mock
import pytest
from app import create_app, db
from app.scripts import db_populator


# base app for initial test setup and authentication tests
@pytest.fixture
def client():
    # use in-memory sqlite db
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite://"})

    with app.test_client() as client:
        with app.app_context():
            app.secret_key = "test_secret"
            db.create_all()
        yield client


@pytest.fixture
def client_db(client):
    app = client.application
    with app.app_context():
        db_populator.populate_symbols(db.engine)
    return client


# authenticated client for protected paths
@pytest.fixture
def auth_client_no_db(client):
    client.post("user/register", json=mock.user_register)
    client.post("user/login", json=mock.user_login)
    yield client


@pytest.fixture
def auth_client(client_db):
    client_db.post("user/register", json=mock.user_register)
    client_db.post("user/login", json=mock.user_login)
    yield client_db
