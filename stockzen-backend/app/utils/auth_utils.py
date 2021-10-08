from typing import Dict, Union

from app.models.schema import User

from . import db_utils as db
from .enums import Response


def email_exists(email: str) -> Response:
    """Check if user email already exists"""
    if db.query_user(email):
        return Response.USER_FOUND
    return Response.USER_NOT_FOUND


def add_user(
    email: str, first_name: str, last_name: str, plain_password: str
) -> Response:
    """Add a user to the database, return response status"""
    new_user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
    new_user.set_password(plain_password)  # carry out hash and save to user object

    if db.insert_row(new_user):
        return Response.USER_ADDED
    return Response.USER_NOT_ADDED


def validate_login(email: str, plain_password: str) -> Union[User, Response]:
    """Validates user login and returns response message"""
    user = db.query_user(email)

    if not user:
        return Response.USER_NOT_FOUND
    if user.check_password(plain_password):
        return user
    else:
        return Response.INCORRECT_PASSWORD


UserDetails = Dict[str, str]


def extract_user_details(user: User) -> UserDetails:
    """Takes a User instance and returns user details dict"""
    return {"first_name": user.first_name, "last_name": user.last_name}
