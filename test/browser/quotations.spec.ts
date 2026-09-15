import { expect, test } from '@playwright/test';

// M7 Slice 1 (Sales-to-billing) — the first screen reading from the shared examples/data store
// instead of a page-local hardcoded array. Reached via the command palette, same as every route.
async function gotoQuotations(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Quotations\b/ }).click();
}

test('lists every seeded quotation with its real customer and total', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoQuotations(page);

  await expect(page.getByRole('row', { name: /QUO-3001.*Northwind Traders/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /QUO-3002.*Solace Health Partners/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /QUO-3003.*Delta Manufacturing/ })).toBeVisible();
});

test('clicking a row shows its line items and total in the detail panel', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoQuotations(page);

  await page.getByRole('row', { name: /QUO-3002/ }).click();
  await expect(page.getByRole('heading', { name: 'QUO-3002', exact: true })).toBeVisible();
  await expect(page.getByText('Additional user licenses')).toBeVisible();
  await expect(page.getByText('Total $1,125.00')).toBeVisible();
});

test('accepting a sent quotation is a real state transition, not a static outcome', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoQuotations(page);

  await page.getByRole('row', { name: /QUO-3002.*Sent/ }).click();
  await expect(page.getByRole('heading', { name: 'QUO-3002', exact: true })).toBeVisible();
  await expect(page.getByText('No linked sales order yet.')).toBeVisible();

  await page.getByRole('button', { name: 'Accept — create sales order' }).click();

  // The status flips, a genuinely new linked sales order appears, and the accept button (only
  // rendered for `sent` quotations) is gone — three independent signals the mock state actually
  // changed, not just a toast claiming it did.
  await expect(page.getByText(/^Linked: Sales order SO-\d+$/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept — create sales order' })).toHaveCount(0);

  // And the table row itself reflects it too, independent of the detail panel.
  await expect(page.getByRole('row', { name: /QUO-3002.*Accepted/ })).toBeVisible();
});

test('an already-accepted quotation has no Accept button — the action is honestly gone, not disabled-and-clickable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoQuotations(page);

  await page.getByRole('row', { name: /QUO-3001/ }).click();
  await expect(page.getByRole('heading', { name: 'QUO-3001', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept — create sales order' })).toHaveCount(0);
  await expect(page.getByText('Linked: Sales order SO-1042')).toBeVisible();
});
