import app.tests.mocks as mock


def test_stock_endpoints(client):
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

    response = client.post("/stock/1", json=mock.new_stock_1)
    # Fail: add a stock that does not exist in stock_page
    assert response.status_code == 500

    # USE STOCK PAGES CONTEXT

    # response = client.post("/stock/1", json=mock.new_stock_1)
    # # Success: add a stock
    # assert response.status_code == 200

    # response = client.post("/stock/1", json=mock.new_stock_1)
    # # Fail: should not be able to add same stock again
    # assert response.status_code == 500

    # response = client.post("/stock/1", json=mock.new_stock_2)
    # # Success: add another stock
    # assert response.status_code == 200

    # response = client.get("/stock/list/1")
    # stock_list = response.json
    # # Success: 1 stocks in list
    # assert response.status_code == 200
    # assert len(stock_list) == 1
    # assert stock_list[0] == mock.stock_details(id=1)
    # assert stock_list[1] == mock.stock_details(id=2)

    # # --------------------------------------------------------------------------
    # # Stock Ordering
    # # --------------------------------------------------------------------------
    # response = client.put("/stock/list", json=mock.stock_order((1, 1), (2, 1)))
    # # Fail: non unique order
    # assert response.status_code == 409

    # # Swap stocks 1 and 2 around
    # response = client.put("/stock/list", json=mock.stock_order((1, 2), (2, 1)))
    # # Success: successfully reorder
    # assert response.status_code == 200
    # # Check new order is correct
    # response = client.get("/stock/list")
    # stock_list = response.json
    # assert stock_list[0] == mock.stock_details(id=1, order=2)
    # assert stock_list[1] == mock.stock_details(id=2, order=1)

    # # --------------------------------------------------------------------------
    # # Stock Details & Rename
    # # --------------------------------------------------------------------------
    # response = client.get("/stock/999")
    # # Fail: stock should not exist
    # assert response.status_code == 404

    # response = client.get("/stock/1")
    # # Check initial name is correct
    # assert response.json["stockName"] == mock.stock_name["stockName"]

    # response = client.put("/stock/1", json=mock.new_stock_name)
    # # Check name change success
    # assert response.status_code == 200

    # response = client.get("/stock/1")
    # # Check new name is correct
    # assert response.json["stockName"] == mock.new_stock_name["newName"]

    # # --------------------------------------------------------------------------
    # # Stock Delete
    # # --------------------------------------------------------------------------
    # response = client.delete("/stock/999")
    # # Operation on non-existing should fail
    # assert response.status_code == 500

    # response = client.delete("/stock/1")
    # # Check delete success
    # assert response.status_code == 200

    # # Check correct entities
    # response = client.get("/stock/list")
    # stock_list = response.json
    # assert len(stock_list) == 1
    # assert stock_list[0] == mock.stock_details(id=2, order=1)
