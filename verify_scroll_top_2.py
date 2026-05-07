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

            # Check if button is initially hidden
            button = page.locator('#scrollToTop')
            opacity = await page.evaluate("window.getComputedStyle(document.getElementById('scrollToTop')).opacity")
            has_show_class = await page.evaluate("document.getElementById('scrollToTop').classList.contains('show')")
            print(f"Initial opacity: {opacity}")
            print(f"Initial has 'show' class: {has_show_class}")
            await page.screenshot(path='/home/jules/verification/initial_state.png')

            # Scroll down
            await page.evaluate("window.scrollTo(0, 1000)")
            await page.wait_for_timeout(1000)

            # Check if visible after scroll
            opacity = await page.evaluate("window.getComputedStyle(document.getElementById('scrollToTop')).opacity")
            has_show_class = await page.evaluate("document.getElementById('scrollToTop').classList.contains('show')")
            print(f"Opacity after scroll: {opacity}")
            print(f"Has 'show' class after scroll: {has_show_class}")
            await page.screenshot(path='/home/jules/verification/scroll_to_top_visible.png')

            # Click and check scroll position
            if has_show_class:
                await button.click()
                await page.wait_for_timeout(1000)
                scroll_y = await page.evaluate("window.scrollY")
                print(f"Scroll Y after click: {scroll_y}")
                await page.screenshot(path='/home/jules/verification/after_scroll_to_top.png')
            else:
                print("Button not visible, skipping click test.")

        except Exception as e:
            print(f"Error: {e}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
