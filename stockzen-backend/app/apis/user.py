# ==============================================================================
# FOR EXAMPLES ON MARSHALLING ETC:
# https://flask-restx.readthedocs.io/en/latest/example.html
# https://flask-restx.readthedocs.io/en/latest/marshalling.html
# ACTUAL LOGIN HANDLING TO BE DONE WITH FLASK-LOGIN:
# https://flask-login.readthedocs.io/en/latest/
# Implementation: https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-v-user-logins
# ==============================================================================

import app.utils.auth_utils as auth
import app.utils.crud_utils as util
from app import login_manager
from app.models.schema import User
from app.utils.calc_utils import cascade_updates
from app.utils.enums import Status
from flask import request
from flask_login import current_user
from flask_login.utils import login_required, login_user, logout_user
from flask_restx import Namespace, Resource, abort, fields, marshal

api = Namespace("user", description="User related operations")

# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================

register_request = api.model(
    "Request: user register",
    {
        "firstName": fields.String(required=True, description="first name"),
        "lastName": fields.String(required=True, description="last name"),
        "email": fields.String(required=True, description="email address"),
        "password": fields.String(required=True, description="plaintext password"),
    },
)

login_request = api.model(
    "Request: user login",
    {
        "email": fields.String(required=True, description="email address"),
        "password": fields.String(required=True, description="plaintext password"),
    },
)

login_response = api.model(
    "Response: user login",
    {
        "firstName": fields.String(
            attribute="first_name", required=True, description="user first name"
        ),
        "lastName": fields.String(
            attribute="last_name", required=True, description="user last name"
        ),
    },
)

# ==============================================================================
# API Routes/Endpoints
# ==============================================================================


@api.route("/login")
@login_manager.user_loader
class UserCRUD(Resource):
    @api.marshal_with(login_response)
    @api.expect(login_request)
    @api.response(403, "User not found")
    @api.response(401, "Incorrect password")
    def post(self):
        """Log a user in"""
        json = marshal(request.json, login_request)

        email = json["email"]
        plain_password = json["password"]

        user = auth.validate_login(email, plain_password)

        if user == Status.NOT_FOUND:
            return abort(403, "User not found")

        elif user == Status.INCORRECT_PASSWORD:
            return abort(401, "Incorrect password")
        else:
            login_user(user)
            user_details = auth.extract_user_details(user)

            cascade_updates()  # refresh StockPage data and cascade calculations updates

            return user_details


@api.route("/register")
class UserCRUD(Resource):
    @api.expect(register_request)
    @api.response(200, "Successful registration")
    @api.response(409, "Registration conflict")
    @api.response(500, "Registration error")
    def post(self):
        """Register a new user"""
        json = marshal(request.json, register_request)

        email = json["email"].lower()
        first_name = json["firstName"]
        last_name = json["lastName"]
        plain_password = json["password"]

        if current_user.is_authenticated:
            return abort(409, "User already logged in")

        if auth.email_exists(email) == Status.FOUND:
            return abort(409, "Email already exists")

        if util.add_user(email, first_name, last_name, plain_password) == Status.SUCCESS:
            return {"message": "User successfully registered"}, 200

        return abort(500, "Registration error occurred")


@api.route("/details")
class UserCRUD(Resource):
    @login_required
    @api.doc("get user details")
    @api.marshal_with(login_response)
    @api.response(200, "User details found")
    @api.response(401, "Unauthorized")
    def get(self):
        """Fetch a user's details"""
        user_details = auth.extract_user_details(current_user)
        return user_details


@api.route("/<email>")
@api.doc(params={"email": "User email"})
class UserCRUD(Resource):
    @api.doc("check does email exist")
    @api.response(200, "User found")
    @api.response(404, "User not found")
    def head(self, email):
        """Check if an email already exists"""
        email_status = auth.email_exists(email)
        if email_status == Status.FOUND:
            return {"message": "User exists"}, 200
        return abort(404, "User not found")


@api.route("/logout")
class UserRouter(Resource):
    @login_required
    @api.response(200, "user logged out")
    def post(self):
        """Log out the current user"""

        logout_user()
        return {"message": "User successfully logged out"}, 200


# ==============================================================================
# Flask-Login Manager
# ==============================================================================
@login_manager.user_loader
def user_loader(user_id: int):
    """Flask_Login requirement:
    Given *user_id*, return the associated User object.

    :param unicode user_id: user_id (NOT email) user to retrieve

    """
    return User.query.get(user_id)
