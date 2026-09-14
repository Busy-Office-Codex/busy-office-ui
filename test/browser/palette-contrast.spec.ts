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
