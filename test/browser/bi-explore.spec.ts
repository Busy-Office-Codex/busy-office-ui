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

  // ROADMAP item 52/issue #22: the warehouse pivot counts distinct materials stocked rather than
  // summing `qtyOnHand` across materials that use different units (ream/spool/unit) — the same
  // fix test/browser/inventory.spec.ts and test/browser/builder-reports.spec.ts's own charts get.
  // Row-scoped regex (not a bare cell-text match) because more than one warehouse can share the
  // same material count (East Coast Hub and West Coast Hub both stock 2).
  // `exact: true` — Playwright's default substring match would otherwise also match the result
  // table below, whose own accessible name ("...warehouse, table") starts with this same string.
  const chartTable = page.getByRole('table', { name: 'Materials stocked by warehouse', exact: true });
  await expect(chartTable.getByRole('row', { name: /Main DC.*3 materials/ })).toBeAttached();

  const resultTable = page.getByRole('table', { name: 'Materials stocked by warehouse, table' });
  await expect(resultTable.getByRole('row', { name: /East Coast Hub.*2 materials/ })).toBeVisible();
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
  await expect(page.getByRole('table', { name: 'Materials stocked by warehouse' })).toHaveCount(0);
});

test('the warehouse pivot counts materials rather than summing incompatible physical quantities (ROADMAP item 52/issue #22)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBiExplore(page);

  // Regression check for the mixed-unit bug this fix closes: `stockLevels.qtyOnHand` uses a
  // different unit per material (ream/spool/unit — see examples/data/seed.ts's own Product.unit
  // field), so summing it ACROSS materials within one warehouse used to produce a meaningless
  // cross-unit total (it happened to read "370"/"100"/"63" before this fix, and even proved a
  // false "both pivots total the same real figure" invariant against the by-material pivot's own,
  // genuinely combinable, 533-unit total — that coincidence is exactly what made the bug easy to
  // miss). The warehouse pivot now counts distinct materials instead: 3 (Main DC) + 2 (East Coast
  // Hub) + 2 (West Coast Hub) = 7, the same as `stockLevels`' own 7 seeded rows — a count of stock
  // lines, not a sum of incompatible physical quantities, and independently checkable against the
  // material pivot's own SKU list below.
  const sumMaterialsColumn = async () => {
    const cells = await page.getByRole('table', { name: 'Materials stocked by warehouse', exact: true }).getByRole('cell').allTextContents();
    return cells.filter((text) => text.endsWith(' materials')).reduce((sum, text) => sum + Number(text.replace(' materials', '')), 0);
  };
  expect(await sumMaterialsColumn()).toBe(7);

  // The by-material pivot, unaffected by this fix (it never crosses a unit boundary — each row is
  // scoped to ONE material's own unit, summed only across warehouses), still reports the real
  // 533-unit total: Paper 495 + Cable 23 + Switches 15.
  await page.getByRole('button', { name: /^Pivot by · Warehouse/ }).click();
  await page.getByRole('option', { name: 'Material', exact: true }).click();
  const sumUnitsColumn = async () => {
    const cells = await page.getByRole('table', { name: 'Units on hand by material', exact: true }).getByRole('cell').allTextContents();
    return cells.filter((text) => text.endsWith(' units')).reduce((sum, text) => sum + Number(text.replace(' units', '')), 0);
  };
  expect(await sumUnitsColumn()).toBe(533);
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
