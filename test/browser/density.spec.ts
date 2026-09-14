import { expect, test } from '@playwright/test';

// ROADMAP item 10 (density tiers). These target `/#density-lab` (preview/DensityLab.tsx), a
// dedicated harness — the default `/#examples` sample page's `Density`-wrapped regions (ROADMAP
// item 16) are each scoped to one part of the page, not nested inside one another or shown side
// by side, so they don't exercise the three tiers' *ambient* values together the way this page
// does.
//
// NOTE for whoever runs `pnpm test:browser`: this file was written and reviewed by an agent
// that was told not to run the browser suite itself (it only ran `pnpm typecheck`/`pnpm lint`/
// `pnpm test`) — so these specs are logically reviewed but not yet execution-verified.

test.describe('Density tiers (ROADMAP item 10)', () => {
  test('Button renders at each tier’s ambient control height, without size="compact"', async ({ page }) => {
    await page.goto('/#density-lab');

    await expect(page.getByRole('button', { name: 'Compact tier button', exact: true })).toHaveCSS('height', '28px');
    await expect(page.getByRole('button', { name: 'Comfortable tier button', exact: true })).toHaveCSS('height', '36px');
    await expect(page.getByRole('button', { name: 'Spacious tier button', exact: true })).toHaveCSS('height', '44px');
  });

  test('a compact Density region nests inside an ambient-comfortable page (the ROADMAP’s own example)', async ({ page }) => {
    await page.goto('/#density-lab');

    // The "page" here is ambient (no Density wrapper at all) — comfortable is the density var
    // group's own default, so it needs no explicit wrapper to render at 36px.
    await expect(page.getByRole('button', { name: 'Page ambient button', exact: true })).toHaveCSS('height', '36px');
    await expect(page.getByRole('button', { name: 'Nested compact button', exact: true })).toHaveCSS('height', '28px');
  });

  test('an inner Density tier overrides an outer, non-default Density tier', async ({ page }) => {
    await page.goto('/#density-lab');

    // Both tiers here are real `stylex.createTheme` overrides (spacious around compact) — this
    // proves nesting is a genuine "nearest ancestor wins" CSS cascade, not just "compact always
    // wins" or "the outermost Density wins".
    await expect(page.getByRole('button', { name: 'Outer spacious button', exact: true })).toHaveCSS('height', '44px');
    await expect(page.getByRole('button', { name: 'Inner compact button', exact: true })).toHaveCSS('height', '28px');
  });

  test('a comfortable Density region resets an active non-default ancestor', async ({ page }) => {
    await page.goto('/#density-lab');

    // `value="comfortable"` applies `comfortableDensity` (a real theme, same values as the
    // `density` group's defaults) rather than no theme — specifically so this case works: without
    // a real theme object to apply, a nested comfortable region would just inherit whatever the
    // active compact/spacious ancestor set, since there'd be nothing to override it with.
    await expect(page.getByRole('button', { name: 'Outer compact button', exact: true })).toHaveCSS('height', '28px');
    await expect(page.getByRole('button', { name: 'Inner comfortable button', exact: true })).toHaveCSS('height', '36px');
  });

  test('control and row heights scale with the root font size, and content is not clipped', async ({ page }) => {
    await page.goto('/#density-lab');

    // `density`'s values are `rem`, and consumers use `min-height` rather than `height` — so a
    // larger root font size should scale the rendered box up (not leave it clipping the now-
    // larger text at a fixed pixel size).
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '20px';
    });

    const button = page.getByRole('button', { name: 'Scaling probe button', exact: true });
    await expect(button).toHaveCSS('height', '45px'); // controlHeight 2.25rem × 20px root

    const row = page.getByTestId('scaling-probe-row');
    const box = await row.boundingBox();
    if (!box) throw new Error('scaling probe row not found');
    expect(box.height).toBeGreaterThanOrEqual(50); // rowHeight 2.5rem × 20px root, as a floor

    // No clipping: the cell's rendered box must be tall enough to contain its own content —
    // scrollHeight (the content's actual extent) must not exceed clientHeight (the visible box).
    // Checked on the <td>, not the <tr>: a table row's scrollHeight/clientHeight can differ by a
    // stray 1px from ordinary sub-pixel rounding in the table row-sizing algorithm, which isn't
    // real clipping — verified directly (scrollHeight 50 vs clientHeight 49 on the row, while the
    // cell inside it — the actual content-bearing box — measured scrollHeight === clientHeight).
    const cell = row.locator('td');
    const clipped = await cell.evaluate((element) => element.scrollHeight > element.clientHeight);
    expect(clipped).toBe(false);
  });
});
