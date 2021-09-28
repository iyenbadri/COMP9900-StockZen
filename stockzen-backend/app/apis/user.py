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
from app.database.schema import Users
from flask import redirect, request, url_for
from flask_restx import Namespace, Resource, abort, fields, marshal

api = Namespace("user", description="User related operations")

userRegisterReq = api.model(
    "Incoming user data on Register",
    {
        "first_name": fields.String(required=True, description="first name"),
        "last_name": fields.String(required=True, description="last name"),
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
        loginRequest = marshal(api.payload, userLoginReq)

        pwdSalt = crypt.mksalt()
        hashedPwd = crypt.crypt(loginRequest["password"], pwdSalt)

        # some function to verify user from database
        # try:
        # # this function should use werkzeug.security.check_password_hash internally
        #   dbVerifyUser(loginData.email, hashedPwd)
        # catch:
        #   abort(401, type="verifyError")
        # somefunction to fetch user initials from db
        # try:
        #   id, initials = dbGetLogin();
        # catch:
        #   abort(500, type="dbError")

        return {"id": 12345, "initials": "TEST_INITIALS"}  # mock response


@api.route("/register")
class User(Resource):
    def post(self):
        registerRequest = marshal(request.form, userRegisterReq)

        import pprint

        pprint(registerRequest)

        email = registerRequest.email
        first_name = registerRequest.first_name
        last_name = registerRequest.last_name
        plain_password = registerRequest.password

        user = auth.get_user(email)
        if user:
            return {"message": "user already exists"}, 409

        if auth.add_user(email, first_name, last_name, plain_password):
            return {"message": "user successfully registered"}, 200

        # some function to try adding user to database
        # try:
        #   dbAddUser(registerRequest)
        # catch:
        #   abort(500, type="dbError")


@login_manager.user_loader
def user_loader(user_id: int):
    """Given *user_id*, return the associated User object.

    :param unicode user_id: user_id (email) user to retrieve

    """
    return Users.query.get(user_id)
