import { expect, test } from '@playwright/test';

// M7 Slice 4 (Administration + role-based config) — the brief's own named journey: "create user
// → assign role → preview access → inspect audit history" in one screen. See
// test/browser/audit-log.spec.ts for the cross-domain trail this screen's actions write into.
async function gotoUsers(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  // `/^Users\b/` alone also matches 'Users and roles Administration' (that page's own accessible
  // name) — see mobile-responsive.spec.ts's comment on the same collision. `\s+[A-Z]` requires
  // whitespace then the hint's capitalized module name right after 'Users', which only this
  // route's exact label satisfies.
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Users\s+[A-Z]/ }).click();
}

test('lists every seeded user with their real department and status', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoUsers(page);

  await expect(page.getByRole('row', { name: /Jordan Lee.*Sales.*Administrator.*Active/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Elena Cho.*Finance.*Invited/ })).toBeVisible();
});

test('assigning a role is a real state transition: status flips to Active and access preview reflects the real grant', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoUsers(page);

  await page.getByRole('row', { name: /Elena Cho/ }).click();
  await expect(page.getByRole('heading', { name: 'Elena Cho', exact: true })).toBeVisible();
  await expect(page.getByText('No role assigned yet — assign one above to preview module access.')).toBeVisible();

  await page.getByRole('button', { name: /^Role · Unassigned/ }).click();
  await page.getByRole('option', { name: 'Finance manager' }).click();

  await expect(page.getByRole('row', { name: /Elena Cho.*Finance manager.*Active/ })).toBeVisible();
  // Scoped to the access-preview group, not a bare text match — "Finance" also appears as the
  // Department table cell on this same page.
  const preview = page.getByRole('group', { name: 'Module access preview' });
  await expect(preview.getByText('Finance', { exact: true })).toBeVisible();
  await expect(preview.getByText('Sales (no access)')).toBeVisible();
});

test('creating a user is a real, live-visible record: appears in the table and in its own audit history', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoUsers(page);

  await page.getByRole('button', { name: '+ New user' }).click();
  const inviteButton = page.getByRole('button', { name: 'Invite' });
  await expect(inviteButton).toBeDisabled();

  await page.getByLabel('Name').fill('Alex Rivera');
  await page.getByLabel('Email').fill('alex.rivera@busyoffice.example');
  await page.getByLabel('Department').fill('BI');
  await expect(inviteButton).toBeEnabled();
  await inviteButton.click();

  await expect(page.getByRole('row', { name: /Alex Rivera.*BI.*Invited/ })).toBeVisible();
  await expect(page.getByText('invited (BI)')).toBeVisible();
});
