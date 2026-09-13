import { expect, test } from '@playwright/test';

// docs/ListReport.md's "empty" case: examples/ListReport.tsx's `'ready'`
// state (see its state-prop doc comment) already covers zero-filtered-rows
// as a consequence of the toolbar's own filter/search state, not a separate
// literal — this is the interactive proof that backs that documented claim.
test('searching for a vendor or PO with no matches shows the empty-filter row instead of any orders', async ({ page }) => {
  await page.goto('/#examples');

  const search = page.getByPlaceholder('Search vendor or PO number...');
  await expect(page.getByRole('cell', { name: 'PO-1042', exact: true })).toBeVisible();

  await search.fill('no such vendor or PO');

  await expect(page.getByRole('cell', { name: 'No purchase orders match these filters.', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'PO-1042', exact: true })).toHaveCount(0);
});
