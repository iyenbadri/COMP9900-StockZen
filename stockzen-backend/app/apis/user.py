# ==============================================================================
# FOR EXAMPLES ON MARSHALLING ETC:
# https://flask-restx.readthedocs.io/en/latest/example.html
# https://flask-restx.readthedocs.io/en/latest/marshalling.html
# ACTUAL LOGIN HANDLING TO BE DONE WITH FLASK-LOGIN:
# https://flask-login.readthedocs.io/en/latest/
# Implementation: https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-v-user-logins
# ==============================================================================

import app.utils.auth_utils as auth
from app import login_manager
from app.models.schema import User
from app.utils.enums import AuthStatus
from flask import request
from flask_login import current_user
from flask_login.utils import login_required, login_user
from flask_restx import Namespace, Resource, fields, marshal

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


@login_manager.user_loader
def user_loader(user_id: int):
    """Flask_Login requirement:
    Given *user_id*, return the associated User object.

    :param unicode user_id: user_id  user to retrieve

    """
    return User.query.get(user_id)
