import { expect, test } from '@playwright/test';

// ROADMAP item 13 (2026-09-14 design review, confirmed HIGH finding, two overlapping reports):
// the dock's pinned-app count badge used to render as a sibling <div> of the tile <button> (a
// status Chip, a fixed 24px tall — 60-70% larger than the ~15-16px reference), which meant a
// disabled tile's badge stayed at full accent strength and was not part of the button's
// accessible name. Shell.tsx now draws it as a bespoke <span> *inside* the tile button.

test('a pinned app with a count draws the badge inside the tile button, not as a sibling element', async ({ page }) => {
  await page.goto('/#examples');
  const tile = page.getByRole('button', { name: 'My work, 12 unread', exact: true });
  await expect(tile).toBeVisible();
  const badge = tile.locator('span[aria-hidden="true"]');
  await expect(badge).toHaveText('12');
});

test('the badge renders at reference size — well under Chip status\'s fixed 24px — pill-shaped and accent-colored', async ({ page }) => {
  await page.goto('/#examples');
  const tile = page.getByRole('button', { name: 'My work, 12 unread', exact: true });
  const badge = tile.locator('span[aria-hidden="true"]');

  await expect(badge).toHaveCSS('font-size', '11px'); // font.sizeOverline
  await expect(badge).toHaveCSS('border-radius', '999px'); // radius.pill
  await expect(badge).toHaveCSS('background-color', 'rgb(0, 87, 184)'); // color.accent
  await expect(badge).toHaveCSS('color', 'rgb(255, 255, 255)'); // color.textOnInk

  const box = await badge.boundingBox();
  if (!box) throw new Error('badge not found');
  expect(box.height).toBeLessThanOrEqual(16); // reference: roughly 15-16px tall
});

test('the badge sits at the tile\'s top-right corner (reference offset -6/-6)', async ({ page }) => {
  await page.goto('/#examples');
  const tile = page.getByRole('button', { name: 'My work, 12 unread', exact: true });
  const badge = tile.locator('span[aria-hidden="true"]');

  const tileBox = await tile.boundingBox();
  const badgeBox = await badge.boundingBox();
  if (!tileBox || !badgeBox) throw new Error('tile or badge not found');
  expect(Math.round(badgeBox.y - tileBox.y)).toBe(-6);
  expect(Math.round(badgeBox.x + badgeBox.width - (tileBox.x + tileBox.width))).toBe(6);
});

test('a tile\'s accessible name includes its unread count; a tile with no count keeps a plain label', async ({ page }) => {
  await page.goto('/#examples');
  await expect(page.getByRole('button', { name: 'My work, 12 unread', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approvals, 7 unread', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inbox, 4 unread', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sales', exact: true })).toBeVisible(); // no count: plain label
});

test('a disabled tile\'s badge dims along with the tile via composited opacity, not an explicit opacity of its own', async ({ page }) => {
  await page.goto('/#examples');
  // "Archived" (examples/AppShell.tsx PINNED) has a `screen` that doesn't exist in this module's
  // NAV entries, so its `routeId` never resolves and the tile renders `disabled` — the one pinned
  // app in this sample with both a count and a genuinely disabled tile, added for this test.
  const tile = page.getByRole('button', { name: 'Archived, 3 unread', exact: true });
  await expect(tile).toBeDisabled();
  await expect(tile).toHaveCSS('opacity', '0.4');

  const badge = tile.locator('span[aria-hidden="true"]');
  await expect(badge).toHaveText('3');
  // No opacity of its own — the CSS initial value (1) — so the disabled button's own opacity:0.4
  // stacking context dims the whole subtree, badge included, by composition rather than the badge
  // fighting it with an explicit opacity that would need to track the tile's disabled state.
  await expect(badge).toHaveCSS('opacity', '1');
});
