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
            await page.wait_for_timeout(1000)

            # Check if button is initially hidden
            button = page.locator('#scrollToTop')
            is_visible = await button.is_visible()
            # Note: visibility: hidden might still return true for is_visible() in some cases,
            # but opacity 0 and position off screen or just hidden by CSS.
            # Let's check computed style.
            opacity = await page.evaluate("window.getComputedStyle(document.getElementById('scrollToTop')).opacity")
            print(f"Initial opacity: {opacity}")

            # Scroll down
            await page.evaluate("window.scrollTo(0, 1000)")
            await page.wait_for_timeout(1000)

            # Check if visible after scroll
            opacity = await page.evaluate("window.getComputedStyle(document.getElementById('scrollToTop')).opacity")
            print(f"Opacity after scroll: {opacity}")
            await page.screenshot(path='/home/jules/verification/scroll_to_top_visible.png')

            # Click and check scroll position
            await button.click()
            await page.wait_for_timeout(1000)
            scroll_y = await page.evaluate("window.scrollY")
            print(f"Scroll Y after click: {scroll_y}")
            await page.screenshot(path='/home/jules/verification/after_scroll_to_top.png')

        except Exception as e:
            print(f"Error: {e}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
