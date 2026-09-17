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

// ROADMAP item 52, issue #22: the payment amount is a real, editable field (defaulting to the
// full balance due — the test above never touches it, proving that default one-click path still
// works unchanged), so a genuinely partial payment is now reachable from the shipped UI, not just
// the data layer (`appActions.recordPayment` already applied a lesser amount correctly).
test('a partial payment updates the balance without marking the invoice paid, and stays visible under the unpaid filter', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBilling(page);

  // INV-3105 (examples/data/seed.ts) starts already partially paid — $1,500 of its $4,200 total —
  // so this also proves the partial-payment path works for an invoice that ALREADY carries a
  // payment, not just the empty-payments case the test above covers.
  await page.getByRole('row', { name: /INV-3105/ }).click();
  await expect(page.getByRole('heading', { name: 'INV-3105', exact: true })).toBeVisible();
  const balanceRow = page.locator('text=Balance due').locator('..');
  await expect(balanceRow.getByText('$2,700.00')).toBeVisible();
  await expect(page.getByRole('row', { name: /INV-3105.*Sent/ })).toBeVisible();

  await page.getByLabel('Payment amount').fill('1000');
  await page.getByRole('button', { name: /Record payment — \$1,000\.00/ }).click();

  await expect(balanceRow.getByText('$1,700.00')).toBeVisible();
  await expect(page.getByText('$1,000.00 · ACH transfer')).toBeVisible();
  // Still short of the full total — a genuine partial payment, not silently forced to full
  // settlement — and the invoice stays correctly visible (not excluded) under the worklist's
  // "Sent" status, the same 'sent'/'overdue' definition Finance.tsx's own Receivables and
  // Analytics.tsx's own Finance exception count use as "unpaid".
  await expect(page.getByRole('row', { name: /INV-3105.*Sent/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /INV-3105.*Paid/ })).toHaveCount(0);
  // "Record payment" is still offered (balance remains > 0), now defaulting to the new remaining
  // balance — proof the default-amount behavior tracks a real, live balance, not a stale one.
  await expect(page.getByRole('button', { name: /Record payment — \$1,700\.00/ })).toBeVisible();
});

test('the payment amount field rejects an amount over the balance due — no way to overpay from this screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBilling(page);

  await page.getByRole('row', { name: /INV-3105/ }).click();
  await page.getByLabel('Payment amount').fill('5000'); // over the $2,700 balance due
  await expect(page.getByRole('button', { name: /Record payment/ })).toBeDisabled();
});

// M7 Slice 10 (Billing completions) — worklist-driven invoice creation and a real cancellation,
// both closing gaps the brief itself named.
test('creating an invoice bills a real un-invoiced confirmed sales order, and the "ready to invoice" card empties once it does', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBilling(page);

  // SO-1043 (Bluepeak Logistics, Slice 7's seed) starts confirmed with no invoice.
  await expect(page.getByText('SO-1043 · Bluepeak Logistics')).toBeVisible();
  await page.getByRole('button', { name: 'Create invoice' }).click();

  await expect(page.getByRole('heading', { name: /^INV-\d+$/ })).toBeVisible();
  await expect(page.getByText('Sales order · SO-1043')).toBeVisible();
  await expect(page.getByText('Delivery · DL-3102')).toBeVisible();
  // No more un-invoiced confirmed orders left, so the card is honestly gone, not empty-but-shown.
  await expect(page.getByText('Ready to invoice')).toHaveCount(0);
});

test('cancelling an invoice confirms first (Slice 15), then is a real state transition, and both actions honestly disappear afterward', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBilling(page);

  await page.getByRole('row', { name: /INV-3201/ }).click();
  await page.getByRole('button', { name: 'Cancel invoice' }).click();

  // A real confirm step — cancellation hasn't happened yet.
  const dialog = page.getByRole('dialog', { name: 'Cancel INV-3201?' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('row', { name: /INV-3201.*Cancelled/ })).toHaveCount(0);

  await dialog.getByRole('button', { name: 'Cancel invoice' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('row', { name: /INV-3201.*Cancelled/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel invoice' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Record payment/ })).toHaveCount(0);
});

test('cancelling the cancel-invoice confirmation leaves the invoice untouched', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBilling(page);

  await page.getByRole('row', { name: /INV-3201/ }).click();
  await page.getByRole('button', { name: 'Cancel invoice' }).click();

  // `exact: true` — the dialog's own dismiss button is named exactly "Cancel", which is also a
  // substring of its danger confirm button's name here, "Cancel invoice" (unlike the Deactivate/
  // Reject/Disconnect dialogs, whose confirm labels don't contain "Cancel").
  const dialog = page.getByRole('dialog', { name: 'Cancel INV-3201?' });
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('row', { name: /INV-3201.*Sent/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel invoice' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Record payment/ })).toBeVisible();
});
