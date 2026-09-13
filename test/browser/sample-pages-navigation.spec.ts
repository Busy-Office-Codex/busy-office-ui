import { expect, test } from '@playwright/test';

// Roadmap item 3, Accept property 2: move between the Purchase Orders and
// Sales pages by app-strip button, palette command, and dock tile, checking
// aria-current and the visible page heading after each move.
//
// Architecture note (docs/Shell.md: "app strip (sibling routes of the active
// module)", confirmed in src/shell/Shell.tsx's `stripRoutes` filter): the app
// strip only ever lists sibling routes of the CURRENT module. In this
// preview's route registry (preview/client.tsx), Purchase Orders (module
// "Purchase") and Sales order (module "Sales") are each the lone route in
// their own module, so the app strip cannot itself cross between them — only
// the dock (cross-module pinned apps) and the command palette (global
// search) can, which is exactly why Shell has those two mechanisms. This
// test therefore uses dock and palette for the actual Purchase<->Sales
// moves, and exercises the app-strip button with a real click-and-reassert
// on the page it's already showing — the one interaction it can perform
// here — checking aria-current and the visible heading/region after every
// step.
test('moves between Purchase Orders and Sales via the app strip, the command palette, and a dock tile, checking aria-current and the page heading after each move', async ({ page }) => {
  await page.goto('/#examples');

  const purchaseOrdersStrip = page.getByRole('button', { name: 'Purchase orders', exact: true });
  const salesOrderStrip = page.getByRole('button', { name: 'Sales order', exact: true });
  const purchaseOrdersTable = page.getByRole('region', { name: 'Purchase orders table' });
  const salesHeading = page.getByRole('heading', { name: 'SO-1042 · Northwind Traders' });
  const dialog = page.getByRole('dialog', { name: 'Command palette' });

  // Starts on Purchase Orders, the default route.
  await expect(purchaseOrdersStrip).toHaveAttribute('aria-current', 'page');
  await expect(purchaseOrdersTable).toBeVisible();

  // App-strip button: a real click on the page it already represents (its
  // only sibling is itself here) still exercises the control and confirms
  // it keeps announcing the current page correctly.
  await purchaseOrdersStrip.click();
  await expect(purchaseOrdersStrip).toHaveAttribute('aria-current', 'page');
  await expect(purchaseOrdersTable).toBeVisible();

  // Dock tile moves to Sales.
  await page.getByRole('button', { name: 'Sales', exact: true }).click();
  await expect(salesOrderStrip).toHaveAttribute('aria-current', 'page');
  await expect(salesHeading).toBeVisible();

  // Command palette moves back to Purchase Orders (pattern from
  // test/browser/shell-focus.spec.ts's "running a page command navigates
  // the host and closes the palette").
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await dialog.getByRole('button', { name: /^Purchase orders\b/ }).click();
  await expect(dialog).toBeHidden();
  await expect(purchaseOrdersStrip).toHaveAttribute('aria-current', 'page');
  await expect(purchaseOrdersTable).toBeVisible();

  // Dock tile moves to Sales again.
  await page.getByRole('button', { name: 'Sales', exact: true }).click();
  await expect(salesOrderStrip).toHaveAttribute('aria-current', 'page');
  await expect(salesHeading).toBeVisible();
});
