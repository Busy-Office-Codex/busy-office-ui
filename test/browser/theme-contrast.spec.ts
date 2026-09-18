import { expect, test } from '@playwright/test';

// ROADMAP item 19 (real dark/light/system theming, issue #19, `agreed`, project owner,
// 2026-09-16). Unlike test/color-contrast.test.ts (which checks the palettes' own numbers), this
// checks the "no host action needed" half actually reaches the DOM: with no `Theme` wrapper
// anywhere on the page, a `prefers-color-scheme: dark` viewer gets the dark palette purely from
// each `color.*` var's own `@media` default (tokens.stylex.ts) — the same mechanism
// `motion`'s durations already use for `prefers-reduced-motion`, verified live here rather than
// only in the token source.
//
// examples/ListReport.tsx is the preview's default `/#examples` route (docs/ListReport.md,
// test/browser/table-header-contrast.spec.ts's own comment), so no extra navigation is needed.

test.describe('prefers-color-scheme: dark flips color.* tokens with no Theme wrapper', () => {
  test.use({ colorScheme: 'dark' });

  test('the table head background is dark bgCanvas, not light bgCanvas', async ({ page }) => {
    await page.goto('/#examples');

    const head = page.locator('thead');
    await expect(head).toHaveCSS('background-color', 'rgb(2, 6, 23)'); // darkPalette.bgCanvas, #020617
  });

  test('a header cell reads dark textSecondary, not light textSecondary', async ({ page }) => {
    await page.goto('/#examples');

    const headerCell = page.getByRole('columnheader', { name: 'PO #', exact: true });
    await expect(headerCell).toHaveCSS('color', 'rgb(203, 213, 225)'); // darkPalette.textSecondary, #cbd5e1
  });

  // Button primary's `action`/`textOnInk` pair flips roles in dark mode (tokens.stylex.ts's own
  // comment on `darkPalette` explains why): a near-black "ink" button would vanish against a
  // near-black canvas, so dark mode's `action` is the *lightest* neutral instead, with
  // near-black `textOnInk` text on top of it — verified here as the two concrete rendered colors,
  // not just "some pair of colors that differ from light mode".
  test('a primary Button fills with the flipped light "ink" and near-black text, not light mode\'s dark ink/white text', async ({
    page,
  }) => {
    await page.goto('/#examples');

    const primaryButton = page.getByRole('button', { name: '+ New PO', exact: true });
    await expect(primaryButton).toHaveCSS('background-color', 'rgb(241, 245, 249)'); // darkPalette.action, #f1f5f9
    await expect(primaryButton).toHaveCSS('color', 'rgb(15, 23, 42)'); // darkPalette.textOnInk, #0f172a
  });

  // Theme-safe ERP composition (owner-directed, 2026-09-16): ListReport.tsx's own page-level
  // chrome (the "Purchase orders table" region's border/background, distinct from Table's own
  // internal styling already covered above) used to be raw hex literals — `#e2e8f0`/`#ffffff` —
  // duplicating color.border/color.bgSurface without reading them, so they stayed the light value
  // under dark mode. Real red-proof: this exact test failed with the light-mode rgb values before
  // the fix (border rgb(226,232,240), background rgb(255,255,255)).
  test('the "Purchase orders table" region border and background use dark tokens, not the old raw light-mode hex', async ({
    page,
  }) => {
    await page.goto('/#examples');

    const region = page.getByRole('region', { name: 'Purchase orders table' });
    await expect(region).toHaveCSS('border-color', 'rgb(51, 65, 85)'); // darkPalette.border, #334155
    await expect(region).toHaveCSS('background-color', 'rgb(15, 23, 42)'); // darkPalette.bgSurface, #0f172a
  });

  // Same fix, RecordDetail.tsx: the page's own outer wrapper (`color.bgCanvas`, was raw
  // `#f8fafc`) is 2 DOM levels above the breadcrumb trail in this page's own render tree —
  // walking up from a stable, real element rather than a fragile absolute selector.
  test('RecordDetail.tsx\'s own page background uses dark bgCanvas, not the old raw light-mode hex', async ({ page }) => {
    await page.goto('/#examples');
    await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
    await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Sales order\b/ }).click();

    const pageRoot = page.getByRole('navigation', { name: 'Breadcrumb' }).locator('xpath=../..');
    await expect(pageRoot).toHaveCSS('background-color', 'rgb(2, 6, 23)'); // darkPalette.bgCanvas, #020617
  });

  // Independent review of the fix above found a real gap it exposed: examples/breadcrumbTrail.tsx
  // (rendered by RecordDetail.tsx and Requisitions.tsx) hardcoded its own text colors as raw hex,
  // so once the page background above correctly flips dark, the breadcrumb's "current page" text
  // (was #0f172a, textPrimary's exact light value) rendered near-black on the new near-black
  // background — invisible, not just off-brand. Fixed in the same commit; this is the check that
  // would have caught it (the page-background test above only ever asserted the ancestor's
  // background-color, never this element's own color).
  test('the breadcrumb\'s "current page" text uses dark textPrimary, not the old raw light-mode hex (would be invisible on the new dark background otherwise)', async ({
    page,
  }) => {
    await page.goto('/#examples');
    await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
    await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Sales order\b/ }).click();

    const here = page.getByRole('navigation', { name: 'Breadcrumb' }).getByText('SO-1042', { exact: true });
    await expect(here).toHaveCSS('color', 'rgb(248, 250, 252)'); // darkPalette.textPrimary, #f8fafc
  });

  // Theme-safe page chrome, extended (docs/design-conventions.md's "Theme-safe page chrome"
  // recipe, applied to Delivery.tsx/Inventory.tsx after ListReport.tsx/RecordDetail.tsx). Same
  // command-palette navigation RecordDetail's own test above uses — Delivery/Inventory aren't the
  // default `/#examples` route. The regex anchors on the route label only (`\b` after it) rather
  // than the full accessible name (label + the palette row's own module hint text concatenated),
  // the same technique the pre-existing "Sales order" navigation above already relies on to avoid
  // also matching "Sales orders"; no other command label starts with "Delivery" or "Inventory"
  // here, so this is unambiguous.
  test('the "Deliveries table" region border and background use dark tokens, not the old raw light-mode hex (Delivery.tsx)', async ({
    page,
  }) => {
    await page.goto('/#examples');
    await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
    await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Delivery\b/ }).click();

    const region = page.getByRole('region', { name: 'Deliveries table' });
    await expect(region).toHaveCSS('border-color', 'rgb(51, 65, 85)'); // darkPalette.border, #334155
    await expect(region).toHaveCSS('background-color', 'rgb(15, 23, 42)'); // darkPalette.bgSurface, #0f172a
  });

  // Inventory.tsx's own page background (`color.bgCanvas`, was raw `#f8fafc`) is 2 DOM levels
  // above its "Inventory" heading, same shape as RecordDetail's own page-background test above
  // (walking up from a stable, real element rather than a fragile absolute selector) — this page
  // has no breadcrumb to anchor on, but its heading is the inner content column's first child,
  // same depth from the page root.
  test('Inventory.tsx\'s own page background uses dark bgCanvas, not the old raw light-mode hex', async ({ page }) => {
    await page.goto('/#examples');
    await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
    await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Inventory\b/ }).click();

    const pageRoot = page.getByRole('heading', { name: 'Inventory', exact: true }).locator('xpath=../..');
    await expect(pageRoot).toHaveCSS('background-color', 'rgb(2, 6, 23)'); // darkPalette.bgCanvas, #020617
  });

  // M10 Button scoring (issue #24) found a real framework-code theming defect: the danger
  // variant's hover fill was a hardcoded `rgba(180, 35, 24, 0.08)` — this hue's own light-mode
  // value — that never re-tinted in dark mode. Fixed via a new `color.dangerSubtle` token
  // (tokens.stylex.ts); this is the live check that would have caught the original bug (a token
  // value assertion alone can't prove :hover actually resolves it on a real element).
  test('a danger Button\'s hover fill uses the dark dangerSubtle tint, not the frozen light-mode rgba', async ({
    page,
  }) => {
    await page.goto('/#examples');
    await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
    await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Sales order\b/ }).click();

    const rejectButton = page.getByRole('button', { name: 'Reject', exact: true });
    await rejectButton.hover();
    await expect(rejectButton).toHaveCSS('background-color', 'rgba(239, 68, 68, 0.08)'); // darkPalette.dangerSubtle
  });
});

test.describe('prefers-color-scheme: light keeps the existing light palette unchanged', () => {
  test.use({ colorScheme: 'light' });

  test('the table head background stays light bgCanvas', async ({ page }) => {
    await page.goto('/#examples');

    const head = page.locator('thead');
    await expect(head).toHaveCSS('background-color', 'rgb(248, 250, 252)'); // lightPalette.bgCanvas, #f8fafc
  });

  test('a danger Button\'s hover fill stays the existing light-mode dangerSubtle tint, unchanged', async ({ page }) => {
    await page.goto('/#examples');
    await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
    await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Sales order\b/ }).click();

    const rejectButton = page.getByRole('button', { name: 'Reject', exact: true });
    await rejectButton.hover();
    await expect(rejectButton).toHaveCSS('background-color', 'rgba(180, 35, 24, 0.08)'); // lightPalette.dangerSubtle
  });
});
