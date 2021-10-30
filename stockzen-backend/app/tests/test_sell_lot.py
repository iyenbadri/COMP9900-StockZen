import app.tests.mocks as mock
from app.tests.conftest import auth_client
from app.utils.enums import LotType


def test_sell_lot_endpoints(auth_client):
    client = auth_client
    # Pre-test setup
    # Add a portfolio, ID should be 1
    response = client.post("/portfolio", json=mock.portfolio_name)
    assert response.status_code == 200
    # Add a stock, ID should be 1
    response = client.post(
        "/stock/1", json={"stockPageId": mock.new_stock_1["stockPageId"]}
    )
    assert response.status_code == 200

    # --------------------------------------------------------------------------
    # Stock Sell Create and List
    # --------------------------------------------------------------------------
    response = client.get("lot/sell/list/1")
    # No lots at the start
    assert response.status_code == 200
    assert response.json == []

    response = client.post("lot/sell/1", json=mock.new_lot_1)
    # Should successfully add a stock
    assert response.status_code == 200

    response = client.post("lot/sell/1", json=mock.new_lot_1)
    # Should successfully add a similar stock again
    assert response.status_code == 200

    response = client.get("lot/sell/list/1")
    lot_list = response.json
    # Should be 2 lots in list
    assert response.status_code == 200
    assert len(lot_list) == 2
    assert lot_list[0] == mock.lot_details(LotType.SELL, id=1, lot=mock.new_lot_1)
    assert lot_list[1] == mock.lot_details(LotType.SELL, id=2, lot=mock.new_lot_1)

    # --------------------------------------------------------------------------
    # Stock Sell Delete
    # --------------------------------------------------------------------------

    response = client.delete("lot/sell/2")
    # Successful delete, should be 1 lot left
    assert response.status_code == 200
    response = client.get("lot/sell/list/1")
    lot_list = response.json
    assert len(lot_list) == 1

    # --------------------------------------------------------------------------
    # Stock Sell Get Details
    # --------------------------------------------------------------------------
    response = client.get("lot/sell/9999")
    # Should not be able to find a non-existent lot Id
    assert response.status_code == 404

    response = client.get("lot/sell/1")
    # Should successfully find the 1st Lot
    assert response.json == mock.lot_details(LotType.SELL, id=1, lot=mock.new_lot_1)
