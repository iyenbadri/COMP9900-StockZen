# Mock data

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


def portfolio_order(*id_order_tuples):
    order_list = []
    for id, order in id_order_tuples:
        order_list.append({"id": id, "order": order})
    return order_list


# ------------------------------------------------------------------------------
# Stock
# ------------------------------------------------------------------------------

new_stock_1 = {"stockPageId": 1}
new_stock_2 = {"stockPageId": 2}

# TODO: make stock_page mocks first
def stock_details(id, stockPageId, order=0):
    stock_details = {
        "id": id,
        "stockPageId": stockPageId,
        "code": "string",
        "stockName": "string",
        "price": 0,
        "change": 0,
        "percChange": 0,
        "avgPrice": 0,
        "unitsHeld": 0,
        "gain": 0,
        "percGain": 0,
        "value": 0,
        "prediction": 0,
        "confidence": 0,
        "order": order,
    }
    return stock_details
