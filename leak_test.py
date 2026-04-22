from playwright.sync_api import sync_playwright
import random
import time

def run_leak_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Test mobile viewport
        context = browser.new_context(
            viewport={'width': 375, 'height': 812},
            is_mobile=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/04.1"
        )
        page = context.new_page()
        
        base_url = "https://vibe-coding-starter-black.vercel.app"
        
        print("Starting Random Leak Test (Mobile Viewport)...")
        
        # 1. Landing Page
        print(f"Navigating to {base_url}...")
        page.goto(base_url, wait_until="networkidle")
        page.screenshot(path="leak_test_landing.png")
        
        # 2. Check for Theme Toggle
        theme_btn = page.locator('button[aria-label*="theme"], .theme-toggle').first
        if theme_btn.is_visible():
            print("Toggling theme...")
            theme_btn.click()
            time.sleep(0.5)
            page.screenshot(path="leak_test_theme_toggle.png")
        
        # 3. Check Mobile Menu
        menu_btn = page.locator('button[data-testid="mobile-menu-btn"], button:has(.lucide-menu)').first
        if menu_btn.is_visible():
            print("Opening mobile menu...")
            menu_btn.click()
            time.sleep(0.5)
            page.screenshot(path="leak_test_mobile_menu.png")
            
            # Click a random link in the menu
            links = page.locator('nav a').all()
            if links:
                random_link = random.choice(links)
                print(f"Clicking random link: {random_link.inner_text()}")
                random_link.click()
                page.wait_for_load_state("networkidle")
                page.screenshot(path="leak_test_random_nav.png")

        # 4. Check Unified Search / Command Palette
        print("Testing Unified Search (Meta+K)...")
        page.keyboard.press("Meta+K")
        time.sleep(1.0)
        # Look for the unified SearchProvider input
        search_input = page.locator('input[placeholder*="Search protocol"]')
        if search_input.is_visible():
            print("Unified SearchProvider is functional.")
            page.screenshot(path="leak_test_search_provider.png")
            page.keyboard.press("Escape")
        else:
            print("SearchProvider NOT found or NOT responding.")

        # 5. Check Auth State UI
        print("Checking Auth Provider state...")
        # If not logged in, we should see SIGN IN or similar
        auth_trigger = page.locator('a[href="/login"], button:has-text("Sign In")').first
        if auth_trigger.is_visible():
            print("AuthProvider correctly showing Guest state.")
        
        # 6. Check Analytics (Verify script presence in DOM)
        print("Verifying Analytics integration...")
        scripts = page.locator('script[src*="vercel-analytics"], script[src*="va.vercel-scripts.com"]').count()
        if scripts > 0:
            print(f"Analytics found: {scripts} script(s) active.")
        else:
            print("Analytics scripts NOT detected in the initial DOM.")

        # 5. Check various public routes
        routes = ["/about", "/contact", "/pricing", "/faq", "/league/public/matches"]
        random.shuffle(routes)
        for route in routes[:3]:
            print(f"Checking route: {route}")
            page.goto(base_url + route, wait_until="networkidle")
            # Check for generic "Something went wrong" or "Error"
            content = page.content()
            if "Something went wrong" in content or "Internal Server Error" in content:
                print(f"Potential LEAK/CRASH on {route}")
            page.screenshot(path=f"leak_test_{route.replace('/', '_')}.png")

        browser.close()

if __name__ == "__main__":
    run_leak_test()
