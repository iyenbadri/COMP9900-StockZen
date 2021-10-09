from typing import Dict, Union

from app.models.schema import User

from . import db_utils as db
from .enums import Status


def email_exists(email: str) -> Status:
    """Check if user email already exists"""
    try:
        db.query_user(email)
        return Status.FOUND
    except:
        return Status.NOT_FOUND


def validate_login(email: str, plain_password: str) -> Union[User, Status]:
    """Validates user login and returns response message"""
    try:
        user = db.query_user(email)
        if user.check_password(plain_password):
            return user
        else:
            return Status.INCORRECT_PASSWORD
    except:
        return Status.NOT_FOUND


UserDetails = Dict[str, str]


def extract_user_details(user: User) -> UserDetails:
    """Takes a User instance and returns user details dict"""
    return {"first_name": user.first_name, "last_name": user.last_name}
