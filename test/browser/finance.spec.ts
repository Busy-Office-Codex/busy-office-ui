import { expect, test } from '@playwright/test';

// ROADMAP item 34, "Finance" slice (issue #16) — the module's first real route, closing "17
// Finance — cash flow, 12 months". `/^Overview\s+Finance\b/`, not a bare 'Overview' match: this
// label collides with NAV.Administration's own pre-existing 'Overview' screen — the same
// hint-anchored disambiguation this codebase already relies on for 'Reports & dashboards'
// (builder-reports.spec.ts) and 'Users' (users.spec.ts).
async function gotoFinance(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Overview\s+Finance\b/ }).click();
}

test('renders the module hub with a real accounts-receivable figure, not a placeholder', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoFinance(page);

  await expect(page.getByRole('heading', { name: 'Finance', exact: true })).toBeVisible();

  // Two seeded unpaid invoices: INV-3201 (status "sent", 0 payments recorded — 40 × $185 + 1 ×
  // $2,600 = $10,000 balance due, real structure but not proof the payments subtraction itself is
  // correct, since 0 payments makes "minus posted payments" a no-op) and INV-3105 (status "sent",
  // a real partial payment already posted — $4,200 total minus $1,500 paid = $2,700 balance due,
  // ROADMAP item 52/issue #22 — this one DOES exercise the payments-subtraction arithmetic, and
  // proves a partially-paid invoice is correctly totaled at its remaining balance, not its full
  // original amount, under this same "unpaid" filter). $10,000 + $2,700 = $12,700 total.
  await expect(page.getByText('$12,700 outstanding across 2 unpaid invoices, 0 overdue.')).toBeVisible();

  // The other 3 module areas stay disclosed static cards — no fabricated numbers for concepts
  // with no real data model in this store (this file's own header comment explains why).
  await expect(page.getByText('View journal entries and account balances by period.')).toBeVisible();
  await expect(page.getByText('Track and schedule outgoing supplier payments.')).toBeVisible();
  await expect(page.getByText('Build custom financial reports and dashboards.')).toBeVisible();
});

test('the accounts-receivable figure is genuinely live, not a snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoFinance(page);
  await expect(page.getByText('$12,700 outstanding across 2 unpaid invoices, 0 overdue.')).toBeVisible();

  // Record a real payment on INV-3201 via Billing.tsx (the shared store's other real consumer of
  // this same data) and confirm Finance reflects it with no reload. The default "Record payment"
  // click still pays the full balance due (INV-3201's own payment-amount field defaults to it —
  // see Billing.tsx), which flips the invoice to `status: 'paid'` (appStore.ts's own
  // recordPayment logic) and drops it out of Finance's own "unpaid" filter entirely.
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Billing\b/ }).click();
  await page.getByRole('row', { name: /INV-3201/ }).click();
  await page.getByRole('button', { name: /Record payment/ }).click();

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Overview\s+Finance\b/ }).click();
  // INV-3201 is gone, but INV-3105 (the seeded partially-paid invoice, ROADMAP item 52/issue #22)
  // stays — correctly visible under "unpaid" and correctly totaled at its own $2,700 REMAINING
  // balance, not its $4,200 original amount and not silently dropped.
  await expect(page.getByText('$2,700 outstanding across 1 unpaid invoice, 0 overdue.')).toBeVisible();
});

test('renders a real chart, not empty scaffolding', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoFinance(page);

  const surface = page.getByTestId('chart-canvas');
  await expect(surface).toHaveCount(1);
  await expect(surface).toHaveAttribute('aria-hidden', 'true');
  const table = page.getByRole('table', { name: 'Cash flow, last 12 months' });
  await expect(table).toBeAttached();
  // A real value, not just a real-looking table — the container/aria-hidden/caption above all
  // render unconditionally in Chart.tsx regardless of data, so only this actually distinguishes
  // real data from an empty series.
  await expect(table.getByRole('cell', { name: 'Sep' })).toBeAttached();
  await expect(table.getByRole('cell', { name: '$214,000' })).toBeAttached();
});

test('has no horizontal overflow at a 390px mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoFinance(page);
  await expect(page.getByRole('heading', { name: 'Finance', exact: true })).toBeVisible();

  const overflow = await page.evaluate(() => document.scrollingElement!.scrollWidth - document.scrollingElement!.clientWidth);
  expect(overflow).toBe(0);
});

test('the Finance dock tile is enabled now that a real route exists behind it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#examples');

  const financeTile = page.getByRole('region', { name: 'App dock' }).getByRole('button', { name: 'Finance', exact: true });
  await expect(financeTile).toBeEnabled();
  await financeTile.click();
  await expect(page.getByRole('heading', { name: 'Finance', exact: true })).toBeVisible();
});
