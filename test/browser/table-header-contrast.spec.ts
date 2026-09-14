import { expect, test } from '@playwright/test';

// ROADMAP item 12 (2026-09-14 design review, confirmed HIGH finding): the header row's old
// pairing — `color.textTertiary` (#64748b) text on `color.bgSubtle` (#f1f5f9) background —
// measured 4.34:1, failing WCAG AA's 4.5:1 body-text threshold (11px/600/uppercase does not
// qualify for the "large text" 3:1 exemption). The corrected pairing — `color.textSecondary`
// (#475569) on `color.bgCanvas` (#f8fafc) — measures ~7.24:1 (WCAG relative-luminance formula:
// L(#475569) ≈ 0.0886, L(#f8fafc) ≈ 0.9536, contrast = (0.9536+.05)/(0.0886+.05) ≈ 7.24). This
// asserts the actual computed values, not just that the numbers changed.
// examples/ListReport.tsx is the preview's default route (docs/ListReport.md), so no extra
// navigation beyond `/#examples` is needed to reach the header.

test('the table head background is color.bgCanvas, not the old color.bgSubtle', async ({ page }) => {
  await page.goto('/#examples');

  const head = page.locator('thead');
  await expect(head).toHaveCSS('background-color', 'rgb(248, 250, 252)'); // color.bgCanvas
});

test('a header cell reads color.textSecondary, not the old color.textTertiary', async ({ page }) => {
  await page.goto('/#examples');

  const headerCell = page.getByRole('columnheader', { name: 'PO #', exact: true });
  await expect(headerCell).toHaveCSS('color', 'rgb(71, 85, 105)'); // color.textSecondary
});

test('a header cell renders at the corrected size/tracking (12.5px sizeCaption, .04em, uppercase, semibold)', async ({ page }) => {
  await page.goto('/#examples');

  const headerCell = page.getByRole('columnheader', { name: 'PO #', exact: true });
  await expect(headerCell).toHaveCSS('font-size', '12.5px'); // font.sizeCaption, not the old 11px sizeOverline
  await expect(headerCell).toHaveCSS('letter-spacing', '0.5px'); // 0.04em resolved against this cell's own 12.5px font-size (12.5 * 0.04 = 0.5)
  await expect(headerCell).toHaveCSS('text-transform', 'uppercase');
  await expect(headerCell).toHaveCSS('font-weight', '600');
});
