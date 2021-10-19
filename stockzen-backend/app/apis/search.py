import app.utils.crud_utils as util
from app.utils.enums import Status
from flask import request
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, fields

api = Namespace("search", description="Stock search operations")

# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================

search_response = api.model(
    "Response: Filtered list of stocks that a user is searching for",
    {
        "id": fields.Integer(required=True, description="stock page id"),
        "code": fields.String(required=True, description="stock symbol/code"),
        "stock_name": fields.String(required=True, description="stock name"),
    },
)

# ==============================================================================
# API Routes/Endpoint for Stock Search
# ==============================================================================


@api.route("")
class StockpageCRUD(Resource):
    @login_required
    @api.doc(params={"query": "stock query string"})
    @api.marshal_list_with(search_response)
    @api.response(200, "Successfully retrieved list of stocks")
    @api.response(404, "No results were found")
    def get(self):
        """Stock search results"""

        # We get the query string i.e. ?query=<stock_query>
        stock_query = request.args.get("query")

        stock_list = util.search_stock(stock_query)

        if stock_list == Status.FAIL:
            return {"message": "Search could not be completed"}, 500
        if stock_list == []:
            return stock_list, 404
        return stock_list, 200
