
import { test, expect } from '@playwright/test';

test('search shortcut works', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for the page to be ready
  await page.waitForSelector('#searchInput');

  // Ensure search is not focused
  await page.evaluate(() => document.getElementById('searchInput').blur());

  // Press '/'
  await page.keyboard.press('/');

  // Check if search is focused
  const isFocused = await page.evaluate(() => document.activeElement.id === 'searchInput');
  console.log('Search focused after pressing "/":', isFocused);

  // Check if hint is hidden when focused
  const hint = page.locator('.search-kbd-hint');
  await expect(hint).toHaveCSS('opacity', '0');

  // Check title attributes on nav buttons
  const dashboardBtn = page.locator('#dashboardBtn');
  await expect(dashboardBtn).toHaveAttribute('title', 'Dashboard');

  const ytBtn = page.locator('a[title="YouTube"]');
  await expect(ytBtn).toBeVisible();
});
