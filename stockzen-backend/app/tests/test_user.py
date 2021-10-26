import app.tests.mocks as mock


def test_user_endpoints(app):
    # --------------------------------------------------------------------------
    # Registration Tests
    # --------------------------------------------------------------------------
    response = app.post("/user/login", json=mock.user_login)
    # Failed login before creating account
    assert response.status_code == 403

    response = app.post("/user/register", json=mock.user_register)
    # First registration should pass
    assert response.status_code == 200
    response = app.post("/user/register", json=mock.user_register)
    # Second registration should fail
    assert response.status_code == 409

    # --------------------------------------------------------------------------
    # Login + Logout Tests
    # --------------------------------------------------------------------------
    response = app.post("/user/logout")
    # Unauthorised logout
    assert response.status_code == 401

    response = app.post("/user/login", json=mock.user_login)
    # Successful login
    assert response.status_code == 200

    response = app.post("/user/logout")
    # Successful logout
    assert response.status_code == 200
    response = app.post("/user/login", json=mock.user_login)
    # Successful login again
    assert response.status_code == 200

    # --------------------------------------------------------------------------
    # Details Route
    # --------------------------------------------------------------------------
    response = app.get("/user/details")
    # Successful fetch
    assert response.status_code == 200
    assert response.json == mock.user_name

    # --------------------------------------------------------------------------
    # Email Route
    # --------------------------------------------------------------------------
    response = app.head(f"/user/{mock.user_email}")
    # Successful check
    assert response.status_code == 200

    response = app.head("/user/some_wrong_email")
    # Fail: User not found
    assert response.status_code == 404
