import { expect, test } from '@playwright/test';

// examples/ListReport.tsx (the preview's default route) uses size="compact" on its toolbar
// Button/Input and density="compact" on its Table. The command palette's own Close button and
// search Input are untouched, so they're the default-size comparison.

test('Button size="compact" renders at the compact height, default stays 40px', async ({ page }) => {
  await page.goto('/#examples');

  const compactButton = page.getByRole('button', { name: 'From requisition', exact: true });
  await expect(compactButton).toHaveCSS('height', '32px');

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  const defaultButton = page.getByRole('button', { name: 'Close command palette', exact: true });
  await expect(defaultButton).toHaveCSS('height', '40px');
});

test('Input size="compact" renders at the compact height, default stays 44px', async ({ page }) => {
  await page.goto('/#examples');

  const compactInput = page.getByPlaceholder('Search POs…');
  await expect(compactInput).toHaveCSS('height', '36px');

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  const defaultInput = page.getByPlaceholder('Search records, run actions, jump to pages…');
  await expect(defaultInput).toHaveCSS('height', '44px');
});

test('Table density="compact" shrinks cell text off the body-size default', async ({ page }) => {
  await page.goto('/#examples');

  const cell = page.getByRole('cell', { name: 'PO-1042', exact: true });
  await expect(cell).toHaveCSS('font-size', '12.5px');
});

test('the active app-strip nav item is bold, since its background can otherwise collide with an inactive item on hover', async ({ page }) => {
  await page.goto('/#examples');

  // Active (variant="secondary", resting bg color.bgSubtle) and inactive-on-hover (variant="ghost",
  // :hover bg is also color.bgSubtle) resolve to the same background — font-weight is the only
  // remaining differentiator, so it must actually be set on the active item.
  const active = page.getByRole('button', { name: 'Purchase orders', exact: true });
  await expect(active).toHaveAttribute('aria-current', 'page');
  await expect(active).toHaveCSS('font-weight', '600');
});

test('the active app-strip nav item is a rounded-rect highlight, not a capsule', async ({ page }) => {
  // docs/design-conventions.md's capsule-vs-rectangle rule: a highlight behind existing nav
  // content (this) gets radius.sm, like Dropdown's own highlighted menu item — never
  // radius.pill, which Button would otherwise apply by default. Matches
  // templates/erp-skeleton/Shell.dc.html's active nav-tab exactly (border-radius:6px).
  await page.goto('/#examples');
  const active = page.getByRole('button', { name: 'Purchase orders', exact: true });
  await expect(active).toHaveCSS('border-radius', '6px');
});
