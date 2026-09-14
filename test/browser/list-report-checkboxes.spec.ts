import { expect, test } from '@playwright/test';

// ROADMAP item 12 (2026-09-14 design review, confirmed LOW finding): examples/ListReport.tsx's
// checkbox column used bare native `<input type="checkbox">` — unstyled, browser-default
// appearance (13x13px, square corners, UA accent color). The reference
// (`templates/erp-skeleton/Table.dc.html`) draws them at 16x16, radius 4, `border #cbd5e1`
// (`color.borderStrong`). Styled in the example only (a scoped `stylex.create` block, same
// precedent as examples/AppShell.tsx's notification button) — no new `Checkbox` export, since
// this file is still the only consumer (this repo's Objective 2 "Proven Reuse" test).

test('the "select all" checkbox renders at 16x16, radius 4, with the borderStrong border color', async ({ page }) => {
  await page.goto('/#examples');

  const checkbox = page.getByRole('checkbox', { name: 'Select all rows', exact: true });
  await expect(checkbox).toHaveCSS('width', '16px');
  await expect(checkbox).toHaveCSS('height', '16px');
  await expect(checkbox).toHaveCSS('border-radius', '4px');
  await expect(checkbox).toHaveCSS('border-color', 'rgb(203, 213, 225)'); // color.borderStrong
  await expect(checkbox).toHaveCSS('border-width', '1px');
  await expect(checkbox).toHaveCSS('border-style', 'solid');
});

test('a per-row selection checkbox renders at 16x16, radius 4, with the borderStrong border color', async ({ page }) => {
  await page.goto('/#examples');

  const checkbox = page.getByRole('checkbox', { name: 'Select PO-1042', exact: true });
  await expect(checkbox).toHaveCSS('width', '16px');
  await expect(checkbox).toHaveCSS('height', '16px');
  await expect(checkbox).toHaveCSS('border-radius', '4px');
  await expect(checkbox).toHaveCSS('border-color', 'rgb(203, 213, 225)'); // color.borderStrong
});

test('a checked checkbox fills solid, since appearance:none (required for the 4px radius) also discards the native tick', async ({ page }) => {
  await page.goto('/#examples');

  const checkbox = page.getByRole('checkbox', { name: 'Select PO-1042', exact: true });
  await expect(checkbox).toHaveCSS('background-color', 'rgb(255, 255, 255)'); // color.bgSurface, unchecked
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  await expect(checkbox).toHaveCSS('background-color', 'rgb(15, 23, 42)'); // color.action, checked
  await expect(checkbox).toHaveCSS('border-color', 'rgb(15, 23, 42)');
});

test('the checkbox is still keyboard-toggleable — appearance:none only repaints it, native activation is untouched', async ({ page }) => {
  await page.goto('/#examples');

  const checkbox = page.getByRole('checkbox', { name: 'Select PO-1042', exact: true });
  await checkbox.focus();
  await expect(checkbox).not.toBeChecked();
  await page.keyboard.press('Space');
  await expect(checkbox).toBeChecked();
  await page.keyboard.press('Space');
  await expect(checkbox).not.toBeChecked();
});

test('a row-selection checkbox shows the shared focus-visible ring', async ({ page }) => {
  await page.goto('/#examples');

  const checkbox = page.getByRole('checkbox', { name: 'Select PO-1042', exact: true });
  await expect(checkbox).toHaveCSS('outline-width', '0px');
  await checkbox.focus();
  await expect(checkbox).toHaveCSS('outline-width', '2px');
  await expect(checkbox).toHaveCSS('outline-style', 'solid');
  await expect(checkbox).toHaveCSS('outline-color', 'rgb(0, 87, 184)'); // color.focusRing
  await expect(checkbox).toHaveCSS('outline-offset', '2px');
});
