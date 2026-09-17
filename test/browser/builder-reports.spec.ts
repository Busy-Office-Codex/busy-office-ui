import { expect, test } from '@playwright/test';

// M7 Slice 13 (Builder) — "the brief's other named Slice 6 target" (see BuilderScreens.tsx's own
// header comment), the report/dashboard-definition builder. Same journey as BuilderScreens.tsx's
// own spec, exercised here for a report/dashboard layout instead of a page layout.
async function gotoBuilderReports(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  // `\s+[A-Z]` (the hint's capitalized module name right after the label), not a bare `\b`: this
  // label shares its first word with NAV.Finance's own still-unbuilt 'Reports' placeholder (see
  // BuilderReports.tsx's own header comment) — the same disambiguation shape as
  // builder-screens.spec.ts's 'Pages' (which collides with the palette's own "Pages" category
  // chip) and roles.spec.ts/users.spec.ts's 'Users' (which collides with 'Users and roles').
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Reports & dashboards\s+[A-Z]/ }).click();
}

test('opens the first definition with its real seeded widgets, Save disabled with nothing changed', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderReports(page);

  await expect(page.getByRole('heading', { name: 'Sales performance report', exact: true })).toBeVisible();
  await expect(page.getByText('Revenue this month')).toBeVisible();
  await expect(page.getByText('Revenue trend')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
});

test('Preview renders the 5 seeded widgets with real content inside their existing placeholder box (ROADMAP item 34 "Reports" slice)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderReports(page);

  // "Sales performance report": a real KPI stat and a real line chart, not placeholder text.
  await page.getByRole('radio', { name: 'Preview' }).click();
  await expect(page.getByText('$486K')).toBeVisible();
  await expect(page.getByText('+6.4% vs last month')).toBeVisible();
  await expect(page.getByTestId('chart-canvas')).toHaveCount(1);
  const trendTable = page.getByRole('table', { name: 'Revenue trend, last 6 months' });
  await expect(trendTable).toBeAttached();
  // A real value, not just a real-looking table — catches a wrong aggregation the same way a
  // structural check on table/caption presence alone would not.
  await expect(trendTable.getByRole('cell', { name: '$486,000' })).toBeAttached();

  // "Operations dashboard": 2 real charts (bar + donut) reading the SAME live `stockLevels`
  // aggregation, and a real table with a real seeded row — each widget keeps its original
  // bordered box, type caption and label line; this only adds real content inside it.
  await page.getByRole('button', { name: /Operations dashboard/ }).click();
  await expect(page.getByTestId('chart-canvas')).toHaveCount(2);
  const barTable = page.getByRole('table', { name: 'Materials stocked by warehouse', exact: true });
  const donutTable = page.getByRole('table', { name: 'Share of materials stocked by warehouse' });
  await expect(barTable).toBeAttached();
  await expect(donutTable).toBeAttached();
  // The real per-warehouse values (from examples/data/seed.ts's stockLevels) — a count of
  // distinct materials stocked, not a sum of `qtyOnHand` across materials that use different
  // units (ream/spool/unit — ROADMAP item 52/issue #22's fix, applied here since this widget
  // reused Inventory.tsx's own figure byte-identically). Row-scoped regex, not a bare cell-text
  // match: East Coast Hub and West Coast Hub both stock 2 materials, so their cell text alone
  // would be ambiguous.
  for (const table of [barTable, donutTable]) {
    await expect(table.getByRole('row', { name: /Main DC.*3 materials/ })).toBeAttached();
    await expect(table.getByRole('row', { name: /East Coast Hub.*2 materials/ })).toBeAttached();
    await expect(table.getByRole('row', { name: /West Coast Hub.*2 materials/ })).toBeAttached();
  }
  await expect(page.getByRole('cell', { name: 'REQ-4001' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Marcus Webb' })).toBeVisible();

  // A widget with no real backing fact (freshly added from the palette) still gets only the
  // original structural placeholder — proof this isn't a blanket "always render a chart" change.
  await page.getByRole('radio', { name: 'Design' }).click();
  await page.getByRole('button', { name: '+ Bar chart' }).click();
  await page.getByRole('radio', { name: 'Preview' }).click();
  await expect(page.getByText('New bar chart')).toBeVisible();
  await expect(page.getByTestId('chart-canvas')).toHaveCount(2); // unchanged — the new widget drew no chart
});

test('the "Open requisitions" widget reflects a real state transition, not a static snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderReports(page);

  await page.getByRole('button', { name: /Operations dashboard/ }).click();
  await page.getByRole('radio', { name: 'Preview' }).click();
  await expect(page.getByRole('cell', { name: 'REQ-4001' })).toBeVisible();

  // Approve REQ-4001 on the real Requisitions screen (the shared store's other real consumer of
  // this same data) — the widget above reads the same live store, not a snapshot copied in at
  // build time, so it should reflect the transition without any reload.
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Requisitions\b/ }).click();
  await page.getByRole('row', { name: /REQ-4001/ }).click();
  await page.getByRole('button', { name: 'Approve — create purchase order' }).click();

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Reports & dashboards\s+[A-Z]/ }).click();
  await page.getByRole('button', { name: /Operations dashboard/ }).click();
  await page.getByRole('radio', { name: 'Preview' }).click();
  await expect(page.getByText('No requisitions pending approval.')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'REQ-4001' })).toHaveCount(0);
});

test('the full journey — modify, validate (dirty state), preview, save, reopen — is genuinely live', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderReports(page);

  // Modify: add a widget from the palette.
  await page.getByRole('button', { name: '+ Bar chart' }).click();
  await expect(page.getByText('New bar chart')).toBeVisible();

  // Validate: a real dirty-state indicator appears, and Save becomes real (enabled).
  await expect(page.getByText('Unsaved changes')).toBeVisible();
  const saveButton = page.getByRole('button', { name: 'Save' });
  await expect(saveButton).toBeEnabled();

  // Preview: a real, separate render of the current (unsaved) draft, not just an inactive tab.
  await page.getByRole('radio', { name: 'Preview' }).click();
  await expect(page.getByText('BAR CHART', { exact: true })).toBeVisible();
  await expect(page.getByText('New bar chart')).toBeVisible();

  // Save: the dirty state clears and a real confirmation appears.
  await saveButton.click();
  await expect(page.getByText('Saved')).toBeVisible();
  await expect(page.getByText('Unsaved changes')).toHaveCount(0);
  await expect(saveButton).toBeDisabled();
  await expect(page.getByRole('button', { name: /Sales performance report.*3 widgets/ })).toBeVisible();

  // Reopen: switch to the other definition and back — the saved layout is still there, not
  // reverted to the pre-edit 2-widget seed.
  await page.getByRole('button', { name: /Operations dashboard/ }).click();
  await page.getByRole('button', { name: /Sales performance report/ }).click();
  await expect(page.getByText('New bar chart')).toBeVisible();
});

test('switching definitions without saving discards the abandoned draft — the saved version is what "reopen" means', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderReports(page);

  await page.getByRole('button', { name: '+ Table' }).click();
  await expect(page.getByText('New table')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();

  // Switch away WITHOUT saving.
  await page.getByRole('button', { name: /Operations dashboard/ }).click();
  await page.getByRole('button', { name: /Sales performance report/ }).click();

  await expect(page.getByText('New table')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
});
