from datetime import datetime

import sqlalchemy
from app import db
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import backref, relationship
from sqlalchemy.sql.schema import PrimaryKeyConstraint, Table
from sqlalchemy.sql.sqltypes import Boolean, DateTime, Numeric
from werkzeug.security import check_password_hash, generate_password_hash

# https://docs.sqlalchemy.org/en/14/orm/basic_relationships.html

# SQL uses implicit auto-increment, no need to specify for non-composite PK

# https://flask-sqlalchemy.palletsprojects.com/en/2.x/models/
# Columns can store PickleType or LargeBinary!


class User(db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    email = Column(String(40), unique=True)
    first_name = Column(String(40))
    last_name = Column(String(40))
    password_hash = Column(String(110))
    authenticated = Column(Boolean, default=False)
    validated = Column(Boolean, default=True)

    def set_password(self, password) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password) -> bool:
        return check_password_hash(self.password_hash, password)

    # ==========================================================================
    # For Flask-Login
    # ==========================================================================
    def is_active(self):
        """True, as all users are active."""
        return self.validated

    def get_id(self):
        """Return the email address to satisfy Flask-Login's requirements."""
        return self.email

    def is_authenticated(self):
        """Return True if the user is authenticated (i.e. valid login)."""
        return self.authenticated

    def is_anonymous(self):
        return False

    # # one-to-many relationship
    # listings = relationship(
    #     "Alerts",
    #     backref=backref("alerts", lazy="select"),
    #     lazy="select",
    #     cascade="all, delete-orphan",
    # )

    def __repr__(self):
        return f"<User {self.email}, ID {self.id}"
