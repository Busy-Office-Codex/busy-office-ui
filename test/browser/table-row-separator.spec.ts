import { expect, test } from '@playwright/test';

// ROADMAP item 12 (2026-09-14 design review, confirmed MEDIUM finding): `TableRow`'s
// `borderBottomColor` used to read `color.border` (#e2e8f0) — the exact same value as the
// table's own outer frame border (examples/ListReport.tsx's wrapping `role="region"` div), so
// body rows had no visual distinction from the frame. The new `color.borderSubtle` token
// (#f1f5f9, src/tokens.stylex.ts) is deliberately lighter, matching the reference
// (`templates/erp-skeleton/Table.dc.html`: frame #e2e8f0, row separators #f1f5f9). This asserts
// the new value directly, and that it differs from the frame's own border color, rather than
// just checking a value changed.

test('a body row separator uses the new borderSubtle token, lighter than the frame border', async ({ page }) => {
  await page.goto('/#examples');

  const row = page.getByRole('row', { name: /PO-1042/ });
  await expect(row).toHaveCSS('border-bottom-color', 'rgb(241, 245, 249)'); // color.borderSubtle

  const frame = page.getByRole('region', { name: 'Purchase orders table', exact: true });
  await expect(frame).toHaveCSS('border-color', 'rgb(226, 232, 240)'); // color.border — the frame itself, unchanged

  // The two must differ: rows are no longer indistinguishable from the frame around them.
  const rowBorder = await row.evaluate((el) => getComputedStyle(el).borderBottomColor);
  const frameBorder = await frame.evaluate((el) => getComputedStyle(el).borderColor);
  expect(rowBorder).not.toBe(frameBorder);
});
