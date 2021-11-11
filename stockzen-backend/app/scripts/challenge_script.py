import time
from datetime import datetime

from app.config import CHALLENGE_PERIOD, CHALLENGE_START, SLEEP_INTERVAL
from app.models.schema import Challenge
from app.utils import db_utils, utils
from app.utils.enums import Status
from flask.cli import AppGroup

user_cli = AppGroup("challenge")

# Command to run in the server
@user_cli.command("run")
def start_challenge():
    """Schedule a challenge according to CHALLENGE_START config parameter"""
    start_date = CHALLENGE_START
    try:
        new_challenge = Challenge(start_date=start_date, is_active=True, is_open=True)
        db_utils.insert_item(new_challenge)

        print("Now accepting challenge submissions.")
        while datetime.now() < start_date:
            try:
                print("Waiting for challenge to start...")
                time.sleep(SLEEP_INTERVAL)
            except KeyboardInterrupt:
                break
        print("Submission period has ended.")

        challenge = (
            Challenge.query.filter_by(is_open=True).order_by(Challenge.id.desc()).first()
        )
        challenge_id = challenge.id
        db_utils.update_item_columns(
            Challenge,
            challenge_id,
            {"is_open": False},
        )

        while datetime.now() < start_date + CHALLENGE_PERIOD:
            try:
                print("Waiting for challenge period to end...")
                time.sleep(SLEEP_INTERVAL)
            except KeyboardInterrupt:
                break
        print("Challenge period ended.")

        db_utils.update_item_columns(
            Challenge,
            challenge_id,
            {"is_active": False},
        )
        stop_challenge()
        return Status.SUCCESS

    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL


def stop_challenge():
    """Deactivate the active challenge"""
    try:
        # update all challenge stocks
        utils.bulk_challenge_fetch(await_all=True)
        print("All challenge stocks updated, leaderboard ready for viewing.")

    except Exception as e:
        utils.debug_exception(e)


def init_app(app):
    app.cli.add_command(user_cli)
