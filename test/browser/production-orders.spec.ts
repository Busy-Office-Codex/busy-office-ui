import { expect, test } from '@playwright/test';

// M7 Slice 3 (Production planning) — the second half of the chain Planning.tsx starts: planned
// order → production order → schedule. Seeded `plannedOrders`/`productionOrders` are both empty
// (every planned order in this reference app is created live from a recommendation), so every
// test here first creates one via Planning before exercising this screen.
async function gotoPlanningAndCreatePlannedOrder(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Planning\b/ }).click();
  await page.getByRole('row', { name: /REC-5002/ }).click();
  await page.getByRole('button', { name: 'Create planned order' }).click();
}

async function gotoProductionOrders(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Production orders\b/ }).click();
}

test('shows the empty state honestly when no planned orders exist yet', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Production orders\b/ }).click();

  await expect(page.getByText('No planned orders yet. Action a recommendation on the Planning screen to create one.')).toBeVisible();
  await expect(page.getByText('No production orders released yet.')).toBeVisible();
});

test('a planned order created on Planning is visible here — a genuinely connected journey, not two isolated screens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoPlanningAndCreatePlannedOrder(page);
  await gotoProductionOrders(page);

  await expect(page.getByRole('row', { name: /PLO-\d+.*Cat6 network cable, 1000ft spool.*East Coast Hub.*25/ })).toBeVisible();
});

test('the full chain — release, start, complete — is three real, independently visible state transitions that update the schedule and stock', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoPlanningAndCreatePlannedOrder(page);
  await gotoProductionOrders(page);

  await page.getByRole('row', { name: /PLO-\d+/ }).click();
  await expect(page.getByText('No linked production order yet.')).toBeVisible();

  await page.getByRole('button', { name: 'Release to production' }).click();
  await expect(page.getByText(/^Linked: Production order PRO-\d+ · started \d{4}-\d{2}-\d{2}$/)).toBeVisible();
  await expect(page.getByRole('row', { name: /PLO-\d+.*Released/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /PRO-\d+.*Cat6 network cable, 1000ft spool.*Released/ })).toBeVisible();

  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByRole('button', { name: 'Complete — update stock' })).toBeVisible();
  await expect(page.getByRole('row', { name: /PRO-\d+.*In progress/ })).toBeVisible();

  await page.getByRole('button', { name: 'Complete — update stock' }).click();
  await expect(page.getByRole('button', { name: 'Complete — update stock' })).toHaveCount(0);
  await expect(page.getByRole('row', { name: /PRO-\d+.*Completed/ })).toBeVisible();

  // The finished qty (25) is added to East Coast Hub's on-hand stock — the same store, read by
  // Inventory, after an action taken here (mirrors inventory.spec.ts's own cross-screen check).
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Inventory\b/ }).click();
  await expect(page.getByRole('row', { name: /Cat6 network cable, 1000ft spool.*East Coast Hub.*30 spool/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /adjustment.*\+25.*PRO-\d+/ })).toBeVisible();
});
