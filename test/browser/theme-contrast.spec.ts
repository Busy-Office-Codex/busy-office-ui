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
});

test.describe('prefers-color-scheme: light keeps the existing light palette unchanged', () => {
  test.use({ colorScheme: 'light' });

  test('the table head background stays light bgCanvas', async ({ page }) => {
    await page.goto('/#examples');

    const head = page.locator('thead');
    await expect(head).toHaveCSS('background-color', 'rgb(248, 250, 252)'); // lightPalette.bgCanvas, #f8fafc
  });
});
