import { expect, test } from '@playwright/test';

// ROADMAP item 13 (2026-09-14 design review, confirmed finding): typing a query that narrows
// results to one match, then pressing Enter, used to do nothing — no command ran, the palette
// didn't close. CommandPalette now tracks a roving `highlighted` index over the CURRENTLY VISIBLE
// (filtered) commands (mirroring src/components/Dropdown.tsx's own highlighted-index pattern,
// adapted for a palette whose rows stay real, individually tabbable <button>s), defaulting to the
// first visible command, moved by ArrowUp/ArrowDown on the search Input, and exposed via
// `aria-activedescendant` on the Input itself.

test('typing a query down to a single match, then pressing Enter, runs it and closes the palette', async ({ page }) => {
  await page.goto('/#examples');
  const dialog = page.getByRole('dialog', { name: 'Command palette' });
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();

  // Narrow by category first ("sales" alone would still match both the "Pages" group's "Sales
  // order" route and the "Actions" group's "Create sales order" sample command).
  await dialog.getByRole('button', { name: 'Pages', exact: true }).click();
  const search = page.getByPlaceholder('Search records, run actions, jump to pages…');
  await search.fill('sales');
  await expect(dialog.getByRole('button', { name: /^Sales order\b/ })).toBeVisible();

  await page.keyboard.press('Enter');

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Sales order', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('ArrowDown/ArrowUp move a roving highlight among the visible commands, exposed via aria-activedescendant on the search Input', async ({ page }) => {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Command palette' });
  const search = page.getByPlaceholder('Search records, run actions, jump to pages…');

  const first = dialog.getByRole('button', { name: /^Create sales order\b/ });
  const second = dialog.getByRole('button', { name: /^Approve pending items\b/ });
  const firstId = await first.getAttribute('id');
  const secondId = await second.getAttribute('id');
  expect(firstId).toBeTruthy();
  expect(secondId).toBeTruthy();

  // Default highlight is the first visible command.
  await expect(search).toHaveAttribute('aria-activedescendant', firstId ?? '');

  await search.press('ArrowDown');
  await expect(search).toHaveAttribute('aria-activedescendant', secondId ?? '');

  await search.press('ArrowUp');
  await expect(search).toHaveAttribute('aria-activedescendant', firstId ?? '');
});

test('narrowing the query resets the highlight back to the first visible command', async ({ page }) => {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Command palette' });
  const search = page.getByPlaceholder('Search records, run actions, jump to pages…');

  await search.press('ArrowDown'); // move the highlight off the first item
  await search.fill('sales'); // narrows to "Create sales order" (Actions) and "Sales order" (Pages)

  const firstMatch = dialog.getByRole('button', { name: /^Create sales order\b/ });
  const firstMatchId = await firstMatch.getAttribute('id');
  expect(firstMatchId).toBeTruthy();
  await expect(search).toHaveAttribute('aria-activedescendant', firstMatchId ?? '');
});
