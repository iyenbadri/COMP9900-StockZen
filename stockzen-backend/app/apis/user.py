# ==============================================================================
# FOR EXAMPLES ON MARSHALLING ETC:
# https://flask-restx.readthedocs.io/en/latest/example.html
# https://flask-restx.readthedocs.io/en/latest/marshalling.html
# ACTUAL LOGIN HANDLING TO BE DONE WITH FLASK-LOGIN:
# https://flask-login.readthedocs.io/en/latest/
# Implementation: https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-v-user-logins
# ==============================================================================

from datetime import datetime

import app.utils.auth_utils as auth
from app import db, login_manager
from app.models.schema import Portfolio, User, StockLot
from app.utils.enums import AuthStatus
from flask import request
from flask_login import current_user
from flask_login.utils import login_required, login_user
from flask_restx import Namespace, Resource, fields, marshal
from sqlalchemy.sql.sqltypes import TIMESTAMP


api = Namespace("user", description="User related operations")

userRegisterReq = api.model(
    "Incoming user data on Register",
    {
        "firstName": fields.String(required=True, description="first name"),
        "lastName": fields.String(required=True, description="last name"),
        "email": fields.String(required=True, description="email address"),
        "password": fields.String(required=True, description="plaintext password"),
    },
)

addPortfolioReq = api.model(
    "Incoming Portfolio data",
    {
        "user_id": fields.Integer(required=True, description="first name"),
        "portfolio_name": fields.String(required=True, description="email address"),
    },
)

addStockReq = api.model(
    "Incoming Stock data",
    {
        "code": fields.String(required=True, description="Trading name"),
        "name": fields.String(required=True, description="Company Name"),
        "price": fields.Float(required=True, description="Price_per_share"),
    },
)

userLoginReq = api.model(
    "Incoming user data on Login",
    {
        "email": fields.String(required=True, description="email address"),
        "password": fields.String(required=True, description="plaintext password"),
    },
)

userLoginRes = api.model(
    "Outgoing user data on Login",
    {
        "firstName": fields.String(required=True, description="user first name"),
        "lastName": fields.String(required=True, description="user last name"),
    },
)


@api.route("/login")
@login_manager.user_loader
class UserRouter(Resource):
    @api.marshal_with(userLoginRes)
    @api.doc("user_login_validation")
    @api.expect(userLoginReq)
    @api.response(403, "User not found")
    @api.response(401, "Incorrect password")
    def post(self):
        loginRequest = marshal(request.json, userLoginReq)

        email = loginRequest["email"]
        plain_password = loginRequest["password"]

        user = auth.validate_login(email, plain_password)

        if user == AuthStatus.USER_NOT_FOUND:
            return {"message": "User not found"}, 403
        elif user == AuthStatus.INCORRECT_PASSWORD:
            return {"message": "Incorrect password"}, 401
        else:
            login_user(user)
            user_details = auth.extract_user_details(user)
            return user_details


@api.route("/register")
class UserRouter(Resource):
    @api.doc("user_registration")
    @api.expect(userRegisterReq)
    @api.response(409, "Registration conflict")
    def post(self):
        registerRequest = marshal(request.json, userRegisterReq)

        email = registerRequest["email"].lower()
        first_name = registerRequest["firstName"]
        last_name = registerRequest["lastName"]
        plain_password = registerRequest["password"]

        if current_user.is_authenticated:
            return {"message": "user already logged in"}, 409

        if auth.email_exists(email) == AuthStatus.USER_FOUND:
            return {"message": "email already exists"}, 409

        if (
            auth.add_user(email, first_name, last_name, plain_password)
            == AuthStatus.USER_ADDED
        ):
            return {"message": "user successfully registered"}, 200

        return {"message": "registration error occurred"}, 500


@api.route("/details")
class UserRouter(Resource):
    @login_required
    @api.doc("get_user_details")
    @api.response(401, "Unauthorized")
    def get(self):
        user_details = auth.extract_user_details(current_user)
        return user_details


@api.route("/<email>")
@api.doc(params={"email": "User email"})
class UserRouter(Resource):
    @api.doc("does_email_exist")
    @api.response(200, "User found")
    @api.response(404, "User not found")
    def head(self, email):
        email_status = auth.email_exists(email)
        if email_status == AuthStatus.USER_FOUND:
            return {"message": "user exists"}, 200
        return {"message": "user not found"}, 404


@login_manager.user_loader
def user_loader(user_id: int):
    """Flask_Login requirement:
    Given *user_id*, return the associated User object.

    :param unicode user_id: user_id (NOT email) user to retrieve

    """
    return User.query.get(user_id)


@api.route("/add_portfolio")
class PortfolioCRUD(Resource):
    @api.doc("user_registration")
    @api.expect(addPortfolioReq)
    @api.response(409, "Registration conflict")
    def post(self):
        registerRequest = marshal(request.json, addPortfolioReq)

        user_id = registerRequest["user_id"]
        portfolio_name = registerRequest["portfolio_name"].lower()

        # if current_user.is_authenticated:
        #     return {"message": "user already logged in"}, 409

        # if auth.email_exists(email) == AuthStatus.USER_FOUND:
        #     return {"message": "email already exists"}, 409

        if add_portfolio(user_id, portfolio_name) == AuthStatus.USER_ADDED:
            return {"message": "portfolio successfully registered"}, 200

        return {"message": "create error occurred"}, 500

@api.route("/add_stock")
class Stock_LotCRUD(Resource):
    @api.doc("user_registration")
    @api.expect(addStockReq)
    @api.response(409, "Registration conflict")
    def post(self):
        registerRequest = marshal(request.json, addStockReq)

        name = registerRequest["name"].lower()
        code = registerRequest["code"].upper()
        price = registerRequest["price"]

        # if current_user.is_authenticated:
        #     return {"message": "user already logged in"}, 409

        # if auth.email_exists(email) == AuthStatus.USER_FOUND:
        #     return {"message": "email already exists"}, 409

        if add_stock(code, name, price) == AuthStatus.USER_ADDED:
            return {"message": "stock successfully registered"}, 200

        return {"message": "create error occurred"}, 500

def add_portfolio(user_id: int, portfolio_name: str) -> AuthStatus:
    """Add a portfolio to the database, return bool of success status"""
    new_portfolio = Portfolio(
        user_id=user_id,
        portfolio_name=portfolio_name,
        stock_count=1,
        timestamp=datetime.now(),
    )
    try:
        db.session.add(new_portfolio)
        db.session.commit()
        return AuthStatus.USER_ADDED
    except:
        return AuthStatus.USER_NOT_ADDED

def add_stock(code: int, name: str, price: float) -> AuthStatus:
    """Add a stock to the database, return bool of success status"""
    new_stock_lot = StockLot(
        code=code,
        name=name,
        price=price,
        added=datetime.now(),
    )
    try:
        db.session.add(new_stock_lot)
        db.session.commit()
        return AuthStatus.USER_ADDED
    except:
        return AuthStatus.USER_NOT_ADDED
