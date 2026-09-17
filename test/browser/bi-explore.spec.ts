import { expect, test } from '@playwright/test';

// ROADMAP item 34, "BI explore" slice (issue #16) — the module's pivot-result screen, filling
// NAV.BI's pre-existing "Explore" placeholder. "Explore BI", not a bare 'Explore' match: no other
// page shares this label today, but this repo's established convention pins the module hint
// anyway (see finance.spec.ts / builder-reports.spec.ts) so a future collision fails loudly here
// instead of silently matching the wrong button.
async function gotoBiExplore(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Explore\s+BI\b/ }).click();
}

test('pivots by warehouse by default, with real seeded values', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBiExplore(page);

  await expect(page.getByRole('heading', { name: 'Explore', exact: true })).toBeVisible();

  // Same real stockLevels aggregation test/browser/inventory.spec.ts and
  // test/browser/builder-reports.spec.ts already verify for the same seed data.
  // `exact: true` — Playwright's default substring match would otherwise also match the result
  // table below, whose own accessible name ("...warehouse, table") starts with this same string.
  const chartTable = page.getByRole('table', { name: 'Units on hand by warehouse', exact: true });
  await expect(chartTable.getByRole('cell', { name: 'Main DC' })).toBeAttached();
  await expect(chartTable.getByRole('cell', { name: '370 units' })).toBeAttached();

  const resultTable = page.getByRole('table', { name: 'Units on hand by warehouse, table' });
  await expect(resultTable.getByRole('cell', { name: 'East Coast Hub' })).toBeVisible();
  await expect(resultTable.getByRole('cell', { name: '100 units' })).toBeVisible();
});

test('re-pivoting by material recomputes both the chart and the result table', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBiExplore(page);

  await page.getByRole('button', { name: /^Pivot by · Warehouse/ }).click();
  await page.getByRole('option', { name: 'Material', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Units on hand by material', exact: true })).toBeVisible();
  const chartTable = page.getByRole('table', { name: 'Units on hand by material', exact: true });
  // Real values, not just real-looking labels — a wrong aggregation (e.g. summing the wrong
  // store field) would still pass a labels-only check but fails this, the same lesson the
  // Reports and Finance slices' own reviews already established for their own new charts.
  await expect(chartTable.getByRole('cell', { name: 'Paper' })).toBeAttached();
  await expect(chartTable.getByRole('cell', { name: '495 units' })).toBeAttached();

  const resultTable = page.getByRole('table', { name: 'Units on hand by material, table' });
  await expect(resultTable.getByRole('cell', { name: 'Cable' })).toBeVisible();
  await expect(resultTable.getByRole('cell', { name: '23 units' })).toBeVisible();
  await expect(resultTable.getByRole('cell', { name: 'Switches' })).toBeVisible();
  await expect(resultTable.getByRole('cell', { name: '15 units' })).toBeVisible();

  // Switching away entirely — proof this replaced the warehouse pivot rather than appending to it.
  await expect(page.getByRole('table', { name: 'Units on hand by warehouse' })).toHaveCount(0);
});

test('both pivots total the same real stock figure — proof they re-slice one dataset, not two', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBiExplore(page);

  // 370 + 100 + 63 (warehouse) and 495 + 23 + 15 (material) both sum to the same 533 real units
  // on hand — a cross-pivot invariant a value-level regression in either aggregation would break,
  // even one that happened to keep the OTHER pivot's numbers looking plausible on its own.
  const sumColumn = async (tableName: string) => {
    const cells = await page.getByRole('table', { name: tableName, exact: true }).getByRole('cell').allTextContents();
    return cells.filter((text) => text.endsWith(' units')).reduce((sum, text) => sum + Number(text.replace(' units', '')), 0);
  };
  expect(await sumColumn('Units on hand by warehouse')).toBe(533);

  await page.getByRole('button', { name: /^Pivot by · Warehouse/ }).click();
  await page.getByRole('option', { name: 'Material', exact: true }).click();
  expect(await sumColumn('Units on hand by material')).toBe(533);
});

test('renders exactly one real chart, not empty scaffolding', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBiExplore(page);

  const surface = page.getByTestId('chart-canvas');
  await expect(surface).toHaveCount(1);
  await expect(surface).toHaveAttribute('aria-hidden', 'true');
});

test('has no horizontal overflow at a 390px mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoBiExplore(page);
  await expect(page.getByRole('heading', { name: 'Explore', exact: true })).toBeVisible();

  const overflow = await page.evaluate(() => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth);
  expect(overflow).toBe(0);
});
