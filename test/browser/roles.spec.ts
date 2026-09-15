import { expect, test } from '@playwright/test';

// M7 Slice 9 (Administration, role management) — the brief's own named Administration journey
// ("Role create/edit/clone") on top of Slice 4's Role data model. Role.moduleAccess was
// write-only before this (Users.tsx could assign a role, nothing could see or edit what a role
// itself grants) — this screen closes that gap, and Users.tsx's own "Preview access" reads the
// exact same `state.roles` this screen edits, so the cross-screen connection is real.
async function gotoRoles(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Roles\b/ }).click();
}

test('lists every seeded role with its real assigned-user count and module-grant count', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoRoles(page);

  await expect(page.getByRole('row', { name: /Administrator.*1.*9/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Finance manager.*0.*4/ })).toBeVisible();
});

test('toggling a module grant is a real, live mutation — not a page-local draft', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoRoles(page);

  await page.getByRole('row', { name: /Finance manager/ }).click();
  await expect(page.getByRole('heading', { name: 'Finance manager', exact: true })).toBeVisible();

  const settingsCheckbox = page.getByRole('checkbox', { name: 'Finance manager · Settings' });
  await expect(settingsCheckbox).toBeChecked();

  await settingsCheckbox.uncheck();
  await expect(settingsCheckbox).not.toBeChecked();
  await expect(page.getByRole('row', { name: /Finance manager.*0.*3/ })).toBeVisible();
});

test('cloning a role creates a real new role with the same grants under a new name', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoRoles(page);

  await page.getByRole('row', { name: /Purchasing/ }).click();
  await page.getByRole('button', { name: 'Clone role' }).click();

  await expect(page.getByRole('heading', { name: 'Purchasing (copy)', exact: true })).toBeVisible();
  await expect(page.getByRole('row', { name: /Purchasing \(copy\).*0.*2/ })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Purchasing (copy) · General' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Purchasing (copy) · Purchase' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Purchasing (copy) · Finance' })).not.toBeChecked();
});

test('a role edit here is immediately visible on Users.tsx — a genuinely connected journey, not two isolated screens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoRoles(page);

  await page.getByRole('row', { name: /Finance manager/ }).click();
  await page.getByRole('checkbox', { name: 'Finance manager · Settings' }).uncheck();

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Users\s+[A-Z]/ }).click();

  await page.getByRole('row', { name: /Elena Cho/ }).click();
  await page.getByRole('button', { name: /^Role · Unassigned/ }).click();
  await page.getByRole('option', { name: 'Finance manager' }).click();

  const preview = page.getByRole('group', { name: 'Module access preview' });
  await expect(preview.getByText('Settings (no access)')).toBeVisible();
  await expect(preview.getByText('Finance', { exact: true })).toBeVisible();
});
