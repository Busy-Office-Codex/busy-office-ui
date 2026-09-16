import { expect, test, type Page } from '@playwright/test';

// ROADMAP item 37, issue #20 (agreed, project owner, 2026-09-16): a `breadcrumbs` prop on Shell
// (`@busyoffice/design-system/shell`) — an ordered `{ label, onClick? }[]` rendered in the chrome
// above the content area, no route-hierarchy inference, no per-crumb dropdown, no truncation/
// overflow menu (v1 scope). Deliberately its own file, per this issue's own instruction, rather
// than an addition to the existing shell-chrome-color/shell-focus/shell-scroll-chrome specs.
//
// Three things are covered here:
// 1. Shell's own `breadcrumbs` prop, exercised directly via the dedicated `#shell-breadcrumbs-lab`
//    harness (preview/ShellBreadcrumbsLab.tsx) — neither example consumer below owns a real
//    `Shell` instance to pass the prop into (see examples/breadcrumbTrail.tsx's own header
//    comment for why), so the harness is what actually renders `Shell.tsx`'s own
//    `ShellBreadcrumbTrail` function in a real browser.
// 2. RecordDetail.tsx, one of the feature's two named real consumers.
// 3. Requisitions.tsx, the other.

test.describe('Shell.breadcrumbs prop', () => {
  test('renders the ordered trail as a WAI-ARIA breadcrumb nav; the last crumb is "here", never a control', async ({ page }) => {
    await page.goto('/#shell-breadcrumbs-lab');
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('listitem')).toHaveCount(2);

    await expect(page.getByRole('button', { name: 'Sales orders', exact: true })).toBeVisible();

    const here = nav.getByText('SO-1042', { exact: true });
    await expect(here).toHaveAttribute('aria-current', 'page');
    // "here" never renders as an interactive control, regardless of the data it's given (the lab
    // harness passes it with no `onClick`, matching Shell's own type comment: the last entry is
    // always "here").
    await expect(page.getByRole('button', { name: 'SO-1042', exact: true })).toHaveCount(0);
  });

  test('a crumb with onClick is a real, working control, not decoration', async ({ page }) => {
    await page.goto('/#shell-breadcrumbs-lab');
    await expect(page.getByText('Clicks: 0', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Sales orders', exact: true }).click();

    await expect(page.getByText('Clicks: 1', { exact: true })).toBeVisible();
  });

  test('omitting breadcrumbs renders no breadcrumb nav at all — opt-in, no route-hierarchy inference', async ({ page }) => {
    await page.goto('/#examples');
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0);
  });

  test('the trail is per-route page content, not persistent chrome — it disappears behind the launcher with the rest of the page', async ({ page }) => {
    await page.goto('/#shell-breadcrumbs-lab');
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();

    await page.getByRole('button', { name: 'Open launcher', exact: true }).click();

    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0);
  });
});

async function gotoRecordDetail(page: Page) {
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Sales order\b/ }).click();
}

test.describe('RecordDetail.tsx real consumer (issue #20)', () => {
  test('shows the trail back to Sales orders, honestly non-interactive since this page has no navigate callback of its own', async ({ page }) => {
    await gotoRecordDetail(page);

    const nav = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(nav).toBeVisible();
    await expect(nav.getByText('Sales orders', { exact: true })).toBeVisible();
    // No fake affordance: RecordDetail is a route-agnostic content pane (preview/client.tsx's
    // `panes` map, same constraint examples/Analytics.tsx's own header comment documents) with no
    // real destination a click on "Sales orders" could reach.
    await expect(nav.getByRole('button')).toHaveCount(0);

    const here = nav.getByText('SO-1042', { exact: true });
    await expect(here).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { name: 'SO-1042 · Northwind Traders' })).toBeVisible();
  });
});

async function gotoRequisitions(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Requisitions\b/ }).click();
}

test.describe('Requisitions.tsx real consumer (issue #20)', () => {
  test('has no trail before conversion, then a real Requisitions > REQ-4001 > PO-<id> trail once approved', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoRequisitions(page);
    await page.getByRole('row', { name: /REQ-4001/ }).click();

    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Approve — create purchase order' }).click();

    const nav = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(nav).toBeVisible();
    await expect(nav.getByText('Requisitions', { exact: true })).toBeVisible();
    await expect(nav.getByText('REQ-4001', { exact: true })).toBeVisible();

    // A real, freshly-created purchase order id — not a canned placeholder.
    const poCrumb = nav.getByText(/^PO-\d+$/);
    await expect(poCrumb).toBeVisible();
    await expect(poCrumb).toHaveAttribute('aria-current', 'page');

    // No real destination exists for "Requisitions" or "REQ-4001" on this single-route
    // list+detail page (see examples/Requisitions.tsx's own comment) — every crumb is plain text.
    await expect(nav.getByRole('button')).toHaveCount(0);
  });
});
