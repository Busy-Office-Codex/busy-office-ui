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
  // canned success message. Issue #20/ROADMAP item 37: the linked document now renders as a real
  // breadcrumb trail (Requisitions > REQ-4001 > PO-<id>) instead of the old "Linked: Purchase
  // order ..." sentence — asserted on structure (the WAI-ARIA breadcrumb nav, and the final
  // crumb's `aria-current="page"`), not on that old raw text.
  const linkedTrail = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(linkedTrail).toBeVisible();
  await expect(linkedTrail.getByText('Requisitions', { exact: true })).toBeVisible();
  await expect(linkedTrail.getByText('REQ-4001', { exact: true })).toBeVisible();
  const linkedPurchaseOrder = linkedTrail.getByText(/^PO-\d+$/);
  await expect(linkedPurchaseOrder).toBeVisible();
  await expect(linkedPurchaseOrder).toHaveAttribute('aria-current', 'page');
  // Scoped to the trail's own row, not page-wide: `page.goto('/#examples')` mounts the Purchase
  // Orders sample page first (this app's default route, kept mounted-but-hidden after
  // navigating away, same as every route), and ListReport.tsx's own static sample data
  // (examples/ListReport.tsx) coincidentally also names a supplier "Alden Paper Co." — an
  // unscoped page-wide getByText resolves to both, a real strict-mode violation found live.
  // `.last()`, not `.first()`: `.filter({ has: ... })` matches every matching ancestor div (the
  // whole page wrapper included, since every visited route's pane is a sibling under one shared
  // ancestor here), and Playwright orders matches in document order — outermost first, so the
  // closest/most specific ancestor (the actual flex row wrapping the trail) is the LAST match.
  const linkedRow = page.locator('div').filter({ has: linkedTrail }).last();
  await expect(linkedRow.getByText('Alden Paper Co.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve — create purchase order' })).toHaveCount(0);
  await expect(page.getByRole('row', { name: /REQ-4001.*Converted/ })).toBeVisible();

  await page.getByRole('button', { name: /Receive goods — update stock/ }).click();

  // The receipt is posted (a second, distinct linked record appears) and the "receive" action is
  // gone — the PO is no longer `sent`, so re-receiving the same order isn't offered.
  await expect(page.getByText(/^Linked: Goods receipt GR-\d+ — stock updated$/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Receive goods/ })).toHaveCount(0);
});

test('rejecting a pending requisition confirms first (Slice 15), then is a real transition that removes the approve action', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoRequisitions(page);

  // REQ-4002 starts as `draft`, not `pending_approval` — no actions render for it at all yet
  // (matches Quotations.tsx's own "honestly gone, not disabled" precedent for out-of-state
  // actions). Use a fresh reload's REQ-4001 instead, which starts `pending_approval`.
  await page.getByRole('row', { name: /REQ-4001/ }).click();
  await page.getByRole('button', { name: 'Reject' }).click();

  // A real confirm step, not an immediate mutation — Reject hasn't actually happened yet.
  const dialog = page.getByRole('dialog', { name: 'Reject REQ-4001?' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('row', { name: /REQ-4001.*Rejected/ })).toHaveCount(0);

  await dialog.getByRole('button', { name: 'Reject' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('row', { name: /REQ-4001.*Rejected/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve — create purchase order' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reject' })).toHaveCount(0);
});

test('cancelling the reject confirmation leaves the requisition untouched', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoRequisitions(page);

  await page.getByRole('row', { name: /REQ-4001/ }).click();
  await page.getByRole('button', { name: 'Reject' }).click();

  const dialog = page.getByRole('dialog', { name: 'Reject REQ-4001?' });
  await dialog.getByRole('button', { name: 'Cancel' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('row', { name: /REQ-4001.*Pending approval/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve — create purchase order' })).toBeVisible();
});
