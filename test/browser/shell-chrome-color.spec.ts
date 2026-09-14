import { expect, test } from '@playwright/test';

// ROADMAP item 13 (2026-09-14 design review, confirmed MEDIUM finding): Shell.tsx's root <div>
// set fontFamily/background but no `color`, so the brand label ("Busy Office") and any other raw
// text slot inherited the browser's UA default black (rgb(0, 0, 0)) instead of color.textPrimary.

test('Shell root sets color:textPrimary, so the brand label does not inherit UA default black', async ({ page }) => {
  await page.goto('/#examples');
  const brand = page.getByText('Busy Office', { exact: true });
  await expect(brand).toBeVisible();
  // color.textPrimary (#0f172a) -> rgb(15, 23, 42); the regression this guards against is the UA
  // default, rgb(0, 0, 0).
  await expect(brand).toHaveCSS('color', 'rgb(15, 23, 42)');
});

// ROADMAP item 13 (confirmed LOW finding, narrowed scope): the active app-strip tab already used
// color.textPrimary correctly; inactive tabs (Button variant="ghost") picked up ghost's own
// default text color instead of the reference's color.textSecondary for inactive strip items.
//
// This preview's route registry (preview/client.tsx) gives every module exactly one route, so
// the app strip never renders a second, genuinely-inactive sibling tab next to an active one
// (docs/Shell.md discloses the same limitation for the active tab's own border-radius). Opening
// the launcher is a second, real way to observe the inactive branch without that: Shell.tsx's
// `active` flag is `route.id === activeRoute?.id && !showLauncher`, so the currently-active
// route's own strip item genuinely switches to its inactive (`variant="ghost"`) styling while the
// launcher overlay is shown, aria-current included.
test('the app-strip item renders inactive (color.textSecondary) styling while the launcher is open', async ({ page }) => {
  await page.goto('/#examples');
  // .first(): once the launcher opens, examples/AppShell.tsx's `home` slot (Launcher, its own
  // AppTile grid — not Shell's built-in DefaultHome fallback, which this sample host never
  // renders since it always supplies `home`) shows its own "Purchase orders" destination tile —
  // a second, genuinely different button with the identical accessible name. The app-strip button
  // stays the first "Purchase orders" match in DOM order, since the strip (Shell.tsx's
  // stripRoutes.map) renders before the content area's launcher view in the JSX tree.
  const stripItem = page.getByRole('button', { name: 'Purchase orders', exact: true }).first();
  await expect(stripItem).toHaveAttribute('aria-current', 'page');

  await page.getByRole('button', { name: 'Open launcher', exact: true }).click();

  await expect(stripItem).not.toHaveAttribute('aria-current', 'page');
  // color.textSecondary (#475569) -> rgb(71, 85, 105).
  await expect(stripItem).toHaveCSS('color', 'rgb(71, 85, 105)');
});
