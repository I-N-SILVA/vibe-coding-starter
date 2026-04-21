from playwright.sync_api import sync_playwright

def test_interactions():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        base_url = "https://vibe-coding-starter-black.vercel.app"
        
        page.goto(base_url, wait_until="networkidle")
        
        # 1. Test Theme Toggle
        print("Testing Theme Toggle...")
        theme_btn = page.locator('button[aria-label="Toggle theme"], button:has-text("Toggle"), .theme-toggle').first
        if theme_btn.is_visible():
            initial_class = page.locator('html').get_attribute('class') or ""
            theme_btn.click()
            page.wait_for_timeout(500)
            new_class = page.locator('html').get_attribute('class') or ""
            print(f"Initial HTML class: {initial_class}")
            print(f"New HTML class: {new_class}")
        else:
            print("Theme toggle button not found or visible.")

        # 2. Test Mobile Menu
        print("\nTesting Mobile Menu...")
        page.set_viewport_size({"width": 375, "height": 812})
        menu_btn = page.locator('button[data-testid="mobile-menu-btn"]')
        if menu_btn.is_visible():
            menu_btn.click()
            page.wait_for_timeout(500)
            is_menu_visible = page.locator('nav').count() > 1 # Assuming menu is another nav
            print(f"Mobile menu visible after click: {is_menu_visible}")
            page.screenshot(path="mobile_menu_open.png")
        else:
            print("Mobile menu button not found.")

        # 3. Test Contact Form Validation
        print("\nTesting Contact Form Validation...")
        page.goto(base_url + "/contact", wait_until="networkidle")
        submit_btn = page.locator('button[type="submit"]')
        if submit_btn.is_visible():
            submit_btn.click()
            # Check for browser validation or custom error
            errors = page.locator('p.text-red-500, span.text-red-500, .error-message').count()
            print(f"Error messages found after empty submit: {errors}")
            page.screenshot(path="contact_form_errors.png")
        
        browser.close()

if __name__ == "__main__":
    test_interactions()
