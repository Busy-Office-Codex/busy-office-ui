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
