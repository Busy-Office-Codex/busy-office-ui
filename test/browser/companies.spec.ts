import { expect, test } from '@playwright/test';

// M7 Slice 12 (Administration — companies & entities) — fills NAV.Administration's own
// pre-existing 'Companies' placeholder (M6). Settings.tsx already owns the single org-settings
// form for the one entity a host itself is; this screen lists and toggles the account's multiple
// legal entities/business units instead.
async function gotoCompanies(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Companies\b/ }).click();
}

test('lists every seeded legal entity with its business unit and status', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoCompanies(page);

  await expect(page.getByRole('row', { name: /Northwind Traders, LLC.*Corporate HQ.*Active/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Northwind Legacy Services, LLC.*Inactive/ })).toBeVisible();
});

test('activating an inactive entity is a real, live mutation — not a page-local draft', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoCompanies(page);

  await page.getByRole('row', { name: /Northwind Legacy Services/ }).click();
  await expect(page.getByRole('heading', { name: 'Northwind Legacy Services, LLC', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Activate' })).toBeVisible();

  await page.getByRole('button', { name: 'Activate' }).click();

  await expect(page.getByRole('button', { name: 'Deactivate' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Northwind Legacy Services, LLC.*Active/ })).toBeVisible();
});

test('deactivating a company confirms first (Slice 15), then is logged to the shared audit trail Launcher and AuditLog both read', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoCompanies(page);

  await page.getByRole('row', { name: /Northwind Distribution West/ }).click();
  await page.getByRole('button', { name: 'Deactivate' }).click();

  // A real confirm step — nothing has changed yet.
  const dialog = page.getByRole('dialog', { name: 'Deactivate Northwind Distribution West, LLC?' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('row', { name: /Northwind Distribution West, LLC.*Inactive/ })).toHaveCount(0);

  await dialog.getByRole('button', { name: 'Deactivate' }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Audit log\b/ }).click();

  await expect(page.getByText('Northwind Distribution West, LLC deactivated')).toBeVisible();
});

test('cancelling the deactivate confirmation leaves the company active', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoCompanies(page);

  await page.getByRole('row', { name: /Northwind Distribution West/ }).click();
  await page.getByRole('button', { name: 'Deactivate' }).click();

  const dialog = page.getByRole('dialog', { name: 'Deactivate Northwind Distribution West, LLC?' });
  await dialog.getByRole('button', { name: 'Cancel' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('row', { name: /Northwind Distribution West, LLC.*Active/ })).toBeVisible();
});
