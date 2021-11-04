import app.tests.mocks as mock
from app import db
from app.models.schema import StockPage
from app.tests.conftest import auth_client


def test_performance_summary(auth_client):
    client = auth_client
    # --------------------------------------------------------------------------
    # Portfolio Performance Summary
    # --------------------------------------------------------------------------
    # Initial
    response = client.get("/portfolio/list/summary")
    # No portfolios to start with
    assert response.status_code == 200
    assert response.json == mock.empty_summary

    # Pre-test setup
    # Add a portfolio, ID should be 1
    response = client.post("/portfolio", json=mock.portfolio_name)
    assert response.status_code == 200
    # Add a stock, ID should be 1
    response = client.post(
        "/stock/1", json={"stockPageId": mock.new_stock_1["stockPageId"]}
    )
    assert response.status_code == 200
    # Add a lot, ID should be 1
    response = client.post("lot/buy/1", json=mock.new_lot_1)
    assert response.status_code == 200

    # Test with dummy stock_page data
    # --------------------------------------------------------------------------
    # Add predetermined stock_page data (api data won't arrive yet by the end of test)
    stock_1 = StockPage.query.filter_by(id=mock.new_stock_1["stockPageId"]).one()
    stock_1.price = mock.simulated_price
    stock_1.change = mock.simulated_change
    db.session.commit()

    # Trigger calculation cascade
    response = client.get("stock/list/1")
    stock_list = response.json
    # Success: 1 stock in list
    assert response.status_code == 200
    assert len(stock_list) == 1

    # Test summary
    response = client.get("/portfolio/list/summary")
    # No portfolios to start with
    assert response.status_code == 200
    assert response.json == mock.new_summary_1

    # Test after selling
    # --------------------------------------------------------------------------
    response = client.post("lot/sell/1", json=mock.new_lot_1)
    # Should successfully add a sell lot
    assert response.status_code == 200

    # Trigger calculation cascade
    response = client.get("stock/list/1")
    stock_list = response.json
    # Success: 1 stock in list
    assert response.status_code == 200
    assert len(stock_list) == 1

    # Test summary
    response = client.get("/portfolio/list/summary")
    # No portfolios to start with
    assert response.status_code == 200
    assert response.json == mock.sold_summary_1
