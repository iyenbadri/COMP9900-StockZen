import app.utils.crud_utils as util
from app.utils.calc_utils import calc_summary, cascade_updates
from app.utils.enums import Status
from flask import request
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, abort, fields, marshal

api = Namespace("portfolio", description="Portfolio related operations")

# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================

portfolio_details_response = api.model(
    "Response: User portfolio details (/list is in [] form)",
    {
        "id": fields.Integer(required=True, description="portfolio id"),
        "portfolioName": fields.String(
            attribute="portfolio_name", required=True, description="portfolio name"
        ),
        "stockCount": fields.Integer(
            attribute="stock_count",
            required=True,
            description="no. of stocks in this portfolio",
        ),
        "value": fields.Float(required=True, description="portfolio market value"),
        "change": fields.Float(required=True, description="daily change in value"),
        "percChange": fields.Float(
            attribute="perc_change",
            required=True,
            description="percentage daily change in value",
        ),
        "gain": fields.Float(
            required=True, description="capital gains made by portfolio"
        ),
        "percGain": fields.Float(
            attribute="perc_gain",
            required=True,
            description="percentage capital gains made by portfolio",
        ),
        "order": fields.Integer(required=True, description="portfolio order"),
    },
)

portfolio_add_request = api.model(
    "Request: Create new portfolio",
    {
        "portfolioName": fields.String(required=True, description="portfolio name"),
    },
)

portfolio_rename_request = api.model(
    "Request: Rename portfolio",
    {
        "newName": fields.String(required=True, description="new portfolio name"),
    },
)

portfolio_reorder_request = api.model(
    "Request: Reorder portfolios",
    {
        "id": fields.Integer(required=True, description="portfolio id"),
        "order": fields.Integer(required=True, description="new portfolio order"),
    },
)

# ==============================================================================
# API Routes/Endpoints
# ==============================================================================


@api.route("/list")
class PortfolioCRUD(Resource):
    @login_required
    @api.marshal_list_with(portfolio_details_response)
    @api.response(200, "Successfully retrieved list")
    def get(self):
        """List all portfolios from a user"""

        portfolio_list = util.get_portfolio_list()
        if portfolio_list == Status.FAIL:
            return abort(500, "Portfolio list for this user could not be retrieved")

        cascade_updates(refresh_data=False)  # cascade calculations updates
        return portfolio_list

    @login_required
    @api.expect([portfolio_reorder_request])
    @api.response(200, "Successfully updated list order")
    @api.response(409, "Error: Non-unique order numbers")
    def put(self):
        """Update portfolio list row ordering"""

        reorder_request = marshal(
            request.json, portfolio_reorder_request
        )  # array of json objects

        # return error if any order is non-unique
        orderList = [json["order"] for json in reorder_request]
        if len(orderList) > len(set(orderList)):
            return abort(409, "Failed because non-unique order numbers were provided")

        if util.reorder_portfolio_list(reorder_request) == Status.SUCCESS:
            return {"message": "Portfolio list successfully reordered"}, 200

        return abort(500, "Portfolio list could not be reordered")


portfolio_summary_response = api.model(
    "Response: User portfolio performance summary details",
    {
        "holdings": fields.Float(required=True, description="total holdings value"),
        "today": fields.Float(required=True, description="percentage change today"),
        "overall": fields.Float(required=True, description="percentage gain today"),
    },
)


@api.route("/list/summary")
class PortfolioCRUD(Resource):
    @login_required
    @api.marshal_list_with(portfolio_summary_response)
    @api.response(200, "Successfully retrieved summary")
    def get(self):
        """Return portfolio performance summary"""

        summary = calc_summary()
        # WRITE SCHEMA
        # SAVE TO DATABASE IN CASCADE
        # TODO: WRITE CRUD UTIL FOR DATABASE
        if summary == Status.FAIL:
            return abort(
                500, "Portfolio performance summary for this user could not be retrieved"
            )
        print(summary)

        return summary


@api.route("")
class PortfolioCRUD(Resource):
    @login_required
    @api.expect(portfolio_add_request)
    @api.response(200, "Successfully created new portfolio")
    def post(self):
        """Create a new portfolio"""

        json = marshal(request.json, portfolio_add_request)

        portfolio_name = json["portfolioName"]

        if util.add_portfolio(portfolio_name) == Status.SUCCESS:
            return {"message": "Portfolio successfully created"}, 200

        return abort(500, "Portfolio could not be created")


@api.route("/<int:portfolioId>")
class PortfolioCRUD(Resource):
    @login_required
    @api.marshal_with(portfolio_details_response)
    @api.response(200, "Successfully retrieved portfolio data")
    @api.response(404, "Portfolio not found")
    def get(self, portfolioId):
        """Fetch data for a portfolio"""

        portfolio_item = util.fetch_portfolio(portfolioId)

        if portfolio_item == Status.FAIL:
            return abort(404, "Portfolio could not be found")

        return portfolio_item

    @login_required
    @api.expect(portfolio_rename_request)
    @api.response(200, "Successfully updated portfolio name")
    def put(self, portfolioId):
        """Rename an existing portfolio"""

        json = marshal(request.json, portfolio_rename_request)

        new_name = json["newName"]

        if util.update_portfolio_name(portfolioId, new_name) == Status.SUCCESS:
            return {"message": "Portfolio name successfully updated"}, 200

        return abort(500, "Portfolio name could not be updated")

    @login_required
    @api.response(200, "Successfully deleted portfolio")
    def delete(self, portfolioId):
        """Delete an existing portfolio"""

        if util.delete_portfolio(portfolioId) == Status.SUCCESS:
            return {"message": "Portfolio successfully deleted"}, 200

        return abort(500, "Portfolio could not be deleted")
