from typing import Tuple

from app.database.schema import User

from . import db_utils as db


def email_exists(email: str) -> bool:
    """Check if user email already exists"""
    return db.query_user(email) != None


def add_user(email: str, first_name: str, last_name: str, plain_password: str) -> bool:
    """Add a user to the database, return bool of success status"""
    new_user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
    new_user.set_password(plain_password)  # carry out hash and save to user object

    commit_successful = db.commit_user(new_user)
    return commit_successful


def validate_login(email: str, plain_password: str) -> Tuple[dict, int]:
    """Validates user login and returns response message"""
    user = db.query_user(email)

    if not user:
        return {"message": "User was not found"}, 403

    if user.check_password(plain_password):
        return {"message": "Login success"}, 200

    return {"message": "Incorrect password"}, 401
