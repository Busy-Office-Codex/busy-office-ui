import { expect, test } from '@playwright/test';

// M7 Slice 12 (Administration — integrations & API) — fills NAV.Administration's own pre-existing
// 'Integrations' placeholder (M6). AdminOverview.tsx's own static "Integration connected — Slack
// notifications" activity line is this screen's real seeded Slack row and this exact
// `connectIntegration`/`disconnectIntegration` action's own logged message.
async function gotoIntegrations(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Integrations\b/ }).click();
}

test('lists every seeded integration with its category and connection status', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoIntegrations(page);

  await expect(page.getByRole('row', { name: /Slack notifications.*Messaging.*Connected.*2026-09-15/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /QuickBooks Online.*Accounting.*Disconnected/ })).toBeVisible();
});

test('connecting a disconnected integration is a real, live mutation — not a static badge', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoIntegrations(page);

  await page.getByRole('row', { name: /DocuSign/ }).click();
  await expect(page.getByRole('heading', { name: 'DocuSign', exact: true })).toBeVisible();
  await expect(page.getByText('Not connected.')).toBeVisible();

  await page.getByRole('button', { name: 'Connect' }).click();

  await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible();
  await expect(page.getByRole('row', { name: /DocuSign.*Documents.*Connected/ })).toBeVisible();
});

test('disconnecting Slack confirms first (Slice 15), then is logged to the shared audit trail Launcher and AuditLog both read', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoIntegrations(page);

  await page.getByRole('row', { name: /Slack notifications/ }).click();
  await page.getByRole('button', { name: 'Disconnect' }).click();

  // A real confirm step — nothing has changed yet.
  const dialog = page.getByRole('dialog', { name: 'Disconnect Slack notifications?' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('row', { name: /Slack notifications.*Disconnected/ })).toHaveCount(0);

  await dialog.getByRole('button', { name: 'Disconnect' }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Audit log\b/ }).click();

  await expect(page.getByText('Integration disconnected — Slack notifications')).toBeVisible();
});

test('cancelling the disconnect confirmation leaves Slack connected', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoIntegrations(page);

  await page.getByRole('row', { name: /Slack notifications/ }).click();
  await page.getByRole('button', { name: 'Disconnect' }).click();

  const dialog = page.getByRole('dialog', { name: 'Disconnect Slack notifications?' });
  await dialog.getByRole('button', { name: 'Cancel' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('row', { name: /Slack notifications.*Connected/ })).toBeVisible();
});
