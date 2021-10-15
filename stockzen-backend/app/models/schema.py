from datetime import datetime

from app import db
from flask_login import UserMixin
from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import backref, relationship
from sqlalchemy.sql.sqltypes import Boolean, DateTime, Float, Numeric
from werkzeug.security import check_password_hash, generate_password_hash

# https://docs.sqlalchemy.org/en/14/orm/basic_relationships.html

# SQL uses implicit auto-increment, no need to specify for non-composite PK


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

    # Relationships
    # one-to-many user:portfolios
    portfolios = relationship(
        "Portfolio",
        backref=backref("user", lazy="select"),
        lazy="select",
        cascade="all, delete, delete-orphan",  # want children/disassociated children to be removed on delete as well
    )
    stocks = relationship(
        "Stock",
        backref=backref("user", lazy="select"),
        lazy="select",
        cascade="all, delete, delete-orphan",
    )
    lots_bought = relationship(
        "LotBought",
        backref=backref("user", lazy="select"),
        lazy="select",
        cascade="all, delete, delete-orphan",
    )
    lots_sold = relationship(
        "LotSold",
        backref=backref("user", lazy="select"),
        lazy="select",
        cascade="all, delete, delete-orphan",
    )

    def __repr__(self):
        return f"<User(id={self.id}, first_name={self.first_name}, last_name{self.last_name}, email={self.email})>"


class Portfolio(db.Model):
    __tablename__ = "portfolios"
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    portfolio_name = Column(String(50), nullable=False)
    stock_count = Column(Integer, default=0)  # count(stocks)
    value = Column(Float, default=0)  # sum(stocks.value)
    change = Column(Float, default=0)  # sum(stocks.change)
    perc_change = Column(Float, default=0)  # portfolios.change / portfolios.value
    gain = Column(Float, default=0)  # sum(stocks.gain)
    perc_gain = Column(Float, default=0)  # portfolios.gain / portfolios.value
    order = Column(Integer, nullable=False, default=0)  # track row order, default to top
    last_updated = Column(DateTime, default=datetime.now())

    # Relationships
    # one-to-many portfolio:stocks
    stocks = relationship(
        "Stock",
        backref=backref("portfolio", lazy="select"),
        lazy="select",
        cascade="all, delete, delete-orphan",
    )

    def __repr__(self):
        return f"<Portfolio(id={self.id}, user_id={self.user_id}, portfolio_name={self.portfolio_name}, stock_count={self.stock_count})>"


class Stock(db.Model):
    __tablename__ = "stocks"
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    stock_page_id = Column(
        Integer, ForeignKey("stock_pages.id"), nullable=False
    )  # to get current price, change, percent_change, prediction, confidence
    code = Column(String(6))
    stock_name = Column(String(40))
    price = Column(Float)  # = stock_pages.price
    change = Column(Float)  # = stock_pages.change
    perc_change = Column(Float)  # = stock_pages.perc_change
    avg_price = Column(Float)  # = bought.avg_price
    units_held = Column(Integer)  # sum(bought.units) - sum(sold.units)  -> not displayed
    gain = Column(Float)  # (stocks.price - bought.avg_price) * stocks.units_held
    perc_gain = Column(Float)  # stocks.gain / (stocks.units_held * bought.avg_price)
    value = Column(Float)  # sum(bought.value)
    order = Column(Integer, nullable=False, unique=True, default=id)  # track row order
    last_updated = Column(DateTime, default=datetime.now())

    # Relationships
    # one-to-many stock:lots
    lots_bought = relationship(
        "LotBought",
        backref=backref("stock", lazy="select"),
        lazy="select",
        cascade="all, delete, delete-orphan",
    )
    lots_sold = relationship(
        "LotSold",
        backref=backref("stock", lazy="select"),
        lazy="select",
        cascade="all, delete, delete-orphan",
    )

    # Unique Constraints (multiple column)
    UniqueConstraint(user_id, portfolio_id, stock_page_id)

    def __repr__(self):
        return f"<Stock(id={self.id}, portfolio_id={self.portfolio_id}, code={self.code}, stock_name={self.stock_name})>"


class LotBought(db.Model):
    __tablename__ = "lots_bought"
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    trade_date = Column(DateTime)  # <user>
    units = Column(Integer)  # <user>
    unit_price = Column(Float)  # <user>
    value = Column(Float)  # stocks.price * bought.unit_price
    change = Column(Float)  # bought.units * stock.change
    avg_price = Column(Float)  # sum(bought.units * bought.unit_price) / sum(bought.units)
    last_updated = Column(DateTime, default=datetime.now())


class LotSold(db.Model):
    __tablename__ = "lots_sold"
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    trade_date = Column(DateTime)  # <user>
    units = Column(Integer)  # <user>
    unit_price = Column(Float)  # <user>
    amount = Column(Float)  # sold.units * sold.unit_price
    realised = Column(Float)  # sold.units * (sold.unit_price * bought.avg_price)
    last_updated = Column(DateTime, default=datetime.now())


class StockPage(db.Model):
    __tablename__ = "stock_pages"
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    code = Column(String(6), unique=True)
    stock_name = Column(String(40))
    prediction = Column(Integer, default=0)  # -1 for down, 0 no change, 1 for up
    confidence = Column(Float, default=0)
    # TODO: Populate remaining columns

    # Relationships
    # one-to-many stock_pages:stocks
    stocks = relationship(
        "Stock",
        backref=backref("stock_pages", lazy="select"),
        lazy="select",
        cascade="all, delete, delete-orphan",
    )
