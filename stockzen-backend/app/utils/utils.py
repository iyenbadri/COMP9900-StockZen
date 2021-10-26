import os

from app.models.schema import StockPage
from sqlalchemy.orm import load_only

# ==============================================================================
# For generic or shared helper functions
# ==============================================================================

# Nice error debug message printing
def debug_exception(error, suppress=False):
    if os.environ.get("FLASK_ENV") == "development":
        print(
            f"{type(error).__name__} at line {error.__traceback__.tb_lineno} of {__file__}: {error}"
        )
    if not suppress:
        raise error


# Convert stock_page_id to code/symbol
def id_to_code(stock_page_id: int):
    """Converts a stock page id to stock code using the StockPage table
    Fails if not exactly one stock is found"""
    try:
        return (
            StockPage.query.options(load_only(StockPage.code))
            .filter_by(id=stock_page_id)
            .one()
            .code
        )
    except Exception as e:
        debug_exception(e)
