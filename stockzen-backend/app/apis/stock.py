import app.utils.crud_utils as util
from app.utils import db_utils as db
from app.utils.enums import Response
from flask import request
from flask_login import current_user
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, fields, marshal

api = Namespace("stock", description="Stock related operations")

# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================

stock_list_response = api.model(
    "Response: Portfolio stock list",
    {
        "id": fields.Integer(required=True, description="stock id"),
        "code": fields.String(required=True, description="stock symbol code"),
        "stockName": fields.String(
            attribute="stock_name", required=True, description="stock name"
        ),
        "price": fields.Float(
            required=True,
            description="price from stock_page",
        ),
        "change": fields.Float(required=True, description="daily change from stock_page"),
        "percChange": fields.Float(
            attribute="perc_change",
            required=True,
            description="percentage daily change from stock_page",
        ),
        "avgPrice": fields.Float(
            attribute="avg_price",
            required=True,
            description="average price of bought lots",
        ),
        "unitsHeld": fields.Integer(
            attribute="units_held",
            required=True,
            description="number of units currently held",
        ),
        "gain": fields.Float(required=True, description="capital gain made by stock"),
        "percGain": fields.Float(
            attribute="perc_gain",
            required=True,
            description="percentage capital gain made by stock",
        ),
        "value": fields.Float(required=True, description="stock market value"),
    },
)

stock_add_request = api.model(
    "Request: Create new stock row within portfolio",
    {
        "stockPageId": fields.Integer(
            required=True, description="stock page id for added stock"
        ),
    },
)

stock_update_request = api.model(
    "Request: Rename stock row",
    {
        "newName": fields.String(required=True, description="new stock name"),
    },
)

# ==============================================================================
# API Routes/Endpoints
# ==============================================================================


@api.route("/<portfolioId>")
class StockCRUD(Resource):
    @login_required
    @api.marshal_list_with(stock_list_response)
    @api.response(200, "Successfully retrieved list")
    @api.response(404, "User not found")
    def get(self, portfolioId):
        """List all stocks from a portfolio"""
        portfolio_id = portfolioId
        stock_list = util.get_stock_list(portfolio_id)
        return stock_list

    @login_required
    @api.expect(stock_add_request)
    def post(self, portfolioId):
        """Create a new stock row"""
        json = marshal(request.json, stock_add_request)
        portfolio_id = portfolioId
        stock_page_id = json["stockPageId"]

        if util.add_stock(portfolio_id, stock_page_id) == Response.STOCK_ADDED:
            return {"message": "stock successfully added"}, 200

        return {"message": "Could not add stock"}, 500


@api.route("/<stockId>")
class StockCRUD(Resource):
    @login_required
    # @api.expect(stock_fetch_request)
    @api.response(200, "Successfully retrieved stock row data")
    @api.response(404, "Stock not found")
    def get(self, stockId):
        """Fetch data for a stock - YET TO IMPLEMENT"""
        # TODO: NEED TO IMPLEMENT - return single stock row data
        return

    @login_required
    @api.response(200, "Successfully deleted stock")
    @api.response(404, "Stock not found")
    def delete(self, stockId):
        """Delete an existing stock row"""
        stock_id = stockId

        if util.delete_stock(stock_id) == Response.STOCK_DELETED:
            return {"message": "stock successfully deleted"}, 200

        return {"message": "stock could not be deleted"}, 500
