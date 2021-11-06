from flask.cli import AppGroup
from yfinance import Ticker
import datetime
from sqlalchemy import or_, not_, select, func, update

from flask_mail import Message

user_cli = AppGroup("price-alert")


# A command to run in the server
@user_cli.command("run")
def do_price_alert():
    # Query the stock that we need to get the history
    stock_alerts = query_active_price_alert_info()

    # For each if them
    for stock_alert in stock_alerts:
        # Limit the start of the history to be 60 days.
        start_date = max(
            [stock_alert.min_date, datetime.datetime.now() - datetime.timedelta(days=60)]
        )

        # Query the history from yfinance
        history = Ticker(stock_alert.code).history(start=start_date, interval="30m")

        # Check if there any alert matched.
        has_high = (history["High"] >= stock_alert.min_high).any()
        has_low = (history["Low"] <= stock_alert.max_low).any()

        if has_high:
            notify_high_threshold(history, stock_alert)

        if has_low:
            notify_low_threshold(history, stock_alert)

        update_price_alert_check_time(stock_alert.id)


def query_active_price_alert_info():
    from app import db
    from app.models.schema import PriceAlert, Stock, StockPage

    stmt = (
        select(
            StockPage.id,
            StockPage.code,
            func.min(
                func.coalesce(PriceAlert.last_check_time, PriceAlert.user_save_time)
            ).label("min_date"),
            func.min(PriceAlert.high_threshold).label("min_high"),
            func.max(PriceAlert.low_threshold).label("max_low"),
        )
        .select_from(StockPage)
        .join(Stock)
        .join(PriceAlert)
        .where(
            or_(
                not_(PriceAlert.is_high_threshold_alerted),
                not_(PriceAlert.is_low_threshold_alerted),
            )
        )
        .group_by(StockPage.id, StockPage.code)
    )

    return db.session.execute(stmt)


def update_price_alert_check_time(stock_page_id):
    from app import db
    from app.models.schema import PriceAlert, Stock

    update_stmt = (
        update(PriceAlert)
        .where(
            PriceAlert.id.in_(
                select(PriceAlert.id)
                .join(Stock)
                .where(Stock.stock_page_id == stock_page_id)
            )
        )
        .values(last_check_time=datetime.datetime.now())
        .execution_options(synchronize_session=False)
    )

    db.session.execute(update_stmt)

    db.session.commit()


def query_high_price_alerts(stock_page_id, threshold):
    from app import db
    from app.models.schema import PriceAlert, Stock, StockPage, Portfolio, User

    stmt = (
        select(
            PriceAlert.id,
            PriceAlert.user_save_time,
            PriceAlert.high_threshold,
            StockPage.code,
            Portfolio.portfolio_name,
            User.email,
        )
        .select_from(PriceAlert)
        .join(Stock)
        .join(StockPage)
        .join(Portfolio)
        .join(User)
        .where(
            Stock.stock_page_id == stock_page_id,
            not_(PriceAlert.is_high_threshold_alerted),
            PriceAlert.high_threshold != None,
            PriceAlert.high_threshold <= threshold,
        )
    )

    return db.session.execute(stmt)


def notify_high_threshold(history, stock_alert):
    from app import db, mail
    from app.config import MAIL_SENDER
    from app.models.schema import PriceAlert

    price_alerts = query_high_price_alerts(stock_alert.id, history["High"].max())

    for price_alert in price_alerts:
        user_save_date = price_alert.user_save_time.strftime("%Y-%m-%d %H:%M:%S")
        alert_row = history[
            (history.index >= user_save_date)
            & (history["High"] >= price_alert.high_threshold)
        ]

        if alert_row.empty:
            continue

        alert_row = alert_row.iloc[0]

        msg = f"""The high price alert for {price_alert.code} in portfolio {price_alert.portfolio_name} has bean reached on {alert_row.name} with the price of {alert_row['High']}."""

        message = Message(
            f"[Stockzen] High price alert for stock {price_alert.code}",
            sender=MAIL_SENDER,
            recipients=[price_alert.email],
            body=msg,
        )

        mail.send(message)

        stmt = (
            update(PriceAlert)
            .where(PriceAlert.id == price_alert.id)
            .values(is_high_threshold_alerted=1)
        )

        db.session.execute(stmt)

        db.session.commit()


def query_low_price_alerts(stock_page_id, threshold):
    from app import db
    from app.models.schema import PriceAlert, Stock, StockPage, Portfolio, User

    stmt = (
        select(
            PriceAlert.id,
            PriceAlert.user_save_time,
            PriceAlert.low_threshold,
            StockPage.code,
            Portfolio.portfolio_name,
            User.email,
        )
        .select_from(PriceAlert)
        .join(Stock)
        .join(StockPage)
        .join(Portfolio)
        .join(User)
        .where(
            Stock.stock_page_id == stock_page_id,
            not_(PriceAlert.is_low_threshold_alerted),
            PriceAlert.low_threshold != None,
            PriceAlert.low_threshold >= threshold,
        )
    )

    return db.session.execute(stmt)


def notify_low_threshold(history, stock_alert):
    from app import db, mail
    from app.config import MAIL_SENDER
    from app.models.schema import PriceAlert

    price_alerts = query_low_price_alerts(stock_alert.id, history["Low"].min())

    for price_alert in price_alerts:
        user_save_date = price_alert.user_save_time.strftime("%Y-%m-%d %H:%M:%S")
        first_row = history[
            (history.index >= user_save_date)
            & (history["Low"] <= price_alert.low_threshold)
        ]

        if first_row.empty:
            continue

        first_row = first_row.iloc[0]

        msg = f"""The low price alert for {price_alert.code} in portfolio {price_alert.portfolio_name} has bean reached on {first_row.name} with the price of {first_row['Low']}."""

        message = Message(
            f"[Stockzen] Low price alert for stock {price_alert.code}",
            sender=MAIL_SENDER,
            recipients=[price_alert.email],
        )
        message.body = msg

        mail.send(message)

        stmt = (
            update(PriceAlert)
            .where(PriceAlert.id == price_alert.id)
            .values(is_low_threshold_alerted=1)
        )

        db.session.execute(stmt)

        db.session.commit()


def init_app(app):
    app.cli.add_command(user_cli)
