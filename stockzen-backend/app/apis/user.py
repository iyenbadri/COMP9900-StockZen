# ==============================================================================
# FOR EXAMPLES ON MARSHALLING ETC:
# https://flask-restx.readthedocs.io/en/latest/example.html
# https://flask-restx.readthedocs.io/en/latest/marshalling.html
# ACTUAL LOGIN HANDLING TO BE DONE WITH FLASK-LOGIN:
# https://flask-login.readthedocs.io/en/latest/
# Implementation: https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-v-user-logins
# ==============================================================================

import crypt

import app.utils.auth_utils as auth
from app import login_manager
from app.database.schema import User
from flask import redirect, request, url_for
from flask_login import current_user
from flask_restx import Namespace, Resource, abort, fields, marshal

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
        "id": fields.Integer(required=True, description="user ID (primary key)"),
        "initials": fields.String(required=True, description="name initials for bubble"),
    },
)


@api.route("/login")
@login_manager.user_loader
class User(Resource):
    @api.marshal_with(userLoginRes)
    @api.doc("user_login")
    def post(self):
        loginRequest = marshal(request.json, userLoginReq)

        email = loginRequest["email"]
        plain_password = loginRequest["password"]

        auth_status = auth.validate_login(email, plain_password)

        return auth_status


@api.route("/register")
class User(Resource):
    def post(self):
        registerRequest = marshal(request.json, userRegisterReq)

        email = registerRequest["email"]
        first_name = registerRequest["firstName"]
        last_name = registerRequest["lastName"]
        plain_password = registerRequest["password"]

        if current_user.is_authenticated:
            return {"message": "user already logged in"}, 409

        if auth.email_exists(email):
            return {"message": "email already exists"}, 409

        if auth.add_user(email, first_name, last_name, plain_password):
            return {"message": "user successfully registered"}, 200

        return


@login_manager.user_loader
def user_loader(user_id: int):
    """Flask_Login requirement:
    Given *user_id*, return the associated User object.

    :param unicode user_id: user_id (email) user to retrieve

    """
    return User.query.get(user_id)
