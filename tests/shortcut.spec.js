import { test, expect } from '@playwright/test';

test('search shortcut / works', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Press '/'
  await page.keyboard.press('/');

  // Check if search input is focused
  const isFocused = await page.evaluate(() => {
    return document.activeElement === document.getElementById('searchInput');
  });

  expect(isFocused).toBe(true);
});
