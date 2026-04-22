from playwright.sync_api import sync_playwright
import time

def final_smoke_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport
        context = browser.new_context(viewport={'width': 375, 'height': 812}, is_mobile=True)
        page = context.new_page()
        
        base_url = "https://vibe-coding-starter-black.vercel.app"
        print(f"Final Smoke Test on {base_url} (Mobile)")
        
        page.goto(base_url, wait_until="networkidle")
        
        # 1. Search Trigger
        print("Testing ⌘K (SearchProvider)...")
        page.keyboard.press("Meta+K")
        time.sleep(1)
        if page.locator('input[placeholder*="Search protocol"]').is_visible():
            print("SUCCESS: Unified SearchProvider visible.")
        else:
            print("FAILURE: SearchProvider not appearing.")
            
        # 2. Check Theme
        is_dark = page.evaluate("() => document.documentElement.classList.contains('dark')")
        print(f"Current Theme is Dark: {is_dark}")
        
        # 3. Quick Route Check
        print("Checking mobile navigation...")
        page.locator('button[data-testid="mobile-menu-btn"], button:has(.lucide-menu)').first.click()
        time.sleep(0.5)
        page.screenshot(path="final_mobile_menu.png")
        
        browser.close()

if __name__ == "__main__":
    final_smoke_test()
