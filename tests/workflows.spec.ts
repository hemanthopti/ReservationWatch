import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('global search: combobox keyboard selection, results page, type filter and no-match state', async ({ page }) => {
  await page.goto('/');
  const box = page.getByRole('combobox', { name: 'Search communities, topics or sources' });
  await box.fill('example community d');
  await expect(page.getByRole('option')).toHaveCount(2);
  await box.press('ArrowDown');
  await box.press('ArrowDown');
  await expect(page.getByRole('option', { name: /Example Community D North/ })).toHaveAttribute('aria-selected', 'true');
  await box.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Example Community D North');

  await page.goto('/');
  await box.fill('imaginary');
  await box.press('Enter');
  await expect(page).toHaveURL(/\/search\?q=imaginary/);
  await expect(page.locator('.result-count')).toContainText('for “imaginary”');
  await page.getByRole('group', { name: 'Filter by record type' }).getByRole('button', { name: /^Study/ }).click();
  await expect(page.locator('.result-card')).toHaveCount(6);
  await page.getByLabel('Search all records').fill('zzz-unmatched');
  await expect(page.getByRole('heading', { name: 'No matching records' })).toBeVisible();
  await page.getByRole('button', { name: /Reset filters/ }).first().click();
  await expect(page.getByLabel('Search all records')).toHaveValue('');
});

test('community explorer filters on the same entry, sorts, resets and opens a profile with lookalike warning', async ({ page }) => {
  await page.goto('/communities');
  await expect(page.locator('.result-count')).toHaveText('8 of 8 fictional communities');
  await page.getByLabel('Jurisdiction', { exact: true }).selectOption('centre');
  await expect(page.locator('.result-count')).toHaveText('6 of 8 fictional communities');
  await page.getByLabel('Find a fictional community').fill('Example Community A');
  await page.getByLabel('Sector', { exact: true }).selectOption('representation');
  await expect(page.getByRole('heading', { name: 'No matching records' })).toBeVisible();
  await page.getByLabel('Jurisdiction', { exact: true }).selectOption('karnataka');
  await expect(page.locator('.community-card')).toHaveCount(1);
  await page.getByRole('button', { name: /Reset filters \(3\)/ }).click();
  await page.getByLabel('Sort', { exact: true }).selectOption('desc');
  await expect(page.locator('.community-card h2').first()).toHaveText('Example Community G');
  await page.reload();
  await expect(page.getByLabel('Sort', { exact: true })).toHaveValue('desc');

  await page.getByRole('link', { name: /Example Community D\b(?! North)/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Example Community D');
  await expect(page.getByText('Similarly named, separate record:')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Not an eligibility check' }).or(page.getByText('Not an eligibility check'))).toBeVisible();
  await expect(page.locator('.entry-card')).toHaveCount(3);
  await expect(page.locator('.entry-card').filter({ hasText: 'Superseded' })).toHaveCount(1);
});

test('jurisdiction profile switches sector and as-of date, showing superseded history', async ({ page }) => {
  await page.goto('/jurisdictions/karnataka');
  await expect(page.locator('caption')).toContainText('Karnataka · Education · in effect on 2026-06-30');
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(5);
  await page.getByLabel('View records as of · synthetic date').fill('2022-06-30');
  await expect(page.locator('.rule-card').filter({ hasText: 'In effect on 2022-06-30 · v1' }).first()).toBeVisible();
  await expect(rows.filter({ hasText: 'Example Community D' }).first()).toContainText('Demo group Indigo');
  await page.getByLabel(/Include records not in effect/).check();
  await expect(rows.filter({ hasText: 'Superseded' }).or(rows.filter({ hasText: 'Not yet effective' })).first()).toBeVisible();
  await page.getByRole('button', { name: 'Political representation' }).click();
  await expect(page.locator('caption')).toContainText('Political representation');
  await expect(page).toHaveURL(/sector=representation/);
  await page.locator('.rule-card summary').first().click();
  await expect(page.locator('.rule-card .versions').first()).toBeVisible();
});

test('comparison selectors, swap, identical-selection guidance, sector toggles and chart focus', async ({ page }, info) => {
  await page.goto('/compare');
  await expect(page.locator('caption')).toContainText('Centre vs Karnataka');
  await page.getByRole('button', { name: 'Swap jurisdictions' }).click();
  await expect(page.getByLabel('Left jurisdiction')).toHaveValue('karnataka');
  await expect(page.locator('caption')).toContainText('Karnataka vs Centre');
  await page.getByLabel('Right jurisdiction').selectOption('karnataka');
  await expect(page.getByRole('heading', { name: 'Choose two different jurisdictions' })).toBeVisible();
  await expect(page.locator('table')).toHaveCount(0);
  await page.getByRole('button', { name: 'Compare Karnataka with Centre' }).click();
  await expect(page.getByLabel('Right jurisdiction')).toHaveValue('centre');

  await page.getByRole('checkbox', { name: 'Education' }).uncheck();
  await page.getByRole('checkbox', { name: 'Public employment' }).uncheck();
  await expect(page.getByRole('checkbox', { name: 'Political representation' })).toBeDisabled();
  await expect(page.locator('.paired-row')).toHaveCount(1);
  await page.getByRole('group', { name: 'Chart metric' }).getByRole('button', { name: 'Placeholder units' }).click();
  await page.locator('.paired-row').first().click();
  await expect(page.locator('.paired-row').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('tr.is-highlighted')).toHaveCount(4);
  await page.getByLabel('Show differences only').check();
  expect(await page.locator('tbody tr').count()).toBeLessThanOrEqual(4);
  await page.screenshot({ path: info.outputPath('compare.png'), fullPage: true });
});

test('reach filters, bar selection and trend points update numbers and table equivalents', async ({ page }, info) => {
  await page.goto('/reach');
  const numerator = page.locator('.metric strong').first();
  const before = await numerator.textContent();
  await page.getByLabel('Year', { exact: true }).selectOption('2021');
  await expect(numerator).not.toHaveText(before!);
  await page.getByRole('button', { name: /^Example institution B:/ }).click();
  await expect(page.locator('.detail-panel h2')).toHaveText('Example institution B');
  await page.getByLabel('Institution', { exact: true }).selectOption('Example institution C');
  await expect(page.locator('table').first().locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('.detail-panel h2')).toHaveText('Example institution C');
  await page.getByLabel('Jurisdiction', { exact: true }).selectOption('karnataka');
  await page.getByLabel('Sector', { exact: true }).selectOption('employment');
  await expect(page.locator('caption').first()).toContainText('2021 · Karnataka · Public employment');
  await page.getByRole('button', { name: /^2023:/ }).click();
  await expect(page.locator('.trend-readout')).toContainText('2023:');
  await page.screenshot({ path: info.outputPath('reach.png'), fullPage: true });
});

test('effects, debates and history: filters, details, statement types and timeline year rail', async ({ page }) => {
  await page.goto('/effects');
  await page.getByLabel('Research topic').selectOption('Outcomes');
  await expect(page.locator('.study-card')).toHaveCount(2);
  await page.getByLabel('Jurisdiction scope').selectOption('karnataka');
  await expect(page.locator('.study-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Read methods & limitations' }).click();
  await expect(page.getByRole('heading', { name: 'Limitations', exact: true })).toBeVisible();
  await page.getByLabel('Search imaginary studies').fill('nonexistent');
  await expect(page.getByRole('heading', { name: 'No matching records' })).toBeVisible();
  await page.goto('/effects?study=imaginary-survey');
  await expect(page.getByRole('heading', { name: 'Results · no actual findings' })).toBeVisible();

  await page.goto('/debates');
  await page.getByRole('button', { name: 'Review and continuity' }).click();
  await expect(page.locator('.debate-question')).toContainText('How often');
  await page.getByRole('button', { name: 'Empirical only' }).click();
  await expect(page.locator('.claim-normative')).toHaveCount(0);
  await expect(page.locator('.claim-empirical')).toHaveCount(2);
  await page.getByText('Evidence limitations and unresolved questions', { exact: true }).click();
  await expect(page.getByText(/Review frequency is a value-sensitive/)).toBeVisible();

  await page.goto('/history');
  await expect(page.locator('.timeline-row')).toHaveCount(10);
  await page.getByRole('navigation', { name: 'Jump to a single year' }).getByRole('button', { name: /^2023/ }).click();
  await expect(page.locator('.timeline-row')).toHaveCount(2);
  await page.getByLabel('Timeline subject').selectOption('Review');
  await expect(page.locator('.timeline-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Explore event details' }).click();
  await expect(page.getByText(/No commission, committee or court is represented/)).toBeVisible();
  await page.getByLabel('Timeline subject').selectOption('Design');
  await expect(page.getByRole('heading', { name: 'No matching records' })).toBeVisible();
  await page.getByRole('button', { name: /Reset filters/ }).first().click();
  await expect(page.locator('.timeline-row')).toHaveCount(10);
});

test('data tools: filtered and full exports carry synthetic labels; source detail has no fake document', async ({ page }) => {
  await page.goto('/data');
  await page.getByLabel('Source type').selectOption('Dataset');
  await expect(page.locator('.source-card')).toHaveCount(1);
  for (const format of ['JSON', 'CSV']) {
    const downloading = page.waitForEvent('download');
    await page.getByRole('button', { name: `Export demo ${format}` }).click();
    const download = await downloading;
    const content = await readFile((await download.path())!, 'utf8');
    expect(download.suggestedFilename()).toContain('SYNTHETIC');
    expect(content).toContain('SYNTHETIC DEMONSTRATION ONLY');
    expect(content).toContain('demo-counts');
    expect(content).not.toContain('demo-register');
    if (format === 'JSON') expect(JSON.parse(content).records).toHaveLength(1);
  }
  await expect(page.getByRole('status').filter({ hasText: 'exported as CSV' })).toBeVisible();
  await page.getByLabel('Dataset').selectOption('observations');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export demo JSON' }).click();
  const all = JSON.parse(await readFile((await (await downloading).path())!, 'utf8'));
  expect(all.records.length).toBe(120);
  expect(all.records.every((record: { disclaimer: string }) => record.disclaimer.startsWith('SYNTHETIC'))).toBe(true);

  await page.getByLabel('Dataset').selectOption('filtered');
  await page.getByLabel('Search sources').fill('nonexistent');
  await expect(page.getByRole('button', { name: 'Export demo CSV' })).toBeDisabled();
  await page.goto('/data/demo-register');
  await expect(page.getByRole('heading', { name: 'Document preview is not available' })).toBeVisible();
  await expect(page.locator('a[href^="http"]')).toHaveCount(0);
  await page.getByText(/Audit history/).click();
  await expect(page.getByText('Fixture created by hand for UI-001 prototype')).toBeVisible();
});
