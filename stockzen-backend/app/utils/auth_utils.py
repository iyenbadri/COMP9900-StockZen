from typing import Dict, Union

from app.models.schema import User

from . import db_utils as db
from .enums import AuthStatus


def email_exists(email: str) -> AuthStatus:
    """Check if user email already exists"""
    if db.query_user(email):
        return AuthStatus.USER_FOUND
    return AuthStatus.USER_NOT_FOUND


def add_user(
    email: str, first_name: str, last_name: str, plain_password: str
) -> AuthStatus:
    """Add a user to the database, return bool of success status"""
    new_user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
    new_user.set_password(plain_password)  # carry out hash and save to user object

    if db.insert_user(new_user):
        return AuthStatus.USER_ADDED
    return AuthStatus.USER_NOT_ADDED


def validate_login(email: str, plain_password: str) -> Union[User, AuthStatus]:
    """Validates user login and returns response message"""
    user = db.query_user(email)

    if not user:
        return AuthStatus.USER_NOT_FOUND
    if user.check_password(plain_password):
        return user
    else:
        return AuthStatus.INCORRECT_PASSWORD


UserDetails = Dict[str, str]


def extract_user_details(user: User) -> UserDetails:
    """Takes a User instance and returns user details dict"""
    return {"firstName": user.first_name, "lastName": user.last_name}
