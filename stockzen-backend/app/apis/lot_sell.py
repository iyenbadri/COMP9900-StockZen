import app.utils.crud_utils as util
from app.utils.enums import LotType, Status
from dateutil import parser as dateparser
from flask import request
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, abort, fields, marshal

api = Namespace("lot", description="Lots related operations (Sell/Sell)")


# ==============================================================================
# SELL LOTS
# ==============================================================================

# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================

sell_lot_details_response = api.model(
    "Response: Stock row Sell Lots list (/list is in [] form)",
    {
        "id": fields.Integer(required=True, description="lot id"),
        "tradeDate": fields.String(
            attribute="trade_date", required=True, description="date of transaction"
        ),
        "units": fields.Integer(required=True, description="number of units sold"),
        "unitPrice": fields.Float(
            attribute="unit_price", required=True, description="price per unit sold"
        ),
        "amount": fields.Float(required=True, description="amount lots were sold for"),
        "realised": fields.Float(required=True, description="realised profit amount"),
    },
)

add_sell_lot_request = api.model(
    "Request: create a sell stock lot",
    {
        "tradeDate": fields.DateTime(
            required=True,
            description="date of trade",
            example="2021-10-27",
        ),
        "units": fields.Integer(required=True, description="units of shares in lot"),
        "unitPrice": fields.Float(required=True, description="price/unit paid"),
    },
)


# ==============================================================================
# API Routes/Endpoints
# ==============================================================================


@api.route("/sell/list/<int:stockId>")
class SellLotCRUD(Resource):
    @login_required
    @api.marshal_list_with(sell_lot_details_response)
    @api.response(200, "Successfully retrieved lot sell list")
    def get(self, stockId):
        """List all Sell Lots from a particular stock row"""

        lot_list = util.get_lot_list(LotType.SELL, stockId)
        if lot_list == Status.FAIL:
            return abort(500, "Sell Lot list for the stock row could not be retrieved")

        return lot_list


@api.route("/sell/<int:stockId>")
class SellLotCRUD(Resource):
    @login_required
    @api.expect(add_sell_lot_request)
    @api.response(200, "Successfully created a sell lot")
    def post(self, stockId):
        """Create a new Sell Lot"""

        json = marshal(request.json, add_sell_lot_request)
        trade_date = dateparser.parse(json["tradeDate"])
        units = json["units"]
        unit_price = json["unitPrice"]

        if (
            util.add_lot(LotType.SELL, stockId, trade_date, units, unit_price)
            == Status.SUCCESS
        ):
            return {"message": "Sell Lot successfully created"}, 200

        return abort(500, "Sell Lot could not be created")


@api.route("/sell/<int:lotId>")
class SellLotCRUD(Resource):
    @login_required
    @api.marshal_with(sell_lot_details_response)
    @api.response(200, "Successfully retrieved Sell Lot data")
    @api.response(404, "Sell Lot not found")
    def get(self, lotId):
        """Fetch data for a Sell Lot row within a stock row"""

        stock_item = util.fetch_lot(LotType.SELL, lotId)

        if stock_item == Status.FAIL:
            return abort(404, "Sell Lot could not be found")

        return stock_item

    @login_required
    @api.response(200, "Successfully deleted sell lot")
    def delete(self, lotId):
        """Delete an existing sell lot row"""

        if util.delete_lot(LotType.SELL, lotId) == Status.SUCCESS:
            return {"message": "Sell Lot successfully deleted"}, 200

        return abort(500, "Sell Lot could not be deleted")
