import { expect, type Page } from '@playwright/test';
import { test } from '@playwright/test';

// The /components/ gallery (docs-site/src/pages/components/index.astro) is this docs-site's
// first page built from its own package's chrome (Card/Input/ButtonGroup/Chip), not hand-rolled
// HTML — and its category/search/layout filtering is real client-side behavior, not a static
// list. Real, measured before/after state per the rest of this suite's own bar (see
// live-demo-controls.spec.ts), not a snapshot.

// An island's `.fill()`/`.click()` sent before React attaches still passes Playwright's
// actionability checks — the server-rendered HTML already looks interactive — and is then silently
// lost. Found live twice: an unguarded `.fill('chip')` never reached `onChange`, and a click on the
// modal specimen's trigger did nothing. Anything rendered in the SSR'd markup is a FALSE signal for
// this (`data-gallery-grid`'s own `data-layout="comfortable"` is hardcoded in the .astro template,
// so it reads correct before any React runs). Astro's island runtime gives a real one: it removes
// the `ssr` attribute only after the hydrator resolves — `await this.hydrator(...)` then
// `this.removeAttribute("ssr")`, node_modules/astro/dist/runtime/server/astro-island.js:187 — so
// `astro-island[ssr]` means "not yet interactive", first-party and framework-guaranteed.
async function waitForHydration(page: Page) {
  // Scoped to the controls' own island: a `client:visible` tile below the fold legitimately keeps
  // its `ssr` attribute until scrolled to, so the page-wide check can't be used before scrolling.
  await expect(page.locator('astro-island[ssr]:has(.gallery-controls)')).toHaveCount(0);
}

// Every tile's specimen is `client:visible`, so a tile below the fold has not mounted and cannot
// misbehave yet — which is exactly how a real escaped-specimen bug hid from this suite: the
// gallery's other tests only touch controls at the top of the page and never scroll, so the
// `modal` specimen never hydrated during a test run while it was opening a full-viewport dialog
// over all 15 tiles in a real browser. Any assertion about the page as a whole has to force every
// island to mount first.
async function hydrateEveryTile(page: Page) {
  const tiles = page.locator('[data-gallery-item]');
  const count = await tiles.count();
  for (let index = 0; index < count; index += 1) {
    await tiles.nth(index).scrollIntoViewIfNeeded();
  }
  await expect(page.locator('[data-gallery-item] .live-demo')).toHaveCount(count);
  // Now that every tile has been in view, no island anywhere on the page may still be un-hydrated.
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  return count;
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

test('no specimen escapes its own tile to cover the page', async ({ page }) => {
  await page.goto('/components/');
  await waitForHydration(page);
  await hydrateEveryTile(page);

  // A `<dialog>` opened with showModal() is promoted to the browser's top layer, where the demo
  // box's `contain: layout` cannot hold it — it covers the viewport and dims every other tile.
  // docs/Modal.md's sample therefore has to start closed, which is also what that doc's own prose
  // claims ("there is no built-in trigger — the host app owns the `open` state").
  await expect(page.locator('dialog[open]')).toHaveCount(0);

  // The property that actually matters to a reader: the last tile is still reachable by a real
  // click. `trial: true` runs Playwright's full actionability checks — including hit-testing the
  // target — without navigating, so an invisible overlay fails this even when the tile is visible.
  const lastTileLink = page.locator('[data-gallery-item] a').last();
  await expect(lastTileLink).toBeVisible();
  await lastTileLink.click({ trial: true });
});

test("the modal specimen opens on its own page only when its trigger is used", async ({ page }) => {
  await page.goto('/components/modal/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await expect(page.locator('.live-demo')).toBeVisible();
  await expect(page.locator('dialog[open]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Reject order…' }).click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);

  // And it closes again from its own footer — a dialog a reader can open but not dismiss from the
  // buttons it renders is a worse specimen than one that never opens.
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test("a doc sample's own stateful controls work, without crashing the island", async ({ page }) => {
  // docs/ButtonGroup.md's sample drives a real Density tier from its own `React.useState`. Before
  // LiveDemo rendered samples as their own component, clicking these segments threw React #300 and
  // took the island down — so this asserts the sample's state actually round-trips, and that the
  // demo is still alive afterwards (no error box, control still reflects the new value).
  await page.goto('/components/buttongroup/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);

  const sampleGroup = page.locator('.live-demo').getByRole('radiogroup', { name: 'Density' });
  // "Comfortable" is the sample's initial state and "Spacious" is deliberately `disabled` there
  // (it demonstrates the dimmed-but-present convention, named "Spacious — not available yet"), so
  // "Compact" is the one segment whose selection proves the sample's own state round-tripped.
  await expect(sampleGroup.getByRole('radio', { name: 'Comfortable' })).toHaveAttribute('aria-checked', 'true');
  await sampleGroup.getByRole('radio', { name: 'Compact' }).click();
  await expect(sampleGroup.getByRole('radio', { name: 'Compact' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('.live-demo pre[role="alert"]')).toHaveCount(0);
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
