import app.utils.crud_utils as util
from app.utils.enums import Status
from flask import request
from flask_login import current_user
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, fields, marshal

api = Namespace("portfolio", description="Portfolio related operations")

# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================

portfolio_list_response = api.model(
    "Response: User portfolio list",
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
        "prediction": fields.Integer(
            description="ML Classifier prediction on stock price"
        ),
        "confidence": fields.Float(description="Confidence of prediction"),
    },
)

portfolio_add_request = api.model(
    "Request: Create new portfolio",
    {
        "portfolioName": fields.String(required=True, description="portfolio name"),
    },
)

portfolio_update_request = api.model(
    "Request: Rename portfolio",
    {
        "newName": fields.String(required=True, description="new portfolio name"),
    },
)

# ==============================================================================
# API Routes/Endpoints
# ==============================================================================


@api.route("/list")
class PortfolioCRUD(Resource):
    @login_required
    @api.marshal_list_with(portfolio_list_response)
    @api.response(200, "Successfully retrieved list")
    @api.response(404, "User not found")
    def get(self):
        """List all portfolios from a user"""

        portfolio_list = util.get_portfolio_list()

        return portfolio_list


@api.route("")
class PortfolioCRUD(Resource):
    @login_required
    @api.expect(portfolio_add_request)
    @api.response(200, "Successfully created new portfolio")
    @api.response(404, "User not found")
    def post(self):
        """Create a new portfolio"""

        json = marshal(request.json, portfolio_add_request)

        portfolio_name = json["portfolioName"]

        if util.add_portfolio(portfolio_name) == Status.SUCCESS:
            return {"message": "portfolio successfully created"}, 200

        return {"message": "portfolio could not be created"}, 500


@api.route("/<portfolioId>")
class PortfolioCRUD(Resource):
    @login_required
    @api.response(200, "Successfully retrieved portfolio data")
    @api.response(404, "Portfolio not found")
    def get(self, portfolioId):
        """Fetch data for a portfolio"""

        portfolio_item = util.fetch_portfolio(portfolioId)

        if portfolio_item == Status.FAIL:
            return {"message": "portfolio could not be found"}, 404

        return portfolio_item

    @login_required
    @api.expect(portfolio_update_request)
    @api.response(200, "Successfully updated portfolio name")
    @api.response(404, "Portfolio not found")
    def put(self, portfolioId):
        """Rename an existing portfolio"""

        json = marshal(request.json, portfolio_update_request)

        new_name = json["newName"]

        if util.update_portfolio_name(portfolioId, new_name) == Status.SUCCESS:
            return {"message": "portfolio name successfully updated"}, 200

        return {"message": "portfolio name could not be updated"}, 500

    @login_required
    @api.response(200, "Successfully deleted portfolio")
    @api.response(404, "Portfolio not found")
    def delete(self, portfolioId):
        """Delete an existing portfolio"""

        if util.delete_portfolio(portfolioId) == Status.SUCCESS:
            return {"message": "portfolio successfully deleted"}, 200

        return {"message": "portfolio could not be deleted"}, 500
