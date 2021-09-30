from typing import Union

from app import db
from app.database.schema import User


def query_user(email: str) -> Union[User, None]:
    """Query a user from the database by email, returns query result or None"""
    user = User.query.filter_by(email=email).first()
    return user


def commit_user(new_user: User) -> bool:
    try:
        db.session.add(new_user)
        db.session.commit()
        return True
    except:
        return False
