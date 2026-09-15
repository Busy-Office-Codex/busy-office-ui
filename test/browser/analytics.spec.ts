import { expect, test } from '@playwright/test';

// M7 Slice 5 (Analytics) — the brief's own named journey: "dashboard exception → filtered
// worklist → record details → relevant action". Reduced motion emulated for the same
// deterministic-chart-render reason test/browser/chart.spec.ts documents.
async function gotoAnalytics(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Analytics\b/ }).click();
}

test('renders a real chart of live counts, not empty scaffolding', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAnalytics(page);

  const canvas = page.locator('canvas');
  await expect(canvas).toHaveCount(1);
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

test('lists exceptions with real, live-computed counts from the shared store', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAnalytics(page);

  // Seed state: REQ-4001 pending_approval (1), INV-3201 sent (1), REC-5001/REC-5002 open (2).
  await expect(page.getByText('1 requisition awaiting approval')).toBeVisible();
  await expect(page.getByText('1 invoice awaiting payment')).toBeVisible();
  await expect(page.getByText('2 planning recommendations open')).toBeVisible();
});

test('the low-stock exception is backed by a real table of the actual low rows', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAnalytics(page);

  await expect(page.getByText(/\d+ materials? at or below 5 units available/)).toBeVisible();
  await expect(page.getByRole('row', { name: /Cat6 network cable, 1000ft spool.*East Coast Hub.*1/ })).toBeVisible();
});

test('opening an exception is a real, visible confirmation, and the target screen genuinely pre-selects that exact record', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAnalytics(page);

  const requisitionCard = page.getByRole('group', { name: '1 requisition awaiting approval' });
  await requisitionCard.getByRole('button', { name: 'Open' }).click();
  await expect(requisitionCard.getByRole('button', { name: 'Ready — open Requisitions' })).toBeVisible();

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Requisitions\b/ }).click();

  // REQ-4001 (the pending_approval one) is selected even though REQ-4002 sorts first in the
  // list — proof the focus genuinely overrode the screen's own default first-row selection.
  await expect(page.getByRole('heading', { name: 'REQ-4001', exact: true })).toBeVisible();
  await expect(page.getByRole('row', { name: /REQ-4002/ })).toBeVisible();
});
