from typing import Union

from app import db
from app.models.schema import User
from sqlalchemy import func


def query_user(email: str) -> Union[User, None]:
    """Query a user from the database by email, returns query result or None"""
    user = User.query.filter(func.lower(User.email) == func.lower(email)).first()
    return user


def commit_user(new_user: User) -> bool:
    """Commit a new user to the database, returns success bool"""
    try:
        db.session.add(new_user)
        db.session.commit()
        return True
    except:
        return False
