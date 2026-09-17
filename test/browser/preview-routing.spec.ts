import { expect, test } from '@playwright/test';

// ROADMAP item 54/issue #23: `preview/client.tsx`'s `SamplePreview` never synced its active
// route to `location.hash` — no deep-linking, no working back/forward, and loading the preview
// with no hash skipped straight to the sample ERP app instead of the one screen a real user
// actually lands on first (Login's own "Continue" button had no handler at all until this same
// change gave it one). These tests cover the App-level routing this fix changed directly; the
// existing 128 `/#examples`-based tests across this suite are unaffected (confirmed by reading
// App()'s own logic: a non-empty, non-reserved, no-slash hash like `examples` still falls
// through to SamplePreview and, not matching any real route id, falls back to the same default
// route the old plain useState always started at — same behavior, not a coincidence relied on
// blindly).

test('loading the preview with no hash shows Login, not the sample app', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Sign in to your workspace')).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe('');
});

test('Login\'s Continue button enters the sample app with a real hash, and the URL keeps tracking navigation from there', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Purchase orders', exact: true })).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe('#purchase-orders');

  // Real in-app navigation (dock tile to Sales) updates the hash to match — this is the part
  // that was completely missing before: the hash used to never change no matter how you
  // navigated inside the sample app.
  await page.getByRole('button', { name: 'Sales', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'SO-1042 · Northwind Traders' })).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe('#sales-order-detail');
});

test('browser back/forward moves between previously-visited routes in the sample app', async ({ page }) => {
  // A real route hash, not `/#examples` — `#examples` isn't a real route id, so the stale-hash
  // correction effect (added this same review round) immediately rewrites it to
  // `#purchase-orders`, pushing an extra history entry that would make a single `goBack()` land
  // on that correction rather than truly re-testing back/forward across in-app navigation.
  await page.goto('/#purchase-orders');
  await expect(page.getByRole('heading', { name: 'Purchase orders', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Sales', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'SO-1042 · Northwind Traders' })).toBeVisible();

  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Purchase orders', exact: true })).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe('#purchase-orders');

  await page.goForward();
  await expect(page.getByRole('heading', { name: 'SO-1042 · Northwind Traders' })).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe('#sales-order-detail');
});

test('a stale or invalid hash falls back to the default route instead of rendering nothing', async ({ page }) => {
  await page.goto('/#not-a-real-route-id');
  await expect(page.getByRole('heading', { name: 'Purchase orders', exact: true })).toBeVisible();
  // Found live during review: the content fallback alone left the address bar still showing the
  // invalid hash, so a bookmarked/shared URL wouldn't describe what it actually displayed — the
  // hash is now corrected to match what's really on screen, not just the rendered content.
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#purchase-orders');
});

test('deep-linking straight to a specific route works on first load, not just after in-app navigation', async ({ page }) => {
  await page.goto('/#sales-order-detail');
  await expect(page.getByRole('heading', { name: 'SO-1042 · Northwind Traders' })).toBeVisible();
});
