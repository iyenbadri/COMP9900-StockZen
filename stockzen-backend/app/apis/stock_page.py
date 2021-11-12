import app.utils.crud_utils as crud
import app.utils.utils as utils
from app.config import TOP_COMPANIES
from app.utils.enums import Status
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, abort, fields, marshal

# Route work separation using hyphen to follow REST API best practises
api = Namespace("stock-page", description="Stock page related operations")

# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================

stock_page_details_response = api.model(
    "Response: Stock page data",
    {
        "id": fields.Integer(required=True, description="stock page id"),
        "code": fields.String(required=True, description="stock symbol code"),
        "stockName": fields.String(
            attribute="stock_name", required=True, description="stock name"
        ),
        "exchange": fields.String(required=True, description="exchange"),
        "price": fields.Float(required=True, description="latest price"),
        "change": fields.Float(required=True, description="daily change"),
        "percChange": fields.Float(
            attribute="perc_change", required=True, description="percentage daily change"
        ),
        "prevClose": fields.Float(
            attribute="previousClose",
            required=True,
            description="previous day close price",
        ),
        "open": fields.Float(required=True, description="current day opening price"),
        "bid": fields.Float(required=True, description="bid"),
        "bidSize": fields.Integer(required=True, description="bid size"),
        "ask": fields.Float(required=True, description="ask"),
        "askSize": fields.Integer(required=True, description="askSize"),
        "dayHigh": fields.Float(required=True, description="dayHigh"),
        "dayLow": fields.Float(required=True, description="dayLow"),
        "fiftyTwoWeekHigh": fields.Float(required=True, description="fiftyTwoWeekHigh"),
        "fiftyTwoWeekLow": fields.Float(required=True, description="fiftyTwoWeekLow"),
        "volume": fields.Float(required=True, description="volume"),
        "avgVolume": fields.Float(
            attribute="averageVolume", required=True, description="avgVolume"
        ),
        "marketCap": fields.Float(required=True, description="marketCap"),
        "beta": fields.Float(required=True, description="beta"),
        "longName": fields.String(required=True, description="exchange"),
        "industry": fields.String(required=True, description="exchange"),
        "sector": fields.String(required=True, description="sector"),
        "website": fields.String(required=True, description="website"),
        "longBusinessSummary": fields.String(
            required=True, description="longBusinessSummary"
        ),
        "prediction": fields.Integer(
            required=True, description="ML classifier prediction"
        ),
        "confidence": fields.Float(required=True, description="ML classifier confidence"),
    },
)


stock_page_history_response = api.model(
    "Response: Stock page 1-yr historical data",
    {
        "stockPageId": fields.Integer(
            attribute="stock_page_id", required=True, description="stock page id"
        ),
        "date": fields.String(required=True, description="row date"),
        "open": fields.Float(required=True, description="open price"),
        "high": fields.Float(required=True, description="high price"),
        "low": fields.Float(required=True, description="low price"),
        "close": fields.Float(required=True, description="close price"),
        "volume": fields.Integer(required=True, description="stock volume"),
    },
)

top_performers_response = api.model(
    "Response: Top performing stocks",
    {
        "stockPageId": fields.Integer(
            attribute="id", required=True, description="stock page id"
        ),
        "code": fields.String(required=True, description="stock symbol"),
        "stockName": fields.String(
            attribute="stock_name", required=True, description="stock name"
        ),
        "price": fields.Float(required=True, description="stock price"),
        "percChange": fields.Float(
            attribute="perc_change", required=True, description="stock daily change"
        ),
    },
)

# ==============================================================================
# API Routes/Endpoints
# ==============================================================================


@api.route("/<int:stockPageId>")
class StockPageCRUD(Resource):
    @login_required
    @api.marshal_with(stock_page_details_response)
    @api.response(200, "Successfully retrieved details")
    @api.response(404, "Stock page not found")
    def get(self, stockPageId):
        """Fetch stock page data"""

        # Get latest data from yfinance, if fail don't abort, just return latest (cached) data
        try:
            if crud.update_stock_page(stockPageId) == Status.FAIL:
                raise ConnectionError(
                    f"Could not fetch latest data for stockPageId: {stockPageId}, attempting to return from cache."
                )
        except Exception as e:
            print(e)

        # return latest data
        stock_page_item = crud.fetch_stock_page(stockPageId)

        if stock_page_item == Status.FAIL:
            return abort(404, "Stock page could not be found")
        return stock_page_item, 200


@api.route("/<int:stockPageId>/history")
class StockPageCRUD(Resource):
    @login_required
    @api.marshal_list_with(stock_page_history_response)
    @api.response(200, "Successfully retrieved history")
    @api.response(500, "Stock history not retrieved")
    def get(self, stockPageId):
        """Fetch stock page historical data"""
        stock_history = crud.fetch_stock_history(stockPageId)
        if stock_history == Status.FAIL:
            return abort(500, "Stock page history could not be retrieved")

        return stock_history, 200


@api.route("/top")
class StockPageCRUD(Resource):
    @login_required
    @api.marshal_list_with(top_performers_response)
    @api.response(200, "Successfully retrieved top performing stocks list")
    def get(self):

        # Update top companies for top-performer widget before getting from db
        utils.bulk_stock_fetch(TOP_COMPANIES, await_all=True)  # blocking request

        stock_list = crud.fetch_top_stocks()

        if stock_list == Status.FAIL:
            return abort(500, "Could not get top stock performers")

        return stock_list, 200
