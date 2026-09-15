import { expect, test } from '@playwright/test';

// M7 Slice 11 (Entry/nav) — Launcher.tsx's first connection to the shared examples/data store:
// "Recent activity" reads the exact same `state.activity` log every slice since Slice 1 already
// writes to (the same one AuditLog.tsx reads), the reference app's honest answer to the brief's
// "recent items" ask — real events, not a "recently viewed" log this app doesn't instrument.
async function openLauncher(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open launcher' }).click();
}

test('shows the real seeded activity, newest first', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openLauncher(page);

  const recent = page.getByRole('region', { name: 'Recent activity' });
  await expect(recent).toBeVisible();
  await expect(recent.getByText('Renee Castillo assigned role Warehouse')).toBeVisible();

  // Newest seeded entry (2026-09-15) renders above the oldest of the last five — reverse
  // chronological, not insertion order.
  const dates = recent.getByText(/^\d{4}-\d{2}-\d{2}$/);
  await expect(dates.first()).toHaveText('2026-09-15');
});

test('a real action taken elsewhere is immediately visible here — a genuinely connected journey, not two isolated screens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#examples');

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Requisitions\b/ }).click();
  await page.getByRole('row', { name: /REQ-4001/ }).click();
  await page.getByRole('button', { name: 'Approve — create purchase order' }).click();

  await openLauncher(page);
  await expect(page.getByRole('region', { name: 'Recent activity' }).getByText('Requisition REQ-4001 approved')).toBeVisible();
});
