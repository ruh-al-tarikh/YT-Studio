const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the local dev server
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');

  // Desktop Screenshot
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.screenshot({ path: 'desktop.png' });
  console.log('Desktop screenshot saved.');

  // Mobile Screenshot
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: 'mobile.png' });
  console.log('Mobile screenshot saved.');

  // Test Modal
  // Click on the first video card (assuming there's a card)
  const firstCard = await page.locator('.video-card').first();
  if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForSelector('#modal', { state: 'visible' });
      await page.screenshot({ path: 'modal.png' });
      console.log('Modal screenshot saved.');
  } else {
      console.log('No video cards found to click.');
  }

  await browser.close();
})();
