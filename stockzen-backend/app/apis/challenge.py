from datetime import datetime

from app.utils import crud_utils, utils
from app.utils.enums import Status
from flask import request
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, abort, fields, marshal

api = Namespace("challenge", description="Portfolio Challenge related operations")


# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================

challenge_leaderboard = api.model(
    "Nested: Portfolio challenge leaderboard (the last non-active challenge on the list)",
    {
        "userId": fields.Integer(
            attribute="user_id", required=True, description="user's id"
        ),
        "userName": fields.String(
            attribute="user_name", required=True, description="user's concatenated name"
        ),
        "percChange": fields.Float(
            attribute="perc_change",
            required=True,
            description="user submission's aggregate change",
        ),
        "stocks": fields.List(
            fields.String(),
            attribute="stock_codes",
            required=True,
            description="user's submission stock symbols in desc order of percChange",
        ),
    },
)

leaderboard_wrapped_response = api.model(
    "Response: Wrapper for Leaderboard AND start/end dates",
    {
        "startDate": fields.DateTime(
            attribute="start_date", required=True, description="challenge start datetime"
        ),
        "endDate": fields.DateTime(
            attribute="end_date", required=True, description="challenge end datetime"
        ),
        "leaderboard": fields.List(
            fields.Nested(
                challenge_leaderboard,
                required=True,
                description="challenge leaderboard list",
            )
        ),
        "userRow": fields.Nested(
            challenge_leaderboard,
            attribute="user_row",
            required=True,
            description="user's leaderboard row",
        ),
    },
)

challenge_status_response = api.model(
    "Response: Leaderboard challenge status (for the last challenge on the list)",
    {
        "challengeId": fields.Integer(
            attribute="id", required=True, description="challenge id"
        ),
        "startDate": fields.DateTime(
            attribute="start_date", required=True, description="challenge start datetime"
        ),
        "endDate": fields.DateTime(
            attribute="end_date", required=True, description="challenge end datetime"
        ),
        "isActive": fields.Boolean(
            attribute="is_active",
            required=True,
            description="whether challenge has reached end date",
        ),
        "isOpen": fields.Boolean(
            attribute="is_open",
            required=True,
            description="whether challenge submissions are open",
        ),
    },
)

challenge_entry_request = api.model(
    "Request: Submit a portfolio challenge entry ",
    {
        "stockPageId": fields.Integer(
            required=True, description="stock page id for entry"
        ),
    },
)

# ==============================================================================
# API Routes/Endpoint for Challenge
# ==============================================================================


@api.route("/leaderboard")
class ChallengeCRUD(Resource):
    @login_required
    @api.marshal_with(leaderboard_wrapped_response)
    @api.response(200, "Leaderboard successfully returned")
    @api.response(404, "No challenge found")
    def get(self):
        """Return data for the Portfolio Challenge Leaderboard"""

        # get leaderboard date for last challenge period
        result = crud_utils.get_leaderboard_results()

        if result == Status.NOT_EXIST:
            return abort(404, "No previous challenge found")

        if result == Status.FAIL:
            return abort(500, "Could not get challenge leaderboard")

        return result


@api.route("/status")
class ChallengeCRUD(Resource):
    @login_required
    @api.marshal_with(challenge_status_response)
    @api.response(200, "Last challenge status successfully returned")
    @api.response(404, "No challenge found")
    def get(self):
        """Return whether there is an active Challenge (is_active) and whether submissions are being accepted (is_open)"""

        challenge_status = crud_utils.get_leaderboard_status()

        if challenge_status == Status.FAIL:
            return abort(404, "Challenge status not found")

        return challenge_status


@api.route("/submit")
class ChallengeCRUD(Resource):
    @login_required
    @api.expect([challenge_entry_request])
    @api.response(200, "Challenge portfolio successfully submitted")
    @api.response(409, "Prior Challenge portfolio already exists")
    def post(self):
        """Submits a user's challenge portfolio to the database"""

        json_list = marshal(request.json, challenge_entry_request)
        stock_list = [item["stockPageId"] for item in json_list]

        challenge_id, _ = utils.get_open_challenge()

        status = crud_utils.add_challenge_stocks(stock_list, challenge_id)

        if status == Status.NOT_EXIST:
            return abort(404, "No open challenge found")

        if status == Status.FAIL:
            return abort(409, "User has already submitted a Challenge portfolio")

        return {"message": "Challenge portfolio successfully submitted"}, 200
