from datetime import datetime
from app import db
import app.utils.crud_utils as util
from app.utils.enums import Status
from app.models.schema import PriceAlert, Stock
from flask import request
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, abort, fields, marshal

from ..utils import utils


api = Namespace("price-alert", description="Price alert operations")



# ==============================================================================
# API Models
# :param attribute is how the db returns a field (so only applies for responses!)
#   used to convert to the the frontend representation, i.e. camelCase
# ==============================================================================


get_price_alert_thresholds_response = api.model(
    "Response: The threashold for particular stock",
    {
        "high": fields.Float( attribute="high_threshold", required=False, description="The high threshold"),
        "low": fields.Float(attribute="low_threshold", required=False, description="The low threshold"),
        "isHighThresholdAlerted":  fields.Boolean(attribute="is_high_threshold_alerted", required=False, description="Indicate wheather the high threshold is still active"),
        "isLowThresholdAlerted":  fields.Boolean(attribute="is_low_threshold_alerted", required=False, description="Indicate wheather the low threshold is still active"),
    },
)

save_price_alert_thresholds_request = api.model(
    "Request: Save the price alert thresholds",
    {
        "high": fields.Float(required=False, description="The high threshold"),
        "low": fields.Float(required=False, description="The low threshold")
    },
)


# ==============================================================================
# API Routes/Endpoint for Stock Search
# ==============================================================================




@api.route("/<int:stockId>")
class PriceAlertCRUD(Resource):
    @login_required
    @api.marshal_with(get_price_alert_thresholds_response)
    @api.response(200, "Thresholds successfully saved")
    @api.response(404, "The requested stock is not exists")
    def get(self, stockId):

        stock = Stock.query.filter(Stock.id == stockId).first()

        if stock is None:
            return {"message": "The requested stock is not exists"}, 404

        try:
            price_alert = PriceAlert.query.filter( PriceAlert.stock_id == stockId ).first()

            if price_alert is None:
                return { "high_threshold": None, "low_threshold": None }, 200
            else:
                return price_alert, 200
        except Exception as e:
            utils.debug_exception(e)

            return {"message": "Thresholds cannot be loaded"}, 500


    @login_required
    @api.expect(save_price_alert_thresholds_request)
    @api.response(200, "Thresholds successfully saved")
    @api.response(500, "Thresholds cannot be saved")
    def post(self, stockId):

        req = marshal(request.json, save_price_alert_thresholds_request)

        try:
            price_alert = PriceAlert.query.filter( PriceAlert.stock_id == stockId ).first()

            if price_alert is None:
                db.session.add( PriceAlert(
                    stock_id = stockId,
                    high_threshold = req['high'],
                    low_threshold = req['low'],
                    is_high_threshold_alerted = req['high'] is None,
                    is_low_threshold_alerted = req['low'] is None,
                    user_save_time = datetime.now()
                ) )

                db.session.commit()
            else:
                price_alert.high_threshold = req['high']
                price_alert.low_threshold = req['low']
                price_alert.is_high_threshold_alerted = req['high'] is None
                price_alert.is_low_threshold_alerted = req['low'] is None
                price_alert.user_save_time = datetime.now()

                db.session.commit()
            
            return {"message": "Thresholds successfully saved"}, 200
        except Exception as e:
            utils.debug_exception(e)

            return {"message": "Thresholds cannot be saved"}, 500