import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        os.makedirs('/home/jules/verification', exist_ok=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            await page.goto('http://localhost:5173', wait_until='domcontentloaded')
            await page.wait_for_timeout(2000)

            # Dashboard
            await page.click('#dashboardBtn')
            await page.wait_for_timeout(1000)
            dashboard = page.locator('#dashboardModal')
            await dashboard.screenshot(path='/home/jules/verification/final_dashboard.png')
            print("Captured Dashboard")

            # Theme (Force hidden dashboard to avoid interception)
            await page.evaluate("document.getElementById('dashboardModal').setAttribute('aria-hidden', 'true'); document.getElementById('dashboardModal').style.display = 'none';")
            await page.hover('#themeToggleBtn')
            await page.wait_for_timeout(1000)
            await page.screenshot(path='/home/jules/verification/final_theme_menu.png')
            print("Captured Theme Menu")

        except Exception as e:
            print(f"Error: {e}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
