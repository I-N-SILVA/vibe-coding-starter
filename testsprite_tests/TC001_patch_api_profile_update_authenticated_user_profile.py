import requests

BASE_URL = "http://localhost:6006"
LOGIN_URL = f"{BASE_URL}/login"
PROFILE_URL = f"{BASE_URL}/api/profile"
LEAGUE_ORGANIZATIONS_URL = f"{BASE_URL}/api/league/organizations"

EMAIL = "organizer.test@plyaz.test"
PASSWORD = "TestPlyaz123!"
TIMEOUT = 30


def test_patch_api_profile_update_authenticated_user_profile():
    session = requests.Session()

    # Step 1: Authenticate by login POST to /login UI form simulation to get session cookie
    # The UI login page requires posting form data (simulate filling email/password and submitting)

    # Get login page to get any necessary cookies or authenticity tokens (if any, assume none required)
    login_page_resp = session.get(LOGIN_URL, timeout=TIMEOUT)
    if login_page_resp.status_code != 200:
        raise AssertionError(f"Failed to load login page: {login_page_resp.status_code}")

    # Simulate form submission with required field names: [data-testid="email-input"], [data-testid="password-input"], click [data-testid="login-form-submit-button"]
    # We assume the server accepts form data as application/x-www-form-urlencoded or JSON (try JSON)

    login_payload = {
        "email": EMAIL,
        "password": PASSWORD
    }

    # Since no API endpoint specified to login, simulate login by posting to /login with JSON:
    # If /login is just a rendered page, likely it uses POST /api/auth or similar, but not specified.
    # Due to instructions, we try POST to /login with JSON payload to get the session cookie.
    login_post_resp = session.post(
        LOGIN_URL,
        json=login_payload,
        timeout=TIMEOUT,
        allow_redirects=True,
    )
    # If POST /login is not returning 200 with auth cookie, fallback to assert 401 on protected,
    # but instructions say cookie-based auth only achievable via UI or token endpoint.

    # Check if login succeeded by checking if session cookies set a Supabase auth cookie (sb-*)
    auth_cookies = [c for c in session.cookies if c.name.startswith("sb-")]
    if not auth_cookies:
        raise AssertionError("Authentication failed: no Supabase auth cookies found after login.")

    # Step 2: Patch /api/profile with updated profile data
    profile_update_payload = {
        "displayName": "Test Organizer Updated",
        "bio": "Updated bio from test"
    }

    patch_resp = session.patch(
        PROFILE_URL,
        json=profile_update_payload,
        timeout=TIMEOUT,
    )

    assert patch_resp.status_code == 200, f"Expected 200 OK for PATCH /api/profile, got {patch_resp.status_code}"
    patched_profile = patch_resp.json()
    # Validate returned profile fields match update (at least displayName and bio present and updated)
    assert patched_profile.get("displayName") == profile_update_payload["displayName"], "displayName not updated correctly"
    assert patched_profile.get("bio") == profile_update_payload["bio"], "bio not updated correctly"

    # Step 3: Verify user remains authenticated by calling another protected endpoint GET /api/league/organizations
    orgs_resp = session.get(
        LEAGUE_ORGANIZATIONS_URL,
        timeout=TIMEOUT,
    )
    assert orgs_resp.status_code == 200, f"Expected 200 OK for GET /api/league/organizations after profile patch, got {orgs_resp.status_code}"
    orgs_data = orgs_resp.json()
    assert isinstance(orgs_data, list), "Expected organizations response to be a list"


test_patch_api_profile_update_authenticated_user_profile()