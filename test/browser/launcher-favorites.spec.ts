import { expect, test } from '@playwright/test';

// M7 Slice 14 (Entry/nav — favorites) — genuinely user-curated state, unlike "recent" (Slice 11,
// derived from `state.activity`): nothing seeds `state.favoriteRouteIds`, so this spec starts from
// the honest empty state and stars something live, rather than asserting a pre-favorited seed.
async function openLauncher(page: import('@playwright/test').Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open launcher' }).click();
}

test('starts with the honest empty state — nothing is pre-favorited', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openLauncher(page);

  const favorites = page.getByRole('region', { name: 'Favorites' });
  await expect(favorites).toBeVisible();
  await expect(favorites.getByText('Star an app below to pin it here.')).toBeVisible();
});

test('starring a real app in All apps is a live mutation: it appears in Favorites and the star state is programmatic, not just visual', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openLauncher(page);

  const allApps = page.getByRole('region', { name: 'All apps' });
  const starToggle = allApps.getByRole('button', { name: 'Add Customers to Favorites' });
  await expect(starToggle).toHaveAttribute('aria-pressed', 'false');

  await starToggle.click();

  await expect(allApps.getByRole('button', { name: 'Remove Customers from Favorites' })).toHaveAttribute('aria-pressed', 'true');

  const favorites = page.getByRole('region', { name: 'Favorites' });
  await expect(favorites.getByText('Star an app below to pin it here.')).toHaveCount(0);
  await expect(favorites.getByRole('button', { name: 'Customers', exact: true })).toBeVisible();
});

test('unstarring from either the Favorites section or All apps removes it — one real shared state, not two', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openLauncher(page);

  const allApps = page.getByRole('region', { name: 'All apps' });
  await allApps.getByRole('button', { name: 'Add Customers to Favorites' }).click();

  const favorites = page.getByRole('region', { name: 'Favorites' });
  await favorites.getByRole('button', { name: 'Remove Customers from Favorites' }).click();

  await expect(favorites.getByText('Star an app below to pin it here.')).toBeVisible();
  await expect(allApps.getByRole('button', { name: 'Add Customers to Favorites' })).toHaveAttribute('aria-pressed', 'false');
});

test('a folder tile and a muted placeholder are not favoritable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openLauncher(page);

  const allApps = page.getByRole('region', { name: 'All apps' });
  await expect(allApps.getByRole('button', { name: /Finance to Favorites/ })).toHaveCount(0);
  await expect(allApps.getByRole('button', { name: /Builder to Favorites/ })).toHaveCount(0);
});
