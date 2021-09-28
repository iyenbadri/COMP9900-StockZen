from app.database.schema import Users
from werkzeug.security import check_password_hash, generate_password_hash

from . import db_utils as db


# Returns query result if found, otherwise None
def get_user(email: str):
    user = Users.query.filter_by(email=email).first()
    return user


def add_user(email: str, first_name: str, last_name: str, plain_password: str) -> bool:
    hashed_password = generate_password_hash(plain_password, method="sha512")
    new_user = Users(
        email=email,
        first_name=first_name,
        last_name=last_name,
        password_hashed=hashed_password,
    )
    commit_success = db.commit_user(new_user)
    return commit_success


# def validate_user_pwd(email: str, pwdText: str )  -> bool:
