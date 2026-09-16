import { expect, test } from '@playwright/test';

// M7 Slice 13 (Builder) — "the brief's other named Slice 6 target" (see BuilderScreens.tsx's own
// header comment), the report/dashboard-definition builder. Same journey as BuilderScreens.tsx's
// own spec, exercised here for a report/dashboard layout instead of a page layout.
async function gotoBuilderReports(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  // `\s+[A-Z]` (the hint's capitalized module name right after the label), not a bare `\b`: this
  // label shares its first word with NAV.Finance's own still-unbuilt 'Reports' placeholder (see
  // BuilderReports.tsx's own header comment) — the same disambiguation shape as
  // builder-screens.spec.ts's 'Pages' (which collides with the palette's own "Pages" category
  // chip) and roles.spec.ts/users.spec.ts's 'Users' (which collides with 'Users and roles').
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Reports & dashboards\s+[A-Z]/ }).click();
}

test('opens the first definition with its real seeded widgets, Save disabled with nothing changed', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderReports(page);

  await expect(page.getByRole('heading', { name: 'Sales performance report', exact: true })).toBeVisible();
  await expect(page.getByText('Revenue this month')).toBeVisible();
  await expect(page.getByText('Revenue trend')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
});

test('the full journey — modify, validate (dirty state), preview, save, reopen — is genuinely live', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderReports(page);

  // Modify: add a widget from the palette.
  await page.getByRole('button', { name: '+ Bar chart' }).click();
  await expect(page.getByText('New bar chart')).toBeVisible();

  // Validate: a real dirty-state indicator appears, and Save becomes real (enabled).
  await expect(page.getByText('Unsaved changes')).toBeVisible();
  const saveButton = page.getByRole('button', { name: 'Save' });
  await expect(saveButton).toBeEnabled();

  // Preview: a real, separate render of the current (unsaved) draft, not just an inactive tab.
  await page.getByRole('radio', { name: 'Preview' }).click();
  await expect(page.getByText('BAR CHART', { exact: true })).toBeVisible();
  await expect(page.getByText('New bar chart')).toBeVisible();

  // Save: the dirty state clears and a real confirmation appears.
  await saveButton.click();
  await expect(page.getByText('Saved')).toBeVisible();
  await expect(page.getByText('Unsaved changes')).toHaveCount(0);
  await expect(saveButton).toBeDisabled();
  await expect(page.getByRole('button', { name: /Sales performance report.*3 widgets/ })).toBeVisible();

  // Reopen: switch to the other definition and back — the saved layout is still there, not
  // reverted to the pre-edit 2-widget seed.
  await page.getByRole('button', { name: /Operations dashboard/ }).click();
  await page.getByRole('button', { name: /Sales performance report/ }).click();
  await expect(page.getByText('New bar chart')).toBeVisible();
});

test('switching definitions without saving discards the abandoned draft — the saved version is what "reopen" means', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderReports(page);

  await page.getByRole('button', { name: '+ Table' }).click();
  await expect(page.getByText('New table')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();

  // Switch away WITHOUT saving.
  await page.getByRole('button', { name: /Operations dashboard/ }).click();
  await page.getByRole('button', { name: /Sales performance report/ }).click();

  await expect(page.getByText('New table')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
});
