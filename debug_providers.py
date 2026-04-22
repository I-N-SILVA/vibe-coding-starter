from playwright.sync_api import sync_playwright
import time

def debug_providers():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Listen to console
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"[ERROR] {exc}"))

        base_url = "https://vibe-coding-starter-black.vercel.app"
        print(f"Navigating to {base_url}...")
        page.goto(base_url, wait_until="networkidle")
        
        print("Checking for Analytics script in DOM...")
        scripts = page.evaluate("() => Array.from(document.scripts).map(s => s.src)")
        for s in scripts:
            if "analytics" in s or "va" in s:
                print(f"Found Script: {s}")

        print("\nTriggering ⌘K...")
        page.keyboard.press("Meta+K")
        time.sleep(2)
        
        page.screenshot(path="debug_providers.png")
        
        # Check if cmdk-input exists
        has_input = page.locator('input').count()
        print(f"Number of inputs found: {has_input}")
        
        browser.close()

if __name__ == "__main__":
    debug_providers()
