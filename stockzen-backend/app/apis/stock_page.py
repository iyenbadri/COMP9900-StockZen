import app.utils.crud_utils as crud
from app.models.schema import StockPage
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


# ==============================================================================
# API Routes/Endpoints
# ==============================================================================


@api.route("/<stockPageId>")
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

        return stock_page_item
