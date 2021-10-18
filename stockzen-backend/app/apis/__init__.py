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
from .lot import api_bought as ns1
from .lot import api_sold as ns2
from .portfolio import api as ns3
from .stock import api as ns4
from .user import api as ns5
from .search import  api as ns6 
for ns in [ns1, ns2, ns3, ns4, ns5, ns6]:
    all_apis.add_namespace(ns)
