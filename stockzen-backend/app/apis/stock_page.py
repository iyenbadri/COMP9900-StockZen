import app.utils.crud_utils as util
from app.models.schema import StockPage
from app.utils.api_utils import stockOverview
from app.utils.enums import Status
from flask import request
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, fields, marshal
from sqlalchemy.orm import load_only

# Route work separation using hyphen to follow REST API best practises
api = Namespace("stock-page", description="Stock page related operations")

# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================

stock_page_details_response = api.model("Response: Stock page data", {})


# ==============================================================================
# API Routes/Endpoints
# ==============================================================================

import yfinance as yf


def get_stock_code(stock_page_id):
    stock = StockPage.query.filter(StockPage.id == stock_page_id).one()
    return stock.code


@api.route("/<stockPageId>")
class StockPageCRUD(Resource):
    @login_required
    # @api.marshal_with(stock_list_response)
    @api.response(200, "Successfully retrieved details")
    def get(self, stockPageId):
        """Fetch stock page data"""

        # stock_code = get_stock_code(stockPageId) # integrate into crud_utils

        stock = yf.Ticker(stockPageId)
        # print(vars(stock))
        # print(stock.info)
        # print(stockOverview("AAPL"))
