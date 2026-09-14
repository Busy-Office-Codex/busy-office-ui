import { expect, test } from '@playwright/test';

// ROADMAP item 12 (2026-09-14 design review, confirmed MEDIUM finding): Chip's `status` variant
// with `tone="danger"` rendered at 26px instead of the uniform 24px every other tone renders at,
// because its 1px border (the danger tone's outlined look) used the browser's default
// `box-sizing: content-box`, which ADDS the border to the declared height instead of including
// it. Fixed in src/components/Chip.tsx by adding `boxSizing: 'border-box'` to `statusBase`. This
// proves the fix at the row level — not just the Chip in isolation — by comparing a
// non-danger-tone row (PO-1042, tone "accent") against a danger-tone row (PO-1038, "Overdue",
// examples/ListReport.tsx's sample data) in the real Purchase-orders table, rather than just
// asserting one row's absolute height.

test('a danger-tone status row renders at the same height as a non-danger row', async ({ page }) => {
  await page.goto('/#examples');

  const nonDangerRow = page.getByRole('row', { name: /PO-1042/ }); // tone "accent", "Awaiting approval"
  const dangerRow = page.getByRole('row', { name: /PO-1038/ }); // tone "danger", "Overdue"

  await expect(page.getByRole('cell', { name: 'Overdue', exact: true }).first()).toBeVisible();

  const nonDangerBox = await nonDangerRow.boundingBox();
  const dangerBox = await dangerRow.boundingBox();
  if (!nonDangerBox || !dangerBox) throw new Error('Expected both rows to be visible with a bounding box');

  expect(dangerBox.height).toBe(nonDangerBox.height);
});

test('every visible body row in the sample table renders at the same height', async ({ page }) => {
  await page.goto('/#examples');

  const rows = page.locator('tbody tr');
  const count = await rows.count();
  expect(count).toBeGreaterThan(1);

  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    const box = await rows.nth(i).boundingBox();
    if (!box) throw new Error(`Row ${i} has no bounding box`);
    heights.push(box.height);
  }

  const distinctHeights = new Set(heights.map((h) => Math.round(h)));
  expect(distinctHeights.size).toBe(1);
});
