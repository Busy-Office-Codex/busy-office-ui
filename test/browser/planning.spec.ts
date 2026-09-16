import { expect, test } from '@playwright/test';

// M7 Slice 3 (Production planning) — Chart's third real consumer (a demand-forecast bar chart)
// and the first screen in the chain the brief calls out: recommendation → planned order →
// production order → scheduling. See test/browser/production-orders.spec.ts for the next two hops.
async function gotoPlanning(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Planning\b/ }).click();
}

test('renders a real demand chart, not empty scaffolding', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoPlanning(page);

  // Chart.tsx's own render surface is the `chart-canvas` container it hands to ECharts, not the
  // `<canvas>` itself — ECharts creates and appends that element imperatively, so it never
  // carries `aria-hidden` directly; the container does (src/components/Chart.tsx).
  const surface = page.getByTestId('chart-canvas');
  await expect(surface).toHaveAttribute('aria-hidden', 'true');
  const canvas = surface.locator('canvas').first();
  await expect(canvas).toBeVisible();
  const hasColor = await canvas.evaluate((el) => {
    const canvasEl = el as HTMLCanvasElement;
    const ctx = canvasEl.getContext('2d');
    if (!ctx || canvasEl.width === 0) return false;
    const { data } = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a === 0) continue;
      if (b > 150 && b > r + 50 && b > g + 30) return true; // color.accent blue
    }
    return false;
  });
  expect(hasColor).toBe(true);
});

test('lists every seeded recommendation with its real material and suggested qty', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoPlanning(page);

  await expect(page.getByRole('row', { name: /REC-5001.*24-port managed network switch.*West Coast Hub.*20/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /REC-5002.*Cat6 network cable, 1000ft spool.*East Coast Hub.*25/ })).toBeVisible();
});

test('actioning a recommendation is a real state transition that creates a genuinely new planned order', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoPlanning(page);

  await page.getByRole('row', { name: /REC-5002/ }).click();
  await expect(page.getByRole('heading', { name: 'REC-5002', exact: true })).toBeVisible();
  await expect(page.getByText('No linked planned order yet.')).toBeVisible();

  await page.getByRole('button', { name: 'Create planned order' }).click();

  await expect(page.getByText(/^Linked: Planned order PLO-\d+$/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create planned order' })).toHaveCount(0);
  await expect(page.getByRole('row', { name: /REC-5002.*Actioned/ })).toBeVisible();
});

test('dismissing an open recommendation is a real transition and removes both actions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoPlanning(page);

  await page.getByRole('row', { name: /REC-5001/ }).click();
  await page.getByRole('button', { name: 'Dismiss' }).click();

  await expect(page.getByRole('row', { name: /REC-5001.*Dismissed/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create planned order' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Dismiss' })).toHaveCount(0);
});
