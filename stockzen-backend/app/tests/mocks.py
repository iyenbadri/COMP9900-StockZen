# Mock data & Helpers


# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================


def ordering(*id_order_tuples):
    order_list = []
    for id, order in id_order_tuples:
        order_list.append({"id": id, "order": order})
    return order_list


# ==============================================================================
# MOCK DATA
# ==============================================================================
# ------------------------------------------------------------------------------
# User
# ------------------------------------------------------------------------------

user_login = {
    "email": "tester",
    "password": "tester",
}
user_name = {
    "firstName": "tester",
    "lastName": "tester",
}
user_email = "tester"
user_register = {**user_login, **user_name}

# ------------------------------------------------------------------------------
# Portfolio
# ------------------------------------------------------------------------------

portfolio_name = {"portfolioName": "Test Portfolio"}
new_portfolio_name = {"newName": "New Portfolio Name"}


def portfolio_details(id, name="Test Portfolio", order=0):
    portfolio_details = {
        "id": id,
        "portfolioName": name,
        "stockCount": 0,
        "value": 0,
        "change": None,
        "percChange": None,
        "gain": None,
        "percGain": None,
        "order": order,
    }
    return portfolio_details


# ------------------------------------------------------------------------------
# Stock
# ------------------------------------------------------------------------------

non_stock = {"stockPageId": -1}
new_stock_1 = {
    "stockPageId": 1,
    "code": "A",
    "stockName": "Agilent Technologies, Inc.",
}
new_stock_2 = {
    "stockPageId": 20181,
    "code": "TSLA",
    "stockName": "Tesla, Inc.",
}

# TODO: make stock_page mocks first
def stock_details(id, stock, order=0):
    stock_details = {
        "id": id,
        "stockPageId": stock["stockPageId"],
        "code": stock["code"],
        "stockName": stock["stockName"],
        "price": None,
        "change": None,
        "percChange": None,
        "avgPrice": None,
        "unitsHeld": 0,
        "gain": None,
        "percGain": None,
        "value": None,
        "prediction": None,
        "confidence": None,
        "order": order,
    }
    return stock_details
