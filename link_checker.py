from playwright.sync_api import sync_playwright

def check_links():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        base_url = "https://vibe-coding-starter-black.vercel.app"
        
        page.goto(base_url, wait_until="networkidle")
        links = page.locator("a").all()
        hrefs = []
        for link in links:
            href = link.get_attribute("href")
            if href and (href.startswith("/") or href.startswith(base_url)):
                if "#" not in href: # Skip anchors
                    hrefs.append(href)
        
        # Unique hrefs
        hrefs = list(set(hrefs))
        
        results = []
        for href in hrefs:
            full_url = href if href.startswith("http") else base_url + href
            print(f"Checking {full_url}...")
            try:
                response = page.goto(full_url, wait_until="domcontentloaded", timeout=10000)
                status = response.status if response else "Unknown"
                results.append({"url": full_url, "status": status})
            except Exception as e:
                results.append({"url": full_url, "status": f"Error: {str(e)}"})
        
        for r in results:
            if r["status"] != 200:
                print(f"BROKEN: {r['url']} - Status: {r['status']}")
            else:
                print(f"OK: {r['url']}")
        
        browser.close()

if __name__ == "__main__":
    check_links()
