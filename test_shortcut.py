import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:5173")

        # Wait for app to load
        await page.wait_for_selector("#searchInput")

        # Ensure not focused
        await page.evaluate("document.activeElement.blur()")

        # Press '/'
        await page.keyboard.press("/")

        # Check if focused
        is_focused = await page.evaluate("document.activeElement.id === 'searchInput'")

        if is_focused:
            print("SUCCESS: Search input focused on '/' press")
        else:
            focused_id = await page.evaluate("document.activeElement.id")
            print(f"FAILURE: Search input NOT focused. Currently focused: {focused_id}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
