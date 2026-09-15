import { expect, test } from '@playwright/test';

// M7 Slice 2 — Chart's second real consumer (issue #16's own literal named scenario for this
// screen: a "stock by warehouse" bar chart). Reduced motion emulated throughout for the same
// deterministic-render reason test/browser/chart.spec.ts documents.
async function gotoInventory(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Inventory\b/ }).click();
}

test('renders two real charts (bar + donut), not empty scaffolding', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoInventory(page);

  const canvases = page.locator('canvas');
  await expect(canvases).toHaveCount(2);
  for (const canvas of await canvases.all()) {
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
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
  }
});

test('the donut legend shows full, unclipped labels — a real regression check for a bug found live', async ({ page }) => {
  // Chart.tsx originally used a `right` legend for donut charts, which allocated a fixed-width
  // column that clipped this exact screen's "Switches" label even in a 300px-wide container —
  // fixed by moving to a `bottom` legend in the shared component (not a per-screen workaround).
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoInventory(page);

  await expect(page.getByText('Paper', { exact: true })).toBeVisible();
  await expect(page.getByText('Cable', { exact: true })).toBeVisible();
  await expect(page.getByText('Switches', { exact: true })).toBeVisible();
});

test('lists real stock-by-location rows with on-hand/reserved/available quantities', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoInventory(page);

  await expect(page.getByRole('row', { name: /500-sheet letterhead paper, ream.*Main DC.*340 ream.*40 ream.*300 ream/ })).toBeVisible();
});

test('receiving goods in Requisitions is reflected here — a genuinely connected journey, not two isolated screens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Requisitions\b/ }).click();
  await page.getByRole('row', { name: /REQ-4001/ }).click();
  await page.getByRole('button', { name: 'Approve — create purchase order' }).click();
  await page.getByRole('button', { name: /Receive goods — update stock/ }).click();

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Inventory\b/ }).click();

  // 120 reams received at Main DC on top of the seeded 340 — the same store, read by a different
  // screen, after an action taken on a third (Requisitions).
  await expect(page.getByRole('row', { name: /500-sheet letterhead paper, ream.*Main DC.*460 ream/ })).toBeVisible();
  // The "Type" cell's text content is the raw lowercase value ("receipt") — `textTransform:
  // capitalize` in Requisitions.tsx/Inventory.tsx is a purely visual CSS transform, not a DOM
  // text change, so the accessible row name (what `getByRole` matches against) stays lowercase.
  await expect(page.getByRole('row', { name: /receipt.*\+120.*PO-\d+/ })).toBeVisible();
});
