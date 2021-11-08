import app.utils.crud_utils as util
from app.utils.enums import Status
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, abort, fields, marshal

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
    @api.response(404, "No active challenge or entries found")
    def get(self):
        """Return data for the Portfolio Challenge Leaderboard"""

        leaderboard_list = util.get_leaderboard()
        print(leaderboard_list)

        if leaderboard_list == Status.FAIL:
            return abort(500, "Could not get challenge leaderboard")

        return leaderboard_list
