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
from .cats import api as ns1
from .dogs import api as ns2
from .lot import api_bought as ns3
from .lot import api_sold as ns4
from .portfolio import api as ns5
from .stock import api as ns6
from .user import api as ns7

for ns in [ns1, ns2, ns3, ns4, ns5, ns6, ns7]:
    all_apis.add_namespace(ns)
