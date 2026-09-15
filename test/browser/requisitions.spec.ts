import { expect, test } from '@playwright/test';

// M7 Slice 2 (Procurement-to-stock) — the first screen to demonstrate the brief's own named
// example journey (requisition → approval → purchase order → goods receipt → updated inventory)
// end to end in one place. See test/browser/inventory.spec.ts for the other end of the same chain.
async function gotoRequisitions(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Requisitions\b/ }).click();
}

test('lists every seeded requisition with its real requester and total', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoRequisitions(page);

  await expect(page.getByRole('row', { name: /REQ-4001.*Marcus Webb.*Facilities/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /REQ-4002.*Priya Shah.*IT/ })).toBeVisible();
});

test('the full chain — approve, then receive goods — is two real, independently visible state transitions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoRequisitions(page);

  await page.getByRole('row', { name: /REQ-4001/ }).click();
  await expect(page.getByRole('heading', { name: 'REQ-4001', exact: true })).toBeVisible();
  await expect(page.getByText('No linked purchase order yet.')).toBeVisible();

  await page.getByRole('button', { name: 'Approve — create purchase order' }).click();

  // A real, freshly-created purchase order appears, sent to the material's real supplier — not a
  // canned success message.
  await expect(page.getByText(/^Linked: Purchase order PO-\d+ · Alden Paper Co\.$/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve — create purchase order' })).toHaveCount(0);
  await expect(page.getByRole('row', { name: /REQ-4001.*Converted/ })).toBeVisible();

  await page.getByRole('button', { name: /Receive goods — update stock/ }).click();

  // The receipt is posted (a second, distinct linked record appears) and the "receive" action is
  // gone — the PO is no longer `sent`, so re-receiving the same order isn't offered.
  await expect(page.getByText(/^Linked: Goods receipt GR-\d+ — stock updated$/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Receive goods/ })).toHaveCount(0);
});

test('rejecting a pending requisition is a real transition and removes the approve action', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoRequisitions(page);

  // REQ-4002 starts as `draft`, not `pending_approval` — no actions render for it at all yet
  // (matches Quotations.tsx's own "honestly gone, not disabled" precedent for out-of-state
  // actions). Use a fresh reload's REQ-4001 instead, which starts `pending_approval`.
  await page.getByRole('row', { name: /REQ-4001/ }).click();
  await page.getByRole('button', { name: 'Reject' }).click();

  await expect(page.getByRole('row', { name: /REQ-4001.*Rejected/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve — create purchase order' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reject' })).toHaveCount(0);
});
