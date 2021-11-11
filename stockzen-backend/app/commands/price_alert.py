import datetime
import time

from app import db, mail
from app.config import MAIL_SENDER
from app.models.schema import Portfolio, PriceAlert, Stock, StockPage, User
from flask.cli import AppGroup
from flask_mail import Message
from sqlalchemy import func, not_, or_, select, update
from yfinance import Ticker

user_cli = AppGroup("price-alert")


# A command to run in the server
@user_cli.command("run")
def do_price_alert():
    print("Running the price alert script. Use Ctrl+C to abort the script")

    while True:
        try:
            # Query the stock that we need to get the history
            stock_alerts = query_active_price_alert_info()

            # For each if them
            for stock_alert in stock_alerts:
                print("Checking alert", stock_alert.code)

                # Limit the start of the history to be 60 days.
                start_date = max(
                    [
                        stock_alert.min_date,
                        datetime.datetime.now() - datetime.timedelta(days=60),
                    ]
                )

                # Query the history from yfinance
                history = Ticker(stock_alert.code).history(
                    start=start_date, interval="30m"
                )

                # Check if there any alert matched.
                has_high = (history["High"] >= stock_alert.min_high).any()
                has_low = (history["Low"] <= stock_alert.max_low).any()

                if has_high:
                    notify_high_threshold(history, stock_alert)

                if has_low:
                    notify_low_threshold(history, stock_alert)

                update_price_alert_check_time(stock_alert.id)

                time.sleep(1)
        except KeyboardInterrupt:
            break
        except Exception as ex:
            print(ex)

        print("Sleeping")
        time.sleep(30 * 60)


def query_active_price_alert_info():
    """Query for stock_pages that users have set a threshold for it"""

    stmt = (
        # Select the relavence data
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
        # Where the alert is active
        .where(
            or_(
                not_(PriceAlert.is_high_threshold_alerted),
                not_(PriceAlert.is_low_threshold_alerted),
            )
        )
        # Select only the stock_page
        .group_by(StockPage.id, StockPage.code)
    )

    return db.session.execute(stmt)


def update_price_alert_check_time(stock_page_id):
    """Update the last_check_time to be now"""

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
    """Get the PriceAlert that pass the threshold"""

    stmt = (
        # Select the relavence data
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
        # Where the high_threshold is lower then threshold
        .where(
            Stock.stock_page_id == stock_page_id,
            not_(PriceAlert.is_high_threshold_alerted),
            PriceAlert.high_threshold != None,
            PriceAlert.high_threshold <= threshold,
        )
    )

    return db.session.execute(stmt)


def notify_high_threshold(history, stock_alert):
    price_alerts = query_high_price_alerts(stock_alert.id, history["High"].max())

    # For each price_alert
    for price_alert in price_alerts:
        # Reader the save time of the price_alert and check if there any history
        # such that the High is more than the threshold
        user_save_date = price_alert.user_save_time.strftime("%Y-%m-%d %H:%M:%S")
        alert_row = history[
            (history.index >= user_save_date)
            & (history["High"] >= price_alert.high_threshold)
        ]

        if alert_row.empty:
            continue

        alert_row = alert_row.iloc[0]

        # Construct and send the mail
        alert_date = alert_row.name.strftime("%d %B %H:%M")
        msg = f"""The high price alert for {price_alert.code} in portfolio {price_alert.portfolio_name} has bean reached on {alert_date} with the price of {alert_row['High']:.2f}."""

        message = Message(
            f"[Stockzen] High price alert for stock {price_alert.code}",
            sender=MAIL_SENDER,
            recipients=[price_alert.email],
            body=msg,
        )

        mail.send(message)

        # Log the message
        print(f"High price alert of {price_alert.code} has been sent to {price_alert.email}")

        # Update the price_alert so that it's marked as alerted
        stmt = (
            update(PriceAlert)
            .where(PriceAlert.id == price_alert.id)
            .values(is_high_threshold_alerted=1)
        )

        db.session.execute(stmt)

        db.session.commit()


def query_low_price_alerts(stock_page_id, threshold):
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
    price_alerts = query_low_price_alerts(stock_alert.id, history["Low"].min())

    # For each price_alert
    for price_alert in price_alerts:
        # Reader the save time of the price_alert and check if there any history
        # such that the Low is less than the threshold
        user_save_date = price_alert.user_save_time.strftime("%Y-%m-%d %H:%M:%S")
        alert_row = history[
            (history.index >= user_save_date)
            & (history["Low"] <= price_alert.low_threshold)
        ]

        if alert_row.empty:
            continue

        alert_row = alert_row.iloc[0]


        # Construct and send the mail
        alert_date = alert_row.name.strftime("%d %B %H:%M")
        msg = f"""The low price alert for {price_alert.code} in portfolio {price_alert.portfolio_name} has bean reached on {alert_date} with the price of {alert_row['Low']:.2f}."""

        message = Message(
            f"[Stockzen] Low price alert for stock {price_alert.code}",
            sender=MAIL_SENDER,
            recipients=[price_alert.email],
        )
        message.body = msg

        mail.send(message)

        # Log the message
        print(f"Low price alert of {price_alert.code} has been sent to {price_alert.email}")


        # Update the price_alert so that it's marked as alerted
        stmt = (
            update(PriceAlert)
            .where(PriceAlert.id == price_alert.id)
            .values(is_low_threshold_alerted=1)
        )

        db.session.execute(stmt)

        db.session.commit()


def init_app(app):
    app.cli.add_command(user_cli)
