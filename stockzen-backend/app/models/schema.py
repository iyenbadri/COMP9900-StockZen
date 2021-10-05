from datetime import datetime

from sqlalchemy.sql.expression import table

from app import db
from flask_login import UserMixin
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import backref, relationship
from sqlalchemy.sql.schema import PrimaryKeyConstraint, Table
from sqlalchemy.sql.sqltypes import REAL, TIME, Boolean,DateTime, Float, Numeric
from werkzeug.security import check_password_hash, generate_password_hash

# https://docs.sqlalchemy.org/en/14/orm/basic_relationships.html

# SQL uses implicit auto-increment, no need to specify for non-composite PK

# https://flask-sqlalchemy.palletsprojects.com/en/2.x/models/
# Columns can store PickleType or LargeBinary!


class User(UserMixin, db.Model):
    """SQLAlchemy ORM class for user object ̦

    Inherits from UserMixin for default Flask-Login user states.
        Note:   Default ID for login management is User ID (PK),
                override get_id() to use an alternative ID
    """

    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    email = Column(String(40), unique=True)
    first_name = Column(String(40))
    last_name = Column(String(40))
    password_hash = Column(String(110))
    validated = Column(Boolean, default=True)  # FIXME: placeholder for validation feature

    

    def set_password(self, password) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password) -> bool:
        return check_password_hash(self.password_hash, password)

    portfolios = relationship('Portfolio', backref=backref("user", lazy="select"),lazy="select", cascade="all, delete-orphan")
    # # one-to-many relationship
    # listings = relationship(
    #     "Alerts",
    #     backref=backref("alerts", lazy="select"),
    #     lazy="select",
    #     cascade="all, delete-orphan",
    # )

    def __repr__(self):
        return f"<User {self.email}, ID {self.id}"

class Portfolio(db.Model):
    __tablename__= "portfolios" 
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    portfolio_name = Column(String(50), unique=True)
    stock_count = Column(Integer)
    market_value = Column(Float)
    daily_change = Column(Float)
    total_gain = Column(Float)
    timestamp = Column(DateTime)
    # stocks_added = relationship('Stock_Lot', backref=backref("portfolios", lazy="select"),lazy="select", cascade="all, delete-orphan")

class StockLot(db.Model):
    __tablename__= "stock_lots"
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    code = Column(String(6), unique=True)
    name = Column(String(40))
    price = Column(Float)
    added = Column(DateTime)
    change = Column(Float)
    avg_price = Column(Float)
    profit = Column(Float)
    value = Column(Float)
    parent_portfolio_id = Column(Integer, ForeignKey('portfolios.id'))