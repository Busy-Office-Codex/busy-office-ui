import { expect, test } from '@playwright/test';

// M7 Slice 16 (Billing print-preview) — Invoice.tsx's own richly-styled printed-document page
// (M6) never had a working Print action. "Print" now calls a real `window.print()`, and a real
// `@media print` rule hides the action-button row and the payment-status/activity sidebar — app
// chrome, not part of what a customer would receive — leaving only the invoice document itself.
async function gotoInvoice(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Invoice\b/ }).click();
}

async function gotoBilling(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Billing\b/ }).click();
}

// Billing → Invoice live data connection (the remaining half of Billing.tsx's own disclosed gap
// since Slice 10/16) — Invoice.tsx is now store-connected, reading the same shared examples/data
// store every other Sales screen reads, instead of a hardcoded sample invoice.
test('Invoice.tsx renders real, store-connected data — not the old static sample invoice', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoInvoice(page);

  await expect(page.getByRole('heading', { name: 'INV-3201', exact: true })).toBeVisible();
  await expect(page.getByText('Northwind Traders · Issued 2026-09-05')).toBeVisible();
  await expect(page.getByText('ERP implementation — professional services (Phase 2)')).toBeVisible();
  await expect(page.getByText('Sales order · SO-1042')).toBeVisible();
  await expect(page.getByText('Delivery · DL-3101')).toBeVisible();
});

test('"View invoice" on Billing sets real focus, and Invoice.tsx pre-selects that exact invoice on arrival', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBilling(page);

  // Bill SO-1043 too, so a second, newer invoice exists — the sort both screens share
  // (descending by id) would make IT the default selection if the two screens weren't really
  // connected by focus. Selecting INV-3201 here and confirming it (not the new invoice) is what
  // Invoice.tsx shows next is the real proof this is a genuine drill-down.
  await page.getByRole('button', { name: 'Create invoice' }).click();
  await expect(page.getByRole('heading', { name: /^INV-\d+$/ })).toBeVisible();

  await page.getByRole('row', { name: /INV-3201/ }).click();
  await expect(page.getByRole('heading', { name: 'INV-3201', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View invoice' }).click();

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Invoice\b/ }).click();

  await expect(page.getByRole('heading', { name: 'INV-3201', exact: true })).toBeVisible();
  await expect(page.getByText('Northwind Traders · Issued 2026-09-05')).toBeVisible();
});

test('Print calls a real window.print(), not a static button', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoInvoice(page);

  await page.evaluate(() => {
    (window as unknown as { __printed: boolean }).__printed = false;
    window.print = () => {
      (window as unknown as { __printed: boolean }).__printed = true;
    };
  });

  await page.getByRole('button', { name: 'Print', exact: true }).click();

  expect(await page.evaluate(() => (window as unknown as { __printed: boolean }).__printed)).toBe(true);
});

test('printing shows only the invoice document — the action row and sidebar are hidden, the document card is not', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoInvoice(page);

  const printButton = page.getByRole('button', { name: 'Print', exact: true });
  const sidebarHeading = page.getByRole('heading', { name: 'Payment status', exact: true });
  const documentHeading = page.getByRole('heading', { name: 'Line items', exact: true });

  await expect(printButton).toBeVisible();
  await expect(sidebarHeading).toBeVisible();
  await expect(documentHeading).toBeVisible();

  await page.emulateMedia({ media: 'print' });

  await expect(printButton).toBeHidden();
  await expect(sidebarHeading).toBeHidden();
  await expect(documentHeading).toBeVisible();
});
