import { expect, test } from '@playwright/test';

// ROADMAP item 13 (2026-09-14 design review, confirmed MEDIUM/HIGH finding): the command
// palette's section overlines (group labels) and the "esc" keyboard hint used color.textTertiary
// (#64748b), which measures ~4.32:1 against the glass panel's actual rendered background — under
// WCAG AA's 4.5:1 body-text threshold. color.textSecondary (#475569) clears it.

test('a command group label (overline) reads color.textSecondary, not color.textTertiary', async ({ page }) => {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Command palette' });

  // Scoped to a real <span> (the group label) rather than getByText alone: the category filter
  // row also renders an "Actions" Chip <button>, so an unscoped text match would be ambiguous.
  const groupLabel = dialog.locator('span').filter({ hasText: /^Actions$/ });
  await expect(groupLabel).toHaveCSS('color', 'rgb(71, 85, 105)'); // color.textSecondary
});

test('the "esc" keyboard hint reads color.textSecondary, not color.textTertiary', async ({ page }) => {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Command palette' });

  // Exact match against just "esc", not the footer's "esc close" caption.
  const escHint = dialog.locator('span').filter({ hasText: /^esc$/ });
  await expect(escHint).toHaveCSS('color', 'rgb(71, 85, 105)'); // color.textSecondary
});

// M10 Text scoring (issue #24): the same class of finding, this time in `Text`'s own `overline`
// variant (src/components/Text.tsx) rather than Shell's hand-styled command-palette labels above
// — `textTertiary` clears 4.5:1 against this variant's real consumers today only barely (4.55:1
// on `bgCanvas`) and fails outright against `bgSubtle` (4.34:1). Moved to `textSecondary`, the
// same fix already applied twice above for the identical token/size/weight/case combination.
test('a Text overline label reads color.textSecondary, not color.textTertiary', async ({ page }) => {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Dashboards\b/ }).click();

  const overline = page.getByText('OPEN ORDERS', { exact: true });
  await expect(overline).toHaveCSS('color', 'rgb(71, 85, 105)'); // color.textSecondary
});
