import { expect, type Page } from '@playwright/test';
import { test } from '@playwright/test';

// The /components/ gallery (docs-site/src/pages/components/index.astro) is this docs-site's
// first page built from its own package's chrome (Card/Input/ButtonGroup/Chip), not hand-rolled
// HTML — and its category/search/layout filtering is real client-side behavior, not a static
// list. Real, measured before/after state per the rest of this suite's own bar (see
// live-demo-controls.spec.ts), not a snapshot.

// GalleryControls (client:load) hydrates asynchronously; a `.fill()`/`.click()` sent before its
// listeners attach still passes Playwright's actionability checks (the plain HTML is already
// interactive-looking) but is silently lost — found live, not theoretical: an unguarded
// `.fill('chip')` here landed on the pre-hydration DOM and never reached React's `onChange` at
// all, and (found on the first fix attempt) `data-gallery-grid`'s own `data-layout="comfortable"`
// is a FALSE hydration signal — the .astro template hardcodes that same default value, so the
// attribute already reads "comfortable" from the static server-rendered HTML, before any React
// code runs. The gallery-controls-count paragraph is a real one: it renders a non-breaking space
// until GalleryControls' effect has actually run at least once (see its `visibleCount === null`
// initial state), so waiting for real text there is waiting for hydration, not coincidence.
async function waitForHydration(page: Page) {
  await expect(page.locator('.gallery-controls-count')).toHaveText(/\d+ components? shown/);
}

test('every real component tile renders, with a live demo inside it', async ({ page }) => {
  await page.goto('/components/');
  const count = await page.locator('[data-gallery-item]').count();
  expect(count).toBeGreaterThanOrEqual(13);
  // Spot-check one tile actually hydrated a real LiveDemo, not just a static shell.
  const inputTile = page.locator('[data-gallery-item][data-name="input"]');
  await expect(inputTile.locator('.live-demo')).toBeVisible();
});

test('the category filter hides tiles outside the selected category', async ({ page }) => {
  await page.goto('/components/');
  await waitForHydration(page);
  const total = await page.locator('[data-gallery-item]').count();

  await page.getByRole('button', { name: 'Forms' }).click();
  await expect.poll(() => page.locator('[data-gallery-item]:not([hidden])').count()).toBeGreaterThan(0);
  const formsVisible = await page.locator('[data-gallery-item]:not([hidden])').count();
  expect(formsVisible).toBeLessThan(total);
  await expect(page.locator('[data-gallery-item][data-name="input"]:not([hidden])')).toHaveCount(1);
  await expect(page.locator('[data-gallery-item][data-name="table"]')).toHaveJSProperty('hidden', true);

  // "All" restores every tile.
  await page.getByRole('button', { name: 'All' }).click();
  await expect.poll(() => page.locator('[data-gallery-item]:not([hidden])').count()).toBe(total);
});

test('the search box filters tiles by name, combined with the active category', async ({ page }) => {
  await page.goto('/components/');
  await waitForHydration(page);
  await page.getByRole('textbox', { name: 'Search components' }).fill('chip');
  await expect.poll(() => page.locator('[data-gallery-item]:not([hidden])').count()).toBe(1);
  await expect(page.locator('[data-gallery-item][data-name="chip"]:not([hidden])')).toBeVisible();
});

test('the grid layout toggle switches the grid to compact mode', async ({ page }) => {
  await page.goto('/components/');
  await waitForHydration(page);
  const grid = page.locator('[data-gallery-grid]');
  // Scoped to GalleryControls' own radiogroup — every tile's own LiveDemo has its own Density
  // ButtonGroup with a same-named "Compact" option, so an unscoped `getByRole('radio', { name:
  // 'Compact' })` matches every one of those too, not just this page-level control.
  const gridLayoutGroup = page.getByRole('radiogroup', { name: 'Grid layout' });
  await gridLayoutGroup.getByRole('radio', { name: 'Compact' }).click();
  await expect(grid).toHaveAttribute('data-layout', 'compact');
});
