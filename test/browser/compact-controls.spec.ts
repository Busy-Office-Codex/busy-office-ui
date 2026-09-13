import { expect, test } from '@playwright/test';

// examples/ListReport.tsx (the preview's default route) uses size="compact" on its toolbar
// Button/Input and density="compact" on its Table. The command palette's own Close button and
// search Input are untouched, so they're the default-size comparison.
//
// ROADMAP item 10 (density tiers) changed these numbers: `size`/`density="compact"` are now
// per-instance overrides onto the shared `density` alias group (deprecated, see docs/Button.md,
// docs/Input.md, docs/Table.md), and the *default* ("comfortable") tier is not the same number
// the old hard-coded default was. Button's compact override moved from 32px to the compact
// tier's own controlHeight literal (28px); Button's default (ambient, comfortable) moved from
// 40px to 36px. Input's compact override is unchanged (36px — independently matched to the ERP
// reference, deliberately kept as-is rather than pulled onto the compact rowHeight tier, see
// docs/Input.md); Input's default (ambient, comfortable) moved from 44px to 40px (Input reads
// `rowHeight`, not `controlHeight` — see tokens.stylex.ts). Table's compact cell font-size moved
// from `font.sizeCaption` (12.5px, a metadata-only token as of this task) to the compact tier's
// own `fontSize` literal (13px, `font.sizeControl`).

test('Button size="compact" renders at the compact height, default stays 36px', async ({ page }) => {
  await page.goto('/#examples');

  const compactButton = page.getByRole('button', { name: 'From requisition', exact: true });
  await expect(compactButton).toHaveCSS('height', '28px');

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  const defaultButton = page.getByRole('button', { name: 'Close command palette', exact: true });
  await expect(defaultButton).toHaveCSS('height', '36px');
});

test('Input size="compact" renders at the compact height, default stays 40px', async ({ page }) => {
  await page.goto('/#examples');

  const compactInput = page.getByPlaceholder('Search POs…');
  await expect(compactInput).toHaveCSS('height', '36px');

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  const defaultInput = page.getByPlaceholder('Search records, run actions, jump to pages…');
  await expect(defaultInput).toHaveCSS('height', '40px');
});

test('Table density="compact" shrinks cell text off the body-size default', async ({ page }) => {
  await page.goto('/#examples');

  const cell = page.getByRole('cell', { name: 'PO-1042', exact: true });
  await expect(cell).toHaveCSS('font-size', '13px');
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
  //
  // Shell.tsx applies this borderRadius unconditionally (outside the active ? ... ternary), so
  // an inactive item's :hover background (variant="ghost") should carry the same radius.sm, not
  // a pill — but this preview's route registry (preview/client.tsx) gives every module exactly
  // one route, so stripRoutes never contains more than one item and no inactive nav button is
  // ever rendered to assert this against. Known, disclosed gap (see docs/Shell.md) — same
  // category as the app-strip cross-page limitation documented in sample-pages-navigation.spec.ts.
  await page.goto('/#examples');
  const active = page.getByRole('button', { name: 'Purchase orders', exact: true });
  await expect(active).toHaveCSS('border-radius', '6px');
});
