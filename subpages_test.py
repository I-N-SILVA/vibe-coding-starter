from playwright.sync_api import sync_playwright

def test_subpages():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        base_url = "https://vibe-coding-starter-black.vercel.app"
        
        # 1. Test Login Page
        print(f"\n--- Testing Login Page ---")
        page.goto(f"{base_url}/login", wait_until="networkidle")
        page.screenshot(path="login_page.png")
        print(f"Login page screenshot saved.")
        has_email = page.locator('input[type="email"]').is_visible()
        has_password = page.locator('input[type="password"]').is_visible()
        print(f"Email field visible: {has_email}")
        print(f"Password field visible: {has_password}")
        
        # 2. Test Signup Page
        print(f"\n--- Testing Signup Page ---")
        page.goto(f"{base_url}/login?mode=signup", wait_until="networkidle")
        page.screenshot(path="signup_page.png")
        print(f"Signup page screenshot saved.")
        # Check for signup specific fields if any (e.g., name)
        
        # 3. Test Public Matches Page
        print(f"\n--- Testing Public Matches Page ---")
        page.goto(f"{base_url}/league/public/matches", wait_until="networkidle")
        page.screenshot(path="public_matches.png")
        print(f"Public matches page screenshot saved.")
        matches_count = page.locator("tr, .match-card, li").count() # Generic count to see if list exists
        print(f"Elements found on matches page: {matches_count}")

        # 4. Mobile Responsiveness Test (Landing Page)
        print(f"\n--- Testing Mobile Responsiveness (Landing) ---")
        mobile_context = browser.new_context(viewport={'width': 375, 'height': 667}, user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/04.1")
        mobile_page = mobile_context.new_page()
        mobile_page.goto(base_url, wait_until="networkidle")
        mobile_page.screenshot(path="landing_mobile.png")
        print(f"Mobile landing page screenshot saved.")
        
        browser.close()

if __name__ == "__main__":
    test_subpages()
