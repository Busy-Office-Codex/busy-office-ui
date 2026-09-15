import { expect, test } from '@playwright/test';

// M7 Slice 1 (Sales-to-billing) — Billing's first real consumer of the shared examples/data
// store; its one seeded invoice (INV-3201) is the same record Quotations.tsx's QUO-3001 → SO-1042
// chain already produced, so this is testing the LAST hop of one connected journey, not an
// isolated screen.
async function gotoBilling(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Billing\b/ }).click();
}

test('lists the seeded invoice and its real customer/total', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBilling(page);

  await expect(page.getByRole('row', { name: /INV-3201.*Northwind Traders/ })).toBeVisible();
});

test('the detail panel shows the same linked sales order and delivery Quotations.tsx produced', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBilling(page);

  await page.getByRole('row', { name: /INV-3201/ }).click();
  await expect(page.getByRole('heading', { name: 'INV-3201', exact: true })).toBeVisible();
  await expect(page.getByText('Sales order · SO-1042')).toBeVisible();
  await expect(page.getByText('Delivery · DL-3101')).toBeVisible();
});

test('recording a payment is a real state transition: balance due drops to zero and status flips to Paid', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBilling(page);

  await page.getByRole('row', { name: /INV-3201/ }).click();
  await expect(page.getByText('Balance due')).toBeVisible();
  const balanceRow = page.locator('text=Balance due').locator('..');
  await expect(balanceRow.getByText('$10,000.00')).toBeVisible();

  await page.getByRole('button', { name: /Record payment/ }).click();

  await expect(balanceRow.getByText('$0.00')).toBeVisible();
  await expect(page.getByText('Payments received')).toBeVisible();
  await expect(page.getByText('$10,000.00 · ACH transfer')).toBeVisible();
  // Once fully paid, `balanceDue > 0` is false — the Record payment button genuinely disappears
  // rather than staying clickable-but-inert.
  await expect(page.getByRole('button', { name: /Record payment/ })).toHaveCount(0);

  // And the worklist row itself reflects the new status, independent of the detail panel.
  await expect(page.getByRole('row', { name: /INV-3201.*Paid/ })).toBeVisible();
});
