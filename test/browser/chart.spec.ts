import { expect, test } from '@playwright/test';

// Dashboard.tsx's "Revenue trend" card is Chart's first real consumer (ROADMAP issue #16) — no
// synthetic harness, per this repo's established "test through the real consumer" precedent
// (Density, ButtonGroup). Reached via the command palette, same as every other route.
//
// Every test here emulates `prefers-reduced-motion: reduce` before navigating — found live, not
// assumed necessary: Chart.js's default draw-in animation takes ~1s, so a pixel check run right
// after navigation (Playwright's own auto-waiting only waits for the canvas element to exist and
// be visible, not for its 2D bitmap to finish an in-progress animation) caught the chart mid-
// animation, with the line barely started — a real screenshot at that same moment showed
// perfectly-rendered axes/grid and a fully invisible data line. Reduced-motion isn't a test
// workaround bolted on after the fact — Chart.tsx already disables animation under this exact
// media query (matching every other animated thing in this package), so asserting against it
// gives a deterministic final render AND is itself real coverage of that documented behavior.
async function gotoDashboard(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Dashboards\b/ }).click();
}

async function countAccentPixels(canvas: import('@playwright/test').Locator): Promise<number> {
  return canvas.evaluate((el) => {
    const canvasEl = el as HTMLCanvasElement;
    const ctx = canvasEl.getContext('2d');
    if (!ctx || canvasEl.width === 0 || canvasEl.height === 0) return 0;
    const { data } = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    let count = 0;
    // color.accent (#0057b8) — the line's real stroke/point color, not just "any" non-transparent
    // pixel (grid lines and axis labels are ALSO non-transparent, so that weaker check cannot
    // distinguish "the chart drew nothing but scaffolding" from "the chart drew everything").
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a === 0) continue;
      if (b > 150 && b > r + 50 && b > g + 30) count++;
    }
    return count;
  });
}

test('draws the actual data — the line itself, not just axes and grid scaffolding', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDashboard(page);

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('aria-hidden', 'true');

  // A 440x220 canvas with only grid/axis scaffolding (no line) has zero accent-colored pixels —
  // confirmed live by catching exactly that broken-looking state (an animation-timing artifact,
  // not a real bug, but it proved this assertion actually distinguishes the two cases).
  expect(await countAccentPixels(canvas)).toBeGreaterThan(200);
});

test('without a reduced-motion preference, the chart still finishes drawing the real data (just animated in)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  // Deliberately no emulateMedia call here — this is the default-preference path every user
  // without "reduce motion" set actually gets.
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Dashboards\b/ }).click();

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  // Chart.js's default draw-in animation is ~1s; wait past it rather than asserting mid-animation.
  await page.waitForTimeout(1200);
  expect(await countAccentPixels(canvas)).toBeGreaterThan(200);
});

test('the canvas is not the accessible content — a real data table stands in for it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDashboard(page);

  // getByRole intentionally excludes aria-hidden subtrees, so this finding the table at all is
  // itself proof the canvas (aria-hidden) is correctly out of the accessibility tree while the
  // table stands in for it.
  const table = page.getByRole('table', { name: 'Revenue trend, last 6 months' });
  await expect(table).toBeAttached();
  await expect(table.getByRole('columnheader', { name: 'Category' })).toBeAttached();
  await expect(table.getByRole('cell', { name: 'Sep' })).toBeAttached();
  await expect(table.getByRole('cell', { name: '$486,000' })).toBeAttached();

  // Visually hidden, not merely present — a sighted user should never see a duplicate table
  // floating next to the chart. Two things to check, not one: Playwright's own toBeHidden()
  // doesn't recognize the standard visually-hidden technique (1x1px wrapper + clipped overflow,
  // not display:none) as hidden — it has real geometry, just geometry too small to see. And the
  // table's OWN boundingBox() reports its natural, unclipped content width regardless of the
  // wrapper's overflow:hidden (ancestor clipping changes what's painted, not a descendant's own
  // computed layout box — the same getBoundingClientRect()-doesn't-reflect-clipping gotcha this
  // repo's Control Center popover ran into). So check the WRAPPER's own box, not the table's.
  const wrapperBox = await table.locator('..').evaluate((el) => el.getBoundingClientRect());
  expect(wrapperBox.width).toBeLessThanOrEqual(1);
  expect(wrapperBox.height).toBeLessThanOrEqual(1);
});

test('agrees with the REVENUE THIS MONTH stat card instead of inventing its own number', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDashboard(page);

  await expect(page.getByText('$486K')).toBeVisible();
  await expect(page.getByText('+6.4% vs last month')).toBeVisible();
  await expect(page.getByRole('cell', { name: '$486,000' })).toBeAttached();
});
