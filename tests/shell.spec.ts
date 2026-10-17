import { expect, test, type Page, type TestInfo } from '@playwright/test';

const isMobile = (info: TestInfo) => info.project.name === 'mobile';
const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main navigation' });

async function openNav(page: Page, info: TestInfo) {
  if (isMobile(info)) await page.getByRole('button', { name: 'Menu' }).click();
}

async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('home renders disclaimers, live API status and topic entry points without errors', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('See the context');
  await expect(page.getByText('Not a government website').first()).toBeVisible();
  await expect(page.getByRole('note', { name: 'Synthetic data notice' })).toContainText('SYNTHETIC DEMONSTRATION');
  await expect(page.getByRole('status').filter({ hasText: 'API' })).toHaveText('API connected');
  await expect(page.locator('.topic-card')).toHaveCount(6);
  const health = await page.request.get('/api/health');
  expect(await health.json()).toEqual({ status: 'ok', service: 'reservation-watch-api' });
  await noHorizontalOverflow(page);
  await page.screenshot({ path: info.outputPath('home.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('health status shows loading then error when the API fails', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/health', async (route) => { await pending; await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }); });
  await page.goto('/');
  const status = page.getByRole('status').filter({ hasText: 'API' });
  await expect(status).toHaveText('Checking API…');
  release();
  await expect(status).toHaveText('API unavailable — try reloading the page.');
});

test('every navigation item opens a real page with the synthetic notice and no overflow', async ({ page }, info) => {
  await page.goto('/');
  const destinations: [string, RegExp][] = [
    ['Rules', /Read the rule/], ['Reach', /A number is only/], ['Effects', /Look past/], ['Debates', /Make room/],
    ['History', /Keep change/], ['Data & Tools', /Keep the source/], ['Communities', /Explore identities/],
    ['Compare', /Compare scope/], ['Home', /See the context/],
  ];
  for (const [name, heading] of destinations) {
    await openNav(page, info);
    const link = mainNav(page).getByRole('link', { name, exact: true });
    await link.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    // The closed mobile menu hides links from role queries, so check the current-page marker via CSS.
    await expect(page.locator('#primary-nav a[aria-current="page"]')).toHaveText(name);
    await expect(page.getByRole('note', { name: 'Synthetic data notice' })).toContainText('fictional');
    if (isMobile(info)) await expect(mainNav(page)).toBeHidden();
    await noHorizontalOverflow(page);
  }
});

test('skip link, focus visibility and mobile menu Escape behave accessibly', async ({ page }, info) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  expect(await skip.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('combobox', { name: 'Search communities, topics or sources' })).toBeFocused();
  if (isMobile(info)) {
    const menu = page.getByRole('button', { name: 'Menu' });
    await menu.click();
    await expect(page.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true');
    await mainNav(page).getByRole('link', { name: 'Rules', exact: true }).focus();
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await expect(mainNav(page)).toBeHidden();
  }
});

test('deep links, reloads, browser back/forward and unknown routes work', async ({ page }) => {
  await page.goto('/jurisdictions/karnataka?sector=employment');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Karnataka');
  await expect(page.getByRole('button', { name: 'Public employment' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('navigation', { name: 'Switch jurisdiction' }).getByRole('link', { name: 'Centre' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Centre');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Karnataka');
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Centre');
  await page.reload();
  await expect(page).toHaveURL(/\/jurisdictions\/centre\?sector=employment/);
  for (const path of ['/communities/not-a-record', '/jurisdictions/atlantis', '/data/nothing', '/no-such-page']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: 'This page was not found' })).toBeVisible();
  }
});
