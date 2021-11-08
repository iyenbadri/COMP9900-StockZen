from app.utils import crud_utils, utils
from app.utils.enums import Status
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, abort, fields

api = Namespace("challenge", description="Portfolio Challenge related operations")


# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================


challenge_entry_request = api.model(
    "Request: Submit a portfolio challenge entry",
    {
        "stockPageId": fields.Integer(
            required=True, description="stock page id for entry"
        ),
    },
)

challenge_leaderboard_response = api.model(
    "Response: Portfolio challenge leaderboard",
    {
        "userId": fields.Integer(
            attribute="user_id", required=True, description="user's id"
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


# ==============================================================================
# API Routes/Endpoint for Challenge
# ==============================================================================


@api.route("/leaderboard")
class ChallengeCRUD(Resource):
    @login_required
    @api.marshal_with(challenge_leaderboard_response)
    @api.response(200, "Leaderboard successfully returned")
    @api.response(404, "No challenge found")
    def get(self):
        """Return data for the Portfolio Challenge Leaderboard"""

        # update all challenge stocks
        utils.bulk_challenge_fetch(await_all=True)

        # get leaderboard date for last challenge period
        leaderboard_list = crud_utils.get_leaderboard_results()

        if leaderboard_list == Status.NOT_EXIST:
            return abort(404, "No previous challenge found")

        if leaderboard_list == Status.FAIL:
            return abort(500, "Could not get challenge leaderboard")

        return leaderboard_list
