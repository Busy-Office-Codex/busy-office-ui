import { expect, test } from '@playwright/test';

// ROADMAP item 14 (2026-09-14 design review, "Page composition on the reference frame"), the
// last item in milestone M3. Confirmed findings, all against `templates/erp-skeleton/
// ErpSkeleton.dc.html`'s "14 · Purchase order" screen (24px content padding, one shared content
// frame, exactly one reserved band below the content — the dock):
//
// 1. The three sample pages (examples/ListReport.tsx, RecordDetail.tsx, Dashboard.tsx) used
//    inconsistent, non-reference padding (32 / 40 / 40) with RecordDetail/Dashboard additionally
//    re-centering their content (`margin: '0 auto'`) instead of matching ListReport's left edge —
//    three different heading x-positions for what should read as one product. Fixed: all three
//    now use 24px padding, left-aligned (`margin: 0` on the inner max-width wrapper).
// 2. Every sample page also set its own `minHeight: '100vh'` INSIDE `Shell`'s content slot, which
//    already stretches to fill (`flex: 1`) inside `Shell`'s own `minHeight: '100vh'` root — two
//    stacked full-viewport minimums, plus RecordDetail's root missing `box-sizing: border-box`
//    (its padding added on top of its height instead of being absorbed into it) and the preview
//    host's un-reset UA `body` margin (8px) and its in-flow "Preview — sample data" banner, all
//    inflated `document.scrollingElement.scrollHeight` past the 800px viewport. Fixed: the
//    redundant `minHeight: '100vh'` is removed from all three page roots, RecordDetail's root
//    gets `box-sizing: border-box`, `preview/server.mjs` resets `body{margin:0}`, and the banner
//    (examples/AppShell.tsx) is now `position: fixed` — out of the vertical flow entirely.
//    Verified live (a throwaway script against `pnpm build:preview` + `pnpm preview`, not
//    committed) before writing these assertions: `scrollHeight` lands at exactly 800 — equal to
//    the viewport — for all three pages, so that is the value asserted below, not a tolerant
//    range.
// 3. examples/ListReport.tsx's stat tiles were a hand-rolled `<div>` (padding 14, transparent
//    background, no shadow) while RecordDetail's summary cards and Dashboard's KPI tiles already
//    used the real `Card` component (padding 16, white background, shadow) — now one tile
//    implementation across all three pages (docs/ListReport.md discloses the resulting 16px vs.
//    the reference's 14px as an accepted deviation).
//
// (`Input`/`Chip` box-sizing, the other half of this ROADMAP item, are covered by the height
// assertions added to this file below; `Chip`'s `filter` variant was investigated and found to
// already render at `border-box` — Chrome's own UA stylesheet defaults `<button>` to `border-box`
// (unlike `<input>`), so its declared/rendered heights already matched and no fix or test for it
// was needed.)

const VIEWPORT = { width: 1280, height: 800 };

test('all three sample pages share the same content padding, so their headings land at the same x-position at 1280px', async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  await page.goto('/#examples');

  const purchaseOrdersHeading = page.getByRole('heading', { name: 'Purchase orders', exact: true });
  const purchaseOrdersX = (await purchaseOrdersHeading.boundingBox())?.x;

  await page.getByRole('button', { name: 'Sales', exact: true }).click(); // dock tile -> Sales order
  const salesHeading = page.getByRole('heading', { name: 'SO-1042 · Northwind Traders' });
  const salesX = (await salesHeading.boundingBox())?.x;

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Dashboards\b/ }).click();
  const dashboardHeading = page.getByRole('heading', { name: 'Good morning, Priya' });
  const dashboardX = (await dashboardHeading.boundingBox())?.x;

  // The reference's own 24px content padding — not just "equal to each other", the actual value.
  expect(purchaseOrdersX).toBe(24);
  expect(salesX).toBe(24);
  expect(dashboardX).toBe(24);
});

test('no sample page scrolls into empty canvas below its content: scrollHeight equals the 800px viewport for all three pages', async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  await page.goto('/#examples');

  const scrollHeight = () => page.evaluate(() => document.scrollingElement?.scrollHeight);

  await expect(page.getByRole('heading', { name: 'Purchase orders', exact: true })).toBeVisible();
  expect(await scrollHeight()).toBe(800);

  await page.getByRole('button', { name: 'Sales', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'SO-1042 · Northwind Traders' })).toBeVisible();
  expect(await scrollHeight()).toBe(800);

  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Dashboards\b/ }).click();
  await expect(page.getByRole('heading', { name: 'Good morning, Priya' })).toBeVisible();
  expect(await scrollHeight()).toBe(800);
});

test('the preview host resets the UA body margin and keeps its banner out of the vertical flow', async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  await page.goto('/#examples');

  await expect(page.locator('body')).toHaveCSS('margin', '0px');

  const banner = page.getByText('Preview — sample data', { exact: false });
  await expect(banner).toBeVisible();
  // `position: fixed` (not the UA default `static`) is what takes an element out of normal
  // document flow — a fixed-position element contributes nothing to its container's
  // scrollHeight, which the previous test already confirms lands at exactly 800px.
  const bannerParent = banner.locator('..');
  await expect(bannerParent).toHaveCSS('position', 'fixed');
});

test('the banner does not visually overlap the dock, at a wide or narrow viewport', async ({ page }) => {
  // Independent review finding (2026-09-14, fixed same batch): the banner's original bottom:12
  // placement was clear of clicks (pointerEvents:'none', proven above) but not clear of the
  // centered dock's footprint — a real visual collision, worst at narrow widths where the
  // banner's text wraps taller. bottom:84 (the ERP skeleton reference's own reserved band for
  // the dock, ErpSkeleton.dc.html: content inset bottom:84) sits the banner above it instead.
  const banner = page.getByText('Preview — sample data', { exact: false });
  const dock = page.getByRole('region', { name: 'App dock' });

  for (const size of [{ width: 1280, height: 800 }, { width: 380, height: 720 }]) {
    await page.setViewportSize(size);
    await page.goto('/#examples');
    const bannerBox = await banner.boundingBox();
    const dockBox = await dock.boundingBox();
    if (!bannerBox || !dockBox) throw new Error('banner or dock not found');
    const overlapsVertically = bannerBox.y < dockBox.y + dockBox.height && bannerBox.y + bannerBox.height > dockBox.y;
    expect(overlapsVertically, `banner ${JSON.stringify(bannerBox)} vs dock ${JSON.stringify(dockBox)} at ${size.width}px`).toBe(false);
  }
});

test('the Purchase-orders stat tile renders as a real Card, not the old hand-rolled div', async ({ page }) => {
  await page.goto('/#examples');

  const statTile = page.getByText('Awaiting approval', { exact: true }).first().locator('..');
  // `Card`'s own signature: white background + a box-shadow + 16px padding + 10px radius — none
  // of which the old hand-rolled tile had (transparent background, no shadow, 14px padding).
  await expect(statTile).toHaveCSS('background-color', 'rgb(255, 255, 255)'); // color.bgSurface
  await expect(statTile).toHaveCSS('padding', '16px'); // space.space4 — the disclosed 16-vs-14 deviation
  await expect(statTile).toHaveCSS('border-radius', '10px'); // radius.md
  const boxShadow = await statTile.evaluate((element) => getComputedStyle(element).boxShadow);
  expect(boxShadow).not.toBe('none');
});

test('Input renders at its declared height (border-box), at both search and default size', async ({ page }) => {
  await page.goto('/#examples');

  // search: examples/ListReport.tsx's toolbar search field, size="search", declares 36px.
  const searchInput = page.getByPlaceholder('Search POs…');
  await expect(searchInput).toHaveCSS('box-sizing', 'border-box');
  const searchHeight = await searchInput.evaluate((element) => (element as HTMLElement).offsetHeight);
  expect(searchHeight).toBe(36);

  // Default: examples/RecordDetail.tsx's Reject-modal "Comment" field, no size prop, declares 40px.
  await page.getByRole('button', { name: 'Sales', exact: true }).click();
  await page.getByRole('button', { name: 'Reject', exact: true }).click();
  const defaultInput = page.getByPlaceholder('Required for a rejection');
  await expect(defaultInput).toHaveCSS('box-sizing', 'border-box');
  const defaultHeight = await defaultInput.evaluate((element) => (element as HTMLElement).offsetHeight);
  expect(defaultHeight).toBe(40);
});
