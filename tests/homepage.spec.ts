import { expect, test } from '@playwright/test';

test('homepage renders without overflow or browser errors and connects through Vite', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('API connected');
  await expect(page.getByRole('article')).toHaveCount(6);
  await expect(page.getByLabel('Development preview')).toContainText('No verified records');
  const health = await page.request.get('/api/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: 'ok', service: 'reservation-watch-api' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('homepage.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('skip link and navigation work with keyboard focus', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  expect(await skip.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
  await page.screenshot({ path: testInfo.outputPath('keyboard-focus.png') });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Explore the project' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#explore$/);
  await expect(page.getByRole('heading', { name: 'Six ways to explore' })).toBeInViewport();
});

test('health status displays loading then error for a failed API request', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/health', async (route) => {
    await pending;
    await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('Checking API…');
  release();
  await expect(page.getByRole('status')).toHaveText('API unavailable — try reloading the page.');
});
