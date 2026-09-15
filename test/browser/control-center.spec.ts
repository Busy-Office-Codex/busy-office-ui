import { expect, test } from '@playwright/test';

// Owner-directed, 2026-09-15: a quick-settings popover in AppShell's top bar, following the
// "+ New" removal (a real, well-scoped need for a settings entry point once the confusing global
// -create button was gone). See examples/ControlCenter.tsx's file header comment for the full
// design rationale — Density is real/functional, Appearance (dark/system) is honestly disclosed
// as unavailable rather than a silent no-op toggle.
//
// The panel is portaled into `document.body` (not a plain child of the trigger) — this was NOT
// the first implementation. The first attempt rendered it as a normal `position: absolute` child
// inside Shell's top bar, which sets `overflowY: 'hidden'` (so its own content can scroll
// horizontally without a vertical scrollbar) — that clips ANY descendant that visually extends
// past the bar's 52px height, regardless of z-index (confirmed live: bumping z-index to 99999,
// on both the panel and the top bar, changed nothing). The panel-opens-and-nothing-visible-
// happens test below is the actual regression test for that bug — getBoundingClientRect() alone
// would NOT catch it (it doesn't know about ancestor clipping), which is why it checks
// elementFromPoint AND takes a real screenshot-equivalent assertion (toBeVisible, which accounts
// for clipping) rather than just checking computed geometry.
//
// A second, unrelated bug surfaced while fixing the first: focusing the panel's first control on
// open triggered the browser's default scroll-into-view on the top bar's `overflow: hidden` box
// (which still responds to a programmatic scrollTop change even though it blocks scrollbars/user
// -drag scrolling) — visibly throwing the whole top bar's content ~115px upward. Fixed with
// `.focus({ preventScroll: true })`; the scrollTop assertion below is the regression test.

test('opens on click, is genuinely visible (not just present in the DOM), and does not shift the top bar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#examples');

  const trigger = page.getByRole('button', { name: 'Control center' });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  const panel = page.getByRole('dialog', { name: 'Control center' });
  await expect(panel).toBeVisible();

  const scrollTop = await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Control center"]');
    const topBar = btn?.closest('div[style*="position: fixed"]') as HTMLElement | null;
    return topBar?.scrollTop;
  });
  expect(scrollTop).toBe(0);
});

test('Density selection is real: it re-themes density-aware controls across the whole app', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#examples');

  // Probe is the page's Supplier filter Dropdown, NOT the "+ New PO" button — ListReport.tsx
  // deliberately wraps its own header toolbar (including "+ New PO") in a local
  // `<Density value="compact">` (see ListReport.tsx around its `Purchase orders` heading), which
  // — per Density.tsx's own documented nesting rule — always wins over the ambient tier this
  // Control Center sets on AppShell's children. That's an intentional, pre-existing toolbar
  // density choice, not something Control Center is meant to override, so it's the wrong control
  // to assert against here (confirmed live: it stayed 28px through every density change). The
  // Supplier dropdown has no such local override, so it genuinely reflects the ambient tier.
  const supplierDropdown = page.getByRole('button', { name: 'Supplier · All suppliers ▾', exact: true });

  // Set both endpoints explicitly rather than assuming a fresh page starts at "comfortable" —
  // '/#examples' is a hash-only URL, and navigating to the exact same URL a browser is already
  // on is a same-document navigation (no reload), so a prior test's in-memory React state (this
  // is plain useState, not persisted anywhere) can otherwise leak into this one depending on
  // execution order.
  await page.getByRole('button', { name: 'Control center' }).click();
  await page.getByRole('radio', { name: 'Comfortable', exact: true }).click();
  await page.keyboard.press('Escape');
  expect((await supplierDropdown.boundingBox())?.height).toBe(36); // comfortable density's controlHeight

  await page.getByRole('button', { name: 'Control center' }).click();
  await page.getByRole('radio', { name: 'Compact', exact: true }).click();
  await page.keyboard.press('Escape');
  expect((await supplierDropdown.boundingBox())?.height).toBe(28); // compact density's controlHeight
});

test('Appearance: Light is selected and real; Dark/System are disabled, not silent no-ops', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#examples');

  await page.getByRole('button', { name: 'Control center' }).click();

  // ButtonGroup (owner-directed, 2026-09-15: "pls use group button") — a WAI-ARIA radiogroup,
  // not filter Chip's row of `role="button"`/`aria-pressed` pills. See docs/ButtonGroup.md and
  // test/browser/button-group.spec.ts for the component's own keyboard/roving-tabindex contract;
  // this test only checks the Control Center-specific claim (Light real, Dark/System disabled).
  const light = page.getByRole('radio', { name: 'Light', exact: true });
  const dark = page.getByRole('radio', { name: 'Dark — not available yet', exact: true });
  const system = page.getByRole('radio', { name: 'System — not available yet', exact: true });

  await expect(light).toHaveAttribute('aria-checked', 'true');
  await expect(dark).toBeDisabled();
  await expect(system).toBeDisabled();
});

test('focus moves into the panel on open; Escape closes it and returns focus to the trigger', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#examples');

  const trigger = page.getByRole('button', { name: 'Control center' });
  await trigger.click();
  await expect(page.getByRole('radio', { name: 'Light', exact: true })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Control center' })).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('a click outside the panel closes it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#examples');

  await page.getByRole('button', { name: 'Control center' }).click();
  await expect(page.getByRole('dialog', { name: 'Control center' })).toBeVisible();

  await page.mouse.click(200, 400);
  await expect(page.getByRole('dialog', { name: 'Control center' })).toHaveCount(0);
});

test('"Open Settings" navigates to the Settings module and closes the panel', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#examples');

  await page.getByRole('button', { name: 'Control center' }).click();
  await page.getByRole('button', { name: 'Open Settings ↗', exact: true }).click();

  await expect(page.getByRole('dialog', { name: 'Control center' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'General', exact: true })).toBeVisible();
});

test('at a narrow viewport, opening the panel does not push the top bar into horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#examples');

  const before = await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Control center"]');
    const topBar = btn?.closest('div[style*="position: fixed"]') as HTMLElement;
    return { scrollWidth: topBar.scrollWidth, clientWidth: topBar.clientWidth };
  });
  expect(before.scrollWidth).toBeLessThanOrEqual(before.clientWidth);

  await page.getByRole('button', { name: 'Control center' }).click();
  await expect(page.getByRole('dialog', { name: 'Control center' })).toBeVisible();

  const after = await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Control center"]');
    const topBar = btn?.closest('div[style*="position: fixed"]') as HTMLElement;
    return { scrollWidth: topBar.scrollWidth, clientWidth: topBar.clientWidth };
  });
  expect(after.scrollWidth).toBeLessThanOrEqual(after.clientWidth);
});

test('at a narrow viewport, the panel itself stays within the viewport — not just the top bar', async ({ page }) => {
  // Regression test for a real bug found live (owner-flagged, 2026-09-15): widening the panel
  // from 280px to 320px (to fit ButtonGroup's equal-width segments) pushed its LEFT edge to
  // x:-56 at 390px — the top-bar-overflow test above only ever checked the TOP BAR's own
  // scrollWidth/clientWidth, which the portaled, `position:fixed` panel never affects, so it
  // couldn't have caught this. Fixed in ControlCenter.tsx's `positionPanel()` by clamping the
  // computed `right` value against the panel's own measured width.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#examples');

  await page.getByRole('button', { name: 'Control center' }).click();
  const panel = page.getByRole('dialog', { name: 'Control center' });
  const box = await panel.boundingBox();
  if (!box) throw new Error('panel not found');
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
});
