from playwright.sync_api import sync_playwright

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 1200})
        page = context.new_page()
        base_url = "https://vibe-coding-starter-black.vercel.app"
        
        pages = [
            "/",
            "/about",
            "/contact",
            "/login",
            "/league/public/matches",
            "/pricing",
            "/faq",
            "/terms",
            "/privacy"
        ]
        
        for p_url in pages:
            print(f"Capturing {p_url}...")
            page.goto(base_url + p_url, wait_until="networkidle")
            name = p_url.strip("/").replace("/", "_") or "home"
            page.screenshot(path=f"screenshot_{name}.png", full_page=True)
        
        # Capture mobile landing
        print("Capturing mobile home...")
        mobile_context = browser.new_context(viewport={'width': 375, 'height': 812}, is_mobile=True)
        mobile_page = mobile_context.new_page()
        mobile_page.goto(base_url, wait_until="networkidle")
        mobile_page.screenshot(path="screenshot_home_mobile.png", full_page=True)
        
        browser.close()

if __name__ == "__main__":
    capture_all()
