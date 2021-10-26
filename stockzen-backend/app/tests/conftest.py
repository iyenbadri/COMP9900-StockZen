import app.tests.mocks as mock
import pytest
from app import create_app, db


# base app for initial test setup and authentication tests
@pytest.fixture
def app():
    # use in-memory sqlite db
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite://"})

    with app.test_client() as _app:
        with app.app_context():
            app.secret_key = "test_secret"
            db.create_all()
        yield _app


# authenticated client for protected paths
@pytest.fixture
def client(app):
    app.post("user/register", json=mock.user_register)
    app.post("user/login", json=mock.user_login)
    yield app
