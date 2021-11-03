import app.utils.crud_utils as util
from app.utils.calc_utils import propagate_stock_updates
from app.utils.enums import LotType, Status
from dateutil import parser as dateparser
from flask import request
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, abort, fields, marshal

api = Namespace("lot", description="Lots related operations (Buy/Sell)")


# ==============================================================================
# BUY LOTS
# ==============================================================================

# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================

buy_lot_details_response = api.model(
    "Response: Stock row Buy Lots list (/list is in [] form)",
    {
        "id": fields.Integer(required=True, description="lot id"),
        "tradeDate": fields.String(
            attribute="trade_date", required=True, description="date of transaction"
        ),
        "units": fields.Integer(required=True, description="number of units bought"),
        "unitPrice": fields.Float(
            attribute="unit_price", required=True, description="price per unit bought"
        ),
        "value": fields.Float(
            required=True, description="value of lots at current price"
        ),
        "change": fields.Float(
            required=True, description="change in value of lots at current price"
        ),
    },
)


add_buy_lot_request = api.model(
    "Request: create a buy stock lot",
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


@api.route("/buy/list/<int:stockId>")
class BuyLotCRUD(Resource):
    @login_required
    @api.marshal_list_with(buy_lot_details_response)
    @api.response(200, "Successfully retrieved lot buy list")
    def get(self, stockId):
        """List all Buy Lots from a particular stock row"""

        lot_list = util.get_lot_list(LotType.BUY, stockId)
        if lot_list == Status.FAIL:
            return abort(500, "Buy Lot list for the stock row could not be retrieved")

        propagate_stock_updates(stockId)  # update stock metrics calculations
        return lot_list


@api.route("/buy/<int:stockId>")
class BuyLotCRUD(Resource):
    @login_required
    @api.expect(add_buy_lot_request)
    @api.response(200, "Successfully created a buy lot")
    def post(self, stockId):
        """Create a new Buy Lot"""

        json = marshal(request.json, add_buy_lot_request)
        trade_date = dateparser.parse(json["tradeDate"])
        units = json["units"]
        unit_price = json["unitPrice"]

        if (
            util.add_lot(LotType.BUY, stockId, trade_date, units, unit_price)
            == Status.SUCCESS
        ):
            return {"message": "Buy Lot successfully created"}, 200

        return abort(500, "Buy Lot could not be created")


@api.route("/buy/<int:lotId>")
class BuyLotCRUD(Resource):
    @login_required
    @api.marshal_with(buy_lot_details_response)
    @api.response(200, "Successfully retrieved Buy Lot data")
    @api.response(404, "Buy Lot not found")
    def get(self, lotId):
        """Fetch data for a Buy Lot row within a stock row"""

        stock_item = util.fetch_lot(LotType.BUY, lotId)

        if stock_item == Status.FAIL:
            return abort(404, "Buy Lot could not be found")

        return stock_item

    @login_required
    @api.response(200, "Successfully deleted buy lot")
    def delete(self, lotId):
        """Delete an existing buy lot row"""

        if util.delete_lot(LotType.BUY, lotId) == Status.SUCCESS:
            return {"message": "Buy Lot successfully deleted"}, 200

        return abort(500, "Buy Lot could not be deleted")
