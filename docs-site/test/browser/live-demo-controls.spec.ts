import { expect, test } from '@playwright/test';

// M10 (issue #24): every component specimen used to render exactly one static state — this is
// docs-site's first real interactive browser test, proving the new theme/density toggle
// (docs-site/src/components/LiveDemo.tsx) actually changes what's rendered, not just that the
// controls exist. Real, measured before/after values (computed style, bounding-rect height), not
// a snapshot — the same "prove it, don't assume it" bar the root package's own tests use.

test('the theme toggle changes the specimen\'s real rendered background color', async ({ page }) => {
  await page.goto('/components/input/');
  const input = page.locator('.live-demo input').first();

  const before = await input.evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.getByRole('radio', { name: 'Dark' }).click();
  const afterDark = await input.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(afterDark).not.toBe(before);

  // And back to Light differs from Dark again — proves this is a real toggle, not a one-way
  // CSS class that happened to change once.
  await page.getByRole('radio', { name: 'Light' }).click();
  const afterLight = await input.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(afterLight).not.toBe(afterDark);
});

test('the density toggle changes the specimen\'s real rendered size', async ({ page }) => {
  await page.goto('/components/input/');
  const input = page.locator('.live-demo input').first();

  // Comfortable is the default — docs/Input.md's own documented height for it is 40px.
  await expect.poll(() => input.evaluate((el) => el.getBoundingClientRect().height)).toBe(40);

  await page.getByRole('radio', { name: 'Compact' }).click();
  await expect.poll(() => input.evaluate((el) => el.getBoundingClientRect().height)).toBe(32);

  await page.getByRole('radio', { name: 'Spacious' }).click();
  await expect.poll(() => input.evaluate((el) => el.getBoundingClientRect().height)).toBe(48);
});

test('"System" (the default) genuinely follows the OS color scheme, not a fixed light default', async ({ page }) => {
  // Theme.tsx's own contract: "System" applies no explicit Theme wrapper at all, so the demo
  // should render using whatever the OS/browser's own prefers-color-scheme is - proven here by
  // emulating dark BEFORE navigating (so "System" is what's on screen at first paint, no click
  // involved) and confirming it matches what explicitly clicking "Dark" produces separately.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/components/input/');
  await expect(page.getByRole('radio', { name: 'System', checked: true })).toBeVisible();
  const input = page.locator('.live-demo input').first();
  const systemUnderOsDark = await input.evaluate((el) => getComputedStyle(el).backgroundColor);

  await page.getByRole('radio', { name: 'Dark' }).click();
  const explicitDark = await input.evaluate((el) => getComputedStyle(el).backgroundColor);

  expect(systemUnderOsDark).toBe(explicitDark);
});

test('the toggle controls are present and this shared fix works on a second, unrelated component page too', async ({ page }) => {
  await page.goto('/components/button/');
  await expect(page.getByTestId('live-demo-controls')).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'Theme' })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'Density' })).toBeVisible();

  const button = page.locator('.live-demo button').first();
  const before = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.getByRole('radio', { name: 'Dark' }).click();
  const after = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(after).not.toBe(before);
});
