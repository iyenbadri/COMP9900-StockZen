# ==============================================================================
# FOR EXAMPLES ON MARSHALLING ETC:
# https://flask-restx.readthedocs.io/en/latest/example.html
# https://flask-restx.readthedocs.io/en/latest/marshalling.html
# ACTUAL LOGIN HANDLING TO BE DONE WITH FLASK-LOGIN:
# https://flask-login.readthedocs.io/en/latest/
# Implementation: https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-v-user-logins
# ==============================================================================

import crypt

from app import login
from flask_restx import Namespace, Resource, abort, fields, marshal

api = Namespace("users", description="User related operations")

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
@login.user_loader
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
    @api.doc("create_new_user")
    def post(self):
        registerRequest = marshal(api.payload, userRegisterReq)
        # db should automatically increment user ID primary keys?

        # some function to try adding user to database
        # try:
        #   dbAddUser(registerRequest)
        # catch:
        #   abort(500, type="dbError")

        return {"message": "user successfully registered"}
