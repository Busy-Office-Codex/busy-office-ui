import { expect, test } from '@playwright/test';

// ROADMAP item 11 (2026-09-14 grilled design review): each Purchase-orders `Dropdown` filter
// (examples/ListReport.tsx) marks its own default item ("All suppliers"/"All statuses"/
// "All buyers"/"Any time") `selected` purely so the menu itself shows a checkmark for something —
// but `Dropdown` used to fill its trigger dark whenever ANY item was `selected`
// (`items.some(item => item.selected)`), so all four filters rendered identical to the page's one
// primary "+ New PO" action even though none of them were narrowing anything. Dropdown.tsx now
// takes a real `active` prop (ListReport computes it as `current !== default`) that alone drives
// the dark `triggerActive` fill, and gives the trigger real rest/hover/:active/open states plus a
// real keyboard-highlight indicator and a focus ring that survives the menu opening. These tests
// assert the rebuilt component's actual computed CSS, not just "differs from the old screenshot".

const TRANSPARENT = 'rgba(0, 0, 0, 0)';
const BG_SUBTLE = 'rgb(241, 245, 249)'; // color.bgSubtle
const BORDER = 'rgb(226, 232, 240)'; // color.border
const BORDER_STRONG = 'rgb(203, 213, 225)'; // color.borderStrong
const ACTION = 'rgb(15, 23, 42)'; // color.action
const FOCUS_RING = 'rgb(0, 87, 184)'; // color.focusRing

test('all four Purchase-orders filters render as unfilled outline pills at rest', async ({ page }) => {
  await page.goto('/#examples');

  for (const name of [/^Supplier/, /^Status/, /^Buyer/, /^Expected/]) {
    const trigger = page.getByRole('button', { name });
    await expect(trigger).toHaveCSS('background-color', TRANSPARENT);
    // `border-top-color` (a longhand), not the `border-color` shorthand — matches the existing
    // convention in test/browser/compact-controls.spec.ts's own border-color assertions.
    await expect(trigger).toHaveCSS('border-top-color', BORDER_STRONG); // color.borderStrong, same as Chip's filter rest border
  }
});

test('choosing a non-default value fills only that filter — the other three stay unfilled', async ({ page }) => {
  await page.goto('/#examples');

  const supplier = page.getByRole('button', { name: /^Supplier/ });
  await supplier.click();
  await page.getByRole('option', { name: 'Northgate Office Supply' }).click();

  await expect(supplier).toHaveText(/Northgate Office Supply/);
  await expect(supplier).toHaveCSS('background-color', ACTION); // color.action — a real narrowed filter now

  await expect(page.getByRole('button', { name: /^Status/ })).toHaveCSS('background-color', TRANSPARENT);
  await expect(page.getByRole('button', { name: /^Buyer/ })).toHaveCSS('background-color', TRANSPARENT);
  await expect(page.getByRole('button', { name: /^Expected/ })).toHaveCSS('background-color', TRANSPARENT);
});

test("a filter trigger's computed background genuinely differs across rest, hover, :active (mousedown) and open", async ({
  page,
}) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: /^Expected/ });
  const box = await trigger.boundingBox();
  if (!box) throw new Error('Expected trigger not found');
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  await expect(trigger).toHaveCSS('background-color', TRANSPARENT); // rest

  await page.mouse.move(center.x, center.y);
  await expect(trigger).toHaveCSS('background-color', BG_SUBTLE); // :hover

  await page.mouse.down();
  await expect(trigger).toHaveCSS('background-color', BORDER); // :active (mousedown, not yet released)

  // Releasing completes the click -> Dropdown opens the menu. Reuses the same interaction (rather
  // than a separate click) so mousedown's :active state is captured before the DOM changes under it.
  await page.mouse.up();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger).toHaveCSS('background-color', BORDER_STRONG); // open, still not an applied filter

  // All four computed values above are distinct from one another (TRANSPARENT, BG_SUBTLE, BORDER,
  // BORDER_STRONG) — a real, reference-matched progression, not a single flat rest style, and
  // still lighter than the ACTION fill reserved for `active`.
});

test('the keyboard-highlighted option gets a real background + outline, not the old near-invisible tint', async ({
  page,
}) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: /^Status/ });
  await trigger.focus();
  await page.keyboard.press('ArrowDown'); // opens the menu; the default "All statuses" item starts highlighted
  await page.keyboard.press('ArrowDown'); // moves the highlight onto "Awaiting approval"

  const highlighted = page.getByRole('option', { name: 'Awaiting approval' });
  await expect(highlighted).toHaveCSS('background-color', BG_SUBTLE); // color.bgSubtle, not the old rgba(15,23,42,0.06)
  await expect(highlighted).toHaveCSS('outline-color', FOCUS_RING);
  await expect(highlighted).toHaveCSS('outline-width', '2px');
  await expect(highlighted).toHaveCSS('outline-style', 'solid');

  // A non-highlighted option must not also carry the indicator (it's a highlight, not a static
  // per-row treatment).
  const other = page.getByRole('option', { name: 'Overdue' });
  await expect(other).toHaveCSS('background-color', TRANSPARENT);
  await expect(other).toHaveCSS('outline-width', '0px');
});

test('the listbox keeps a visible focus indicator while the menu is open via keyboard', async ({ page }) => {
  await page.goto('/#examples');
  const trigger = page.getByRole('button', { name: /^Buyer/ });

  // Real DOM focus moves from the trigger onto the listbox itself once the menu opens
  // (Dropdown.tsx's `open` effect calls `menuRef.current.focus()`), so the trigger's own
  // `:focus-visible` ring cannot be what "survives" the open — it isn't the focused element
  // anymore. The listbox picking up its own `:focus-visible` ring is the mechanism this component
  // actually uses to keep a visible indicator while the menu is open (see docs/Dropdown.md).
  await trigger.focus();
  await expect(trigger).toHaveCSS('outline-width', '2px'); // the trigger's ring, before opening

  await page.keyboard.press('ArrowDown'); // opens the menu via the keyboard
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeFocused();
  await expect(listbox).toHaveCSS('outline-width', '2px');
  await expect(listbox).toHaveCSS('outline-style', 'solid');
  await expect(listbox).toHaveCSS('outline-color', FOCUS_RING);
});
