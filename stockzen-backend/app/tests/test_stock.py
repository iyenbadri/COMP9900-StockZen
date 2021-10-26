import app.tests.mocks as mock
import app.tests.utils as utils
from app.tests.conftest import auth_client


def test_stock_endpoints(auth_client):
    client = auth_client
    # Pre-test setup
    # Add a portfolio, ID should be 1
    response = client.post("/portfolio", json=mock.portfolio_name)
    assert response.status_code == 200
    response = client.get("/portfolio/1")
    assert response.status_code == 200

    # --------------------------------------------------------------------------
    # Stock Listing
    # --------------------------------------------------------------------------
    response = client.get("/stock/list/1")
    # No stocks at the start
    assert response.status_code == 200
    assert response.json == []

    response = client.post("/stock/1", json=mock.non_stock)
    # Fail: add a stock that does not exist in stock_page
    assert response.status_code == 500

    response = client.post(
        "/stock/1", json={"stockPageId": mock.new_stock_1["stockPageId"]}
    )
    # Success: add a stock
    assert response.status_code == 200

    response = client.post(
        "/stock/1", json={"stockPageId": mock.new_stock_1["stockPageId"]}
    )
    # Fail: should not be able to add same stock again
    assert response.status_code == 500

    response = client.post(
        "/stock/1", json={"stockPageId": mock.new_stock_2["stockPageId"]}
    )
    # Success: add another stock
    assert response.status_code == 200

    response = client.get("/stock/list/1")
    stock_list = response.json
    # Success: 2 stocks in list
    assert response.status_code == 200
    assert len(stock_list) == 2
    assert stock_list[0] == mock.stock_details(id=1, stock=mock.new_stock_1)
    assert stock_list[1] == mock.stock_details(id=2, stock=mock.new_stock_2)

    # --------------------------------------------------------------------------
    # Stock Ordering
    # --------------------------------------------------------------------------
    response = client.put("/stock/list/1", json=utils.ordering((1, 1), (2, 1)))
    # Fail: non unique order
    assert response.status_code == 409

    # Swap stocks 1 and 2 around
    response = client.put("/stock/list/1", json=utils.ordering((1, 2), (2, 1)))
    # Success: successfully reorder
    assert response.status_code == 200
    # Check new order is correct
    response = client.get("/stock/list/1")
    stock_list = response.json

    first_stock = mock.stock_details(id=1, stock=mock.new_stock_1, order=2)
    assert stock_list[0] == first_stock
    assert stock_list[1] == mock.stock_details(id=2, stock=mock.new_stock_2, order=1)

    # --------------------------------------------------------------------------
    # Stock Details & Rename
    # --------------------------------------------------------------------------
    response = client.get("/stock/999")
    # Fail: stock should not exist
    assert response.status_code == 404

    response = client.get("/stock/1")
    # Check stock details is correct
    assert response.json == first_stock

    # --------------------------------------------------------------------------
    # Stock Delete
    # --------------------------------------------------------------------------
    response = client.delete("/stock/999")
    # Operation on non-existing should fail
    assert response.status_code == 500

    response = client.delete("/stock/2")
    # Check delete success
    assert response.status_code == 200

    # Check correct entities
    response = client.get("/stock/list/1")
    stock_list = response.json
    assert len(stock_list) == 1
    assert stock_list[0] == first_stock
