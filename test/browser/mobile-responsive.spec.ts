import { expect, test } from '@playwright/test';

// Owner-directed follow-up (2026-09-15) to the M6 sample-page build: every detail/form page that
// used to cap its own width (a `maxWidth: 960-1200` outer wrapper, main pane + fixed-width side
// panel(s)) now goes full width and uses flexible (not fixed) column bases — `flex: '<growth> 1
// <basis>px'` with a `minWidth`/`maxWidth` per column — so a multi-column row reflows to a
// stacked single column with no `@media` query at all (see docs/design-conventions.md's "Page
// width and responsive layout"). That convention *should* mean these pages are mobile-safe; this
// test is the actual check that confirms it, rather than trusting the convention was followed
// correctly on every page. `ListReport.tsx`/`SalesOrderList.tsx`/`Customers.tsx` (table-heavy
// pages, already full width before this pass) are deliberately excluded — their own mobile-table
// treatment (horizontal scroll vs. a different layout) is a separate, unscoped problem.
const MOBILE_VIEWPORT = { width: 390, height: 844 };

// One entry per page reworked in this pass, by its command-palette page label (see
// `preview/client.tsx`'s `routes`).
const PAGE_LABELS = [
  'Sales order',
  'Dashboards',
  'Profile',
  'Overview',
  'General',
  'Role page',
  'Inbox',
  'Notifications',
  'Help',
  'Delivery',
  'Invoice',
  'Approvals',
  'Users and roles',
  'Forms',
  'Workflows',
  // M7 Slice 1 (Sales-to-billing) additions — same flexible-layout conventions, checked the same
  // way rather than assumed to inherit it.
  'Quotations',
  'Billing',
  // M7 Slice 2 (Procurement-to-stock).
  'Requisitions',
  'Inventory',
  // M7 Slice 3 (Production planning).
  'Planning',
  'Production orders',
  // M7 Slice 4 (Administration + role-based config).
  'Users',
  'Audit log',
  // M7 Slice 5 (Analytics).
  'Analytics',
  // M7 Slice 6 (Builder).
  'Pages',
  // M7 Slice 9 (Administration, role management).
  'Roles',
  // M7 Slice 12 (Administration — companies & entities, integrations & API).
  'Companies',
  'Integrations',
];

for (const label of PAGE_LABELS) {
  test(`"${label}" has no horizontal overflow at a 390px mobile viewport`, async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#examples');

    // Same direct palette-button click `test/browser/sample-pages-navigation.spec.ts` uses — no
    // query typing needed, every page label is already visible and unique with no filter applied.
    // A page command's accessible name is `label + hint` (Shell.tsx renders them as two Text
    // nodes inside one button — see its `command.hint` line), and every hint is the route's
    // Capitalized module name — so requiring whitespace then a capital right after `label` finds
    // the real command even when `label` is itself a prefix of another page's label (e.g. 'Users'
    // is a prefix of 'Users and roles', but only 'Users Administration' — not 'Users and roles
    // Administration' — matches `\s+[A-Z]` immediately after 'Users').
    const dialog = page.getByRole('dialog', { name: 'Command palette' });
    await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
    await dialog.getByRole('button', { name: new RegExp(`^${label}\\s+[A-Z]`) }).click();
    await expect(dialog).toBeHidden();

    const overflow = await page.evaluate(() => {
      const el = document.scrollingElement!;
      return el.scrollWidth - el.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
