from app import db
from app.database.schema import Users

# from sqlalchemy import create_engine

#  returns an SQLA engine
# TODO: change echo to False for production
# def create_sqla_engine():
#     engine = create_engine(f"sqlite://{APP_DB_PATH}")
#     return engine


def commit_user(new_user: Users) -> bool:
    try:
        db.session.add(new_user)
        db.session.commit()
        return True
    except:
        return False


# def add_new_user()
