# ==============================================================================
# DESIGN PATTERN TAKEN FROM
# https://flask-restx.readthedocs.io/en/latest/scaling.html
# ==============================================================================
from flask_restx import Api

all_apis = Api(
    title="StockZen API",
    version="0.1",
    description="All APIs for StockZen app",
)

# add each namespace api to the aggregated apis
from .challenge import api as ns1
from .lot_buy import api as ns2
from .lot_sell import api as ns3
from .portfolio import api as ns4
from .search import api as ns5
from .stock import api as ns6
from .stock_page import api as ns7
from .user import api as ns8
from .price_alert import api as ns9

for ns in [ns1, ns2, ns3, ns4, ns5, ns6, ns7, ns8, ns9]:
    all_apis.add_namespace(ns)
