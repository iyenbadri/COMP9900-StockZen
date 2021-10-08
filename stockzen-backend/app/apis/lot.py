import app.utils.crud_utils as util
from app.utils import db_utils as db
from app.utils.enums import Response
from flask import request
from flask_login import current_user
from flask_login.utils import login_required
from flask_restx import Namespace, Resource, fields, marshal

api_bought = Namespace("bought", description="Bought Lots related operations")
api_sold = Namespace("sold", description="Sold Lots related operations")
