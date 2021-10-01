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
from .user import api as ns3

for ns in [ns1, ns2, ns3]:
    all_apis.add_namespace(ns)
