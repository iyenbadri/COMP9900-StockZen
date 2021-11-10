from datetime import datetime, timedelta

from app.config import CHALLENGE_PERIOD
from app.models.schema import Challenge
from app.utils import db_utils, utils
from app.utils.enums import Status


def start_challenge(start_date):
    """activate challenge"""
    try:
        new_challenge = Challenge(start_date=start_date, is_active=True, is_open=True)
        db_utils.insert_item(new_challenge)
        while datetime.now() < start_date:
            continue
        challenge = Challenge.query.filter_by(start_date=start_date).one()
        challenge_id = challenge.id
        db_utils.update_item_columns(
            Challenge,
            challenge_id,
            {"is_open": False},
        )
        while datetime.now() < start_date + timedelta(seconds=CHALLENGE_PERIOD):
            continue
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
    """deactive challenge"""
    try:
        # update all challenge stocks
        utils.bulk_challenge_fetch(await_all=True)

    except Exception as e:
        utils.debug_exception(e, suppress=True)
        return Status.FAIL
