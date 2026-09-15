import { expect, test } from '@playwright/test';

// M7 Slice 6 (Builder) — the brief's own named journey: "open definition → modify → validate →
// preview → save → reopen". Unlike BuilderForms.tsx/BuilderWorkflow.tsx (documented STATIC M6
// treatments), this screen is genuinely interactive, so this spec exercises the real journey
// rather than just checking rendered markup.
async function gotoBuilderScreens(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  // `/^Pages\b/` alone also matches the palette's own "Pages" category filter Chip (accessible
  // name exactly "Pages", no hint) — see mobile-responsive.spec.ts's comment on the same
  // collision shape. `\s+[A-Z]` requires the hint's capitalized module name right after the
  // label, which only the actual page command ("Pages Builder") satisfies.
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Pages\s+[A-Z]/ }).click();
}

test('opens the first definition with its real seeded widgets, Save disabled with nothing changed', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderScreens(page);

  await expect(page.getByRole('heading', { name: 'Customer 360', exact: true })).toBeVisible();
  await expect(page.getByText('Lifetime value')).toBeVisible();
  await expect(page.getByText('Open orders')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
});

test('the full journey — modify, validate (dirty state), preview, save, reopen — is genuinely live', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderScreens(page);

  // Modify: add a widget from the palette.
  await page.getByRole('button', { name: '+ Chart' }).click();
  await expect(page.getByText('New chart')).toBeVisible();

  // Validate: a real dirty-state indicator appears, and Save becomes real (enabled).
  await expect(page.getByText('Unsaved changes')).toBeVisible();
  const saveButton = page.getByRole('button', { name: 'Save' });
  await expect(saveButton).toBeEnabled();

  // Preview: a real, separate render of the current (unsaved) draft, not just an inactive tab.
  await page.getByRole('radio', { name: 'Preview' }).click();
  await expect(page.getByText('CHART', { exact: true })).toBeVisible();
  await expect(page.getByText('New chart')).toBeVisible();

  // Save: the dirty state clears and a real confirmation appears.
  await saveButton.click();
  await expect(page.getByText('Saved')).toBeVisible();
  await expect(page.getByText('Unsaved changes')).toHaveCount(0);
  await expect(saveButton).toBeDisabled();
  await expect(page.getByRole('button', { name: /Customer 360.*3 widgets/ })).toBeVisible();

  // Reopen: switch to the other definition and back — the saved layout is still there, not
  // reverted to the pre-edit 2-widget seed.
  await page.getByRole('button', { name: /Procurement overview/ }).click();
  await page.getByRole('button', { name: /Customer 360/ }).click();
  await expect(page.getByText('New chart')).toBeVisible();
});

test('switching definitions without saving discards the abandoned draft — the saved version is what "reopen" means', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoBuilderScreens(page);

  await page.getByRole('button', { name: '+ Stat tile' }).click();
  await expect(page.getByText('New stat tile')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();

  // Switch away WITHOUT saving.
  await page.getByRole('button', { name: /Procurement overview/ }).click();
  await page.getByRole('button', { name: /Customer 360/ }).click();

  await expect(page.getByText('New stat tile')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
});
