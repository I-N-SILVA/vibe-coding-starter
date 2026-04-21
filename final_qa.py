from playwright.sync_api import sync_playwright

def final_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        base_url = "https://vibe-coding-starter-black.vercel.app"
        
        print(f"Checking Landing Page...")
        page.goto(base_url, wait_until="networkidle")
        if "PROPELLING" in page.content():
            print("Landing Page: OK")
        
        print(f"\nChecking Matches Page...")
        page.goto(base_url + "/league/public/matches", wait_until="networkidle")
        content = page.content()
        if "Configuration Required" in content:
            print("Matches Page: Showing Config Required (Expected if env vars missing on Vercel)")
        elif "No matches scheduled" in content:
            print("Matches Page: Showing Empty State (OK)")
        else:
            print("Matches Page: Potential Data Found")
        
        print(f"\nChecking Login UI...")
        page.goto(base_url + "/login", wait_until="networkidle")
        if page.locator('input[type="email"]').is_visible():
            print("Login UI: OK")
            
        browser.close()

if __name__ == "__main__":
    final_test()
