from playwright.sync_api import sync_playwright
import os

def run_recon():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        # Listen for console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        url = "https://vibe-coding-starter-black.vercel.app"
        print(f"Navigating to {url}...")
        
        try:
            page.goto(url, wait_until="networkidle", timeout=60000)
            
            # Take a screenshot
            screenshot_path = "landing_page.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"Screenshot saved to {screenshot_path}")
            
            # Get page title and main headings
            title = page.title()
            headings = page.locator("h1, h2, h3").all_inner_texts()
            
            # Find links and buttons
            links = page.locator("a").all()
            link_info = []
            for link in links:
                text = link.inner_text().strip()
                href = link.get_attribute("href")
                if text and href:
                    link_info.append({"text": text, "href": href})
            
            buttons = page.locator("button").all()
            button_texts = [btn.inner_text().strip() for btn in buttons if btn.inner_text().strip()]

            print(f"Page Title: {title}")
            print(f"Headings: {headings}")
            print(f"Console Errors: {console_errors}")
            print(f"Links found: {len(link_info)}")
            for l in link_info[:10]: # Limit to first 10
                print(f"  - {l['text']}: {l['href']}")
            print(f"Buttons found: {button_texts}")

        except Exception as e:
            print(f"Error during reconnaissance: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run_recon()
