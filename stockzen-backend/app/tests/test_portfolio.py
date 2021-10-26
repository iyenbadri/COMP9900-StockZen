import app.tests.mocks as mock


def test_portfolio_endpoints(client):
    # --------------------------------------------------------------------------
    # Portfolio Creation & Listing
    # --------------------------------------------------------------------------
    response = client.get("/portfolio/list")
    # No portfolios to start with
    assert response.status_code == 200
    assert response.json == []

    response = client.post("/portfolio", json=mock.portfolio_name)
    # Success: add a portfolio
    assert response.status_code == 200

    response = client.post("/portfolio", json=mock.portfolio_name)
    # Success: can add portfolio with the same name again
    assert response.status_code == 200

    response = client.get("/portfolio/list")
    portfolio_list = response.json
    # Success: 2 portfolios in list
    assert response.status_code == 200
    assert len(portfolio_list) == 2
    assert portfolio_list[0] == mock.portfolio_details(id=1)
    assert portfolio_list[1] == mock.portfolio_details(id=2)

    # --------------------------------------------------------------------------
    # Portfolio Ordering
    # --------------------------------------------------------------------------
    response = client.put("/portfolio/list", json=mock.portfolio_order((1, 1), (2, 1)))
    # Fail: non unique order
    assert response.status_code == 409

    # Swap portfolios 1 and 2 around
    response = client.put("/portfolio/list", json=mock.portfolio_order((1, 2), (2, 1)))
    # Success: successfully reorder
    assert response.status_code == 200
    # Check new order is correct
    response = client.get("/portfolio/list")
    portfolio_list = response.json
    assert portfolio_list[0] == mock.portfolio_details(id=1, order=2)
    assert portfolio_list[1] == mock.portfolio_details(id=2, order=1)

    # --------------------------------------------------------------------------
    # Portfolio Details & Rename
    # --------------------------------------------------------------------------
    response = client.get("/portfolio/999")
    # Fail: portfolio should not exist
    assert response.status_code == 404

    response = client.get("/portfolio/1")
    # Check initial name is correct
    assert response.json["portfolioName"] == mock.portfolio_name["portfolioName"]

    response = client.put("/portfolio/1", json=mock.new_portfolio_name)
    # Check name change success
    assert response.status_code == 200

    response = client.get("/portfolio/1")
    # Check new name is correct
    assert response.json["portfolioName"] == mock.new_portfolio_name["newName"]

    # --------------------------------------------------------------------------
    # Portfolio Delete
    # --------------------------------------------------------------------------
    response = client.delete("/portfolio/999")
    # Operation on non-existing should fail
    assert response.status_code == 500

    response = client.delete("/portfolio/1")
    # Check delete success
    assert response.status_code == 200

    # Check correct entities
    response = client.get("/portfolio/list")
    portfolio_list = response.json
    assert len(portfolio_list) == 1
    assert portfolio_list[0] == mock.portfolio_details(id=2, order=1)
