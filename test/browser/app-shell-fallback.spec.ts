import { expect, test } from '@playwright/test';

// AppShell's own doc comment (docs/AppShell.md) says omitting `navigation` gives "a
// self-contained sample built from the module map above" — but that fallback
// (examples/AppShell.tsx's sampleRoutes()) maps ALL of its NAV table unconditionally, and had no
// real consumer anywhere (preview/client.tsx always supplies its own explicit `navigation`) until
// docs-site's docs/AppShell.md live demo hit it live and found it broken: 52 real routes today
// against SHELL_MAX_ROUTES, which was 40 at the time (ROADMAP item 45; fixed by raising the cap
// to 64). preview/AppShellFallbackLab.tsx mounts the exact same bare `<AppShell />` — this test
// locks the property that broke (the fallback validates cleanly), not the value, so the next NAV
// entry that pushes the real count past SHELL_MAX_ROUTES fails here, not silently on a live page.

test('the self-contained sample (no navigation prop) renders real navigation, not the invalid-registry fallback', async ({ page }) => {
  await page.goto('/#app-shell-fallback-lab');

  await expect(page.getByText('Navigation is unavailable')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
  await expect(page.getByText('For you')).toBeVisible();
});

// ROADMAP item 54/issue #23: the fallback's own `activeRouteId` is now hash-synced too (same fix
// as `preview/client.tsx`'s `SamplePreview`) — real deep-linking and a fixed regression this
// change would otherwise have introduced: once this fallback's own navigation started writing
// real route ids into `location.hash`, the hash no longer equals the literal `#app-shell-
// fallback-lab` entry hash `preview/client.tsx`'s outer router checks, so without the fix below
// (disambiguating this fallback's `module/label`-shaped ids from SamplePreview's own flat ids),
// navigating even once inside this lab would silently fall through to SamplePreview instead —
// this test would have caught that regression by asserting the AppShell chrome survives.
test('navigating inside the self-contained sample updates the hash and does not fall out to the main sample app', async ({ page }) => {
  await page.goto('/#app-shell-fallback-lab');
  await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Role page\b/ }).click();
  expect(await page.evaluate(() => location.hash)).toBe('#general/role-page');
  // Still the fallback's own chrome (its own dock tile grid, disabled tiles included per the
  // module comment above), not SamplePreview's dock (which has no "Approvals" pinned tile with
  // that exact disabled-with-count precedent).
  await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
});

// Adversarial review of the first cut of item 54/issue #23 found the tests above only prove
// hash-sync WORKS SOMEWHERE (via preview/client.tsx's separate SamplePreview) — neither actually
// loads this fallback directly with a real route hash, nor exercises its own back/forward. Those
// two are added here, mirroring test/browser/preview-routing.spec.ts's equivalent SamplePreview
// coverage, since the Accept clause names both for "AppShell with no navigation prop" by name.
test('loading the self-contained sample with a valid route hash renders that route on first load, not just after a click', async ({ page }) => {
  await page.goto('/#general/inbox');

  await expect(page.getByRole('button', { name: 'Inbox', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('browser back/forward moves between previously-visited routes in the self-contained sample', async ({ page }) => {
  await page.goto('/#app-shell-fallback-lab');
  const roleButton = page.getByRole('button', { name: 'Role page', exact: true });
  const inboxButton = page.getByRole('button', { name: 'Inbox', exact: true });

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Role page\b/ }).click();
  await expect(roleButton).toHaveAttribute('aria-current', 'page');

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Inbox\b/ }).click();
  await expect(inboxButton).toHaveAttribute('aria-current', 'page');

  await page.goBack();
  await expect(roleButton).toHaveAttribute('aria-current', 'page');
  expect(await page.evaluate(() => location.hash)).toBe('#general/role-page');

  await page.goForward();
  await expect(inboxButton).toHaveAttribute('aria-current', 'page');
  expect(await page.evaluate(() => location.hash)).toBe('#general/inbox');
});
