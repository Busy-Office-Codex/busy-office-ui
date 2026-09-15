import { expect, test } from '@playwright/test';

// M7 Slice 4 (Administration + role-based config) — the last hop of the brief's own named
// journey ("...→ inspect audit history"). Reads the exact same shared `activity` array every
// screen since Slice 1 already writes to, so this is a genuinely cross-domain trail, not a
// users-only log invented fresh for this screen.
async function gotoAuditLog(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Audit log\b/ }).click();
}

test('lists seeded activity across multiple domains, newest first', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAuditLog(page);

  await expect(page.getByRole('row', { name: /Requisition.*REQ-4001.*submitted for approval/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Quotation.*QUO-3001.*sent to Northwind Traders/ })).toBeVisible();

  // Newest seeded entry (2026-09-15, an Integration event — Slice 12) renders above the oldest
  // (2026-08-20, a Quotation event) — reverse-chronological, not insertion order (both are dated
  // 2026-09-15; this asserts array order, not a real date sort — see AuditLog.tsx). Scoped to this
  // screen's own table region: previously-visited routes stay in the DOM as `hidden` panes
  // (SamplePreview's own persistence model in preview/client.tsx), so an unscoped `tbody tr` can
  // silently match a different page's table.
  const bodyRows = page.getByRole('region', { name: 'Audit log table' }).locator('tbody tr');
  await expect(bodyRows.first()).toContainText('Integration connected — Slack notifications');
  await expect(bodyRows.last()).toContainText('Quotation QUO-3001 sent to Northwind Traders');
});

test('an action taken on Users is immediately visible here — a genuinely connected journey, not two isolated screens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  // See users.spec.ts's gotoUsers for why this needs `\s+[A-Z]`, not just `\b`.
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Users\s+[A-Z]/ }).click();
  await page.getByRole('row', { name: /Elena Cho/ }).click();
  await page.getByRole('button', { name: /^Role · Unassigned/ }).click();
  await page.getByRole('option', { name: 'Finance manager' }).click();

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Audit log\b/ }).click();

  await expect(page.getByRole('row', { name: /User.*usr-5.*Elena Cho assigned role Finance manager/ })).toBeVisible();
});

test('filtering by type narrows the table to just that record type', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAuditLog(page);

  await page.getByRole('button', { name: /^Type · All types/ }).click();
  await page.getByRole('option', { name: 'User' }).click();

  await expect(page.getByRole('row', { name: /Elena Cho invited \(Finance\)/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Quotation/ })).toHaveCount(0);
});
