import os

# ==============================================================================
# For generic or shared helper functions
# ==============================================================================


def debug_exception(error):
    if os.environ.get("FLASK_ENV") == "development":
        print(
            f"{type(error).__name__} at line {error.__traceback__.tb_lineno} of {__file__}: {error}"
        )
    raise error
