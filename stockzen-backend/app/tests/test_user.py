import app.tests.mocks as mock


def test_user_endpoints(client):
    # --------------------------------------------------------------------------
    # Registration Tests
    # --------------------------------------------------------------------------
    response = client.post("/user/login", json=mock.user_login)
    # Failed login before creating account
    assert response.status_code == 403

    response = client.post("/user/register", json=mock.user_register)
    # First registration should pass
    assert response.status_code == 200
    response = client.post("/user/register", json=mock.user_register)
    # Second registration should fail
    assert response.status_code == 409

    # --------------------------------------------------------------------------
    # Login + Logout Tests
    # --------------------------------------------------------------------------
    response = client.post("/user/logout")
    # Unauthorised logout
    assert response.status_code == 401

    response = client.post("/user/login", json=mock.user_login)
    # Successful login
    assert response.status_code == 200

    response = client.post("/user/logout")
    # Successful logout
    assert response.status_code == 200
    response = client.post("/user/login", json=mock.user_login)
    # Successful login again
    assert response.status_code == 200

    # --------------------------------------------------------------------------
    # Details Route
    # --------------------------------------------------------------------------
    response = client.get("/user/details")
    # Successful fetch
    assert response.status_code == 200
    assert response.json == mock.user_name

    # --------------------------------------------------------------------------
    # Email Route
    # --------------------------------------------------------------------------
    response = client.head(f"/user/{mock.user_email}")
    # Successful check
    assert response.status_code == 200

    response = client.head("/user/some_wrong_email")
    # Fail: User not found
    assert response.status_code == 404
