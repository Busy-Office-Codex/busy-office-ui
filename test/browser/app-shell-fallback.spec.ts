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
