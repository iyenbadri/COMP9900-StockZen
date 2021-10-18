import app.utils.crud_utils as util
from app.utils import db_utils as db
from app.utils.enums import Status
from flask import request
from flask_login import current_user
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, fields, marshal

api = Namespace("search", description="Stock search operations")


# ==============================================================================
# API Routes/Endpoint for Stock Search
# ==============================================================================
search_request = api.model(
    "Request: String  that represents code or name of stock",
    {
        "stockquery": fields.String(required=True, description="new stock name"),
    },
)

@api.route("/<stockquery>")
class StockpageCRUD(Resource):
    @login_required
    # @api.expect(search_request)
    # @api.marshal_list_with(stock_list_response)
    @api.response(200, "Successfully retrieved list of stocks")
    @api.response(404, "No results were found")
    def get(self, stockquery):
        """List of related stocks Limit(30)"""
        stock_list = util.search_stock(stockquery)
        if stock_list == Status.FAIL:
            return {"message":"Search could not be completed"},500
        if stock_list == []:
            return stock_list,404
        return stock_list,200

