import { expect, test } from '@playwright/test';

// Dashboard.tsx's "Revenue trend" card is Chart's first real consumer (ROADMAP issue #16) — no
// synthetic harness, per this repo's established "test through the real consumer" precedent
// (Density, ButtonGroup). Reached via the command palette, same as every other route.
//
// Every test here emulates `prefers-reduced-motion: reduce` before navigating — found live, not
// assumed necessary: ECharts' default draw-in animation takes ~1s, so a pixel check run right
// after navigation (Playwright's own auto-waiting only waits for the canvas element to exist and
// be visible, not for its 2D bitmap to finish an in-progress animation) caught the chart mid-
// animation, with the line barely started — a real screenshot at that same moment showed
// perfectly-rendered axes/grid and a fully invisible data line. Reduced-motion isn't a test
// workaround bolted on after the fact — Chart.tsx already disables animation under this exact
// media query (matching every other animated thing in this package), so asserting against it
// gives a deterministic final render AND is itself real coverage of that documented behavior.
async function gotoDashboard(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Dashboards\b/ }).click();
}

async function countAccentPixels(canvas: import('@playwright/test').Locator): Promise<number> {
  return canvas.evaluate((el) => {
    const canvasEl = el as HTMLCanvasElement;
    const ctx = canvasEl.getContext('2d');
    if (!ctx || canvasEl.width === 0 || canvasEl.height === 0) return 0;
    const { data } = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    let count = 0;
    // color.accent (#0057b8) — the line's real stroke/point color, not just "any" non-transparent
    // pixel (grid lines and axis labels are ALSO non-transparent, so that weaker check cannot
    // distinguish "the chart drew nothing but scaffolding" from "the chart drew everything").
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a === 0) continue;
      if (b > 150 && b > r + 50 && b > g + 30) count++;
    }
    return count;
  });
}

// ROADMAP item 51, issue #22 — 4 real defects, exercised through the dedicated `#chart-lab`
// preview route (preview/ChartLab.tsx; see its own header comment for why no real `examples/`
// consumer cleanly isolates all four). Reduced-motion is emulated the same way `gotoDashboard`
// above does, for the same reason (a deterministic final render).
async function gotoChartLab(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chart-lab');
}

function chartCanvasIn(page: import('@playwright/test').Page, regionName: string) {
  return page.getByRole('region', { name: regionName }).getByTestId('chart-canvas').locator('canvas').first();
}

async function countPixelsNear(
  canvas: import('@playwright/test').Locator,
  target: readonly [number, number, number],
  tolerance: number,
): Promise<number> {
  return canvas.evaluate(
    (el, { target, tolerance }) => {
      const canvasEl = el as HTMLCanvasElement;
      const ctx = canvasEl.getContext('2d');
      if (!ctx || canvasEl.width === 0 || canvasEl.height === 0) return 0;
      const { data } = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
        if (a === 0) continue;
        if (Math.abs(r - target[0]) <= tolerance && Math.abs(g - target[1]) <= tolerance && Math.abs(b - target[2]) <= tolerance) count++;
      }
      return count;
    },
    { target, tolerance },
  );
}

// Bottommost/topmost rows carrying an accent-colored (PALETTE[0], #0057b8) pixel, as a fraction of
// canvas height — used below to prove a negative bar reaches meaningfully below a positive one,
// without depending on the exact padded axis range ECharts computes (an implementation detail of
// its own "nice" tick rounding, not something this fix controls or should have to predict exactly).
async function accentRowSpanFraction(canvas: import('@playwright/test').Locator): Promise<number> {
  return canvas.evaluate((el) => {
    const canvasEl = el as HTMLCanvasElement;
    const ctx = canvasEl.getContext('2d');
    if (!ctx || canvasEl.width === 0 || canvasEl.height === 0) return 0;
    const { data, width, height } = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    let minRow = -1;
    let maxRow = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
        if (a === 0) continue;
        if (b > 150 && b > r + 50 && b > g + 30) {
          if (minRow === -1) minRow = y;
          maxRow = y;
          break;
        }
      }
    }
    if (minRow === -1) return 0;
    return (maxRow - minRow) / height;
  });
}

test('draws the actual data — the line itself, not just axes and grid scaffolding', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDashboard(page);

  // Chart.tsx's own render surface is the `chart-canvas` container it hands to ECharts, not the
  // `<canvas>` — that element is created and appended by ECharts itself, imperatively, so it
  // never carries `aria-hidden` directly; the container does, and an aria-hidden ancestor already
  // removes every descendant (this canvas included) from the accessibility tree.
  // Dashboard now renders 3 charts (ROADMAP item 34's "BI dashboard" slice) — the count guard
  // makes `.first()` a checked assumption, not a silent positional one: if Dashboard.tsx's DOM
  // order ever changed, `.first()` alone would silently re-target a different chart and this test
  // would keep passing (any of the 3 canvases has well over 200 accent pixels) while no longer
  // testing the line this test is titled after.
  await expect(page.getByTestId('chart-canvas')).toHaveCount(3);
  const surface = page.getByTestId('chart-canvas').first();
  await expect(surface).toHaveAttribute('aria-hidden', 'true');

  const canvas = surface.locator('canvas').first();
  await expect(canvas).toBeVisible();

  // A 440x220 canvas with only grid/axis scaffolding (no line) has zero accent-colored pixels —
  // confirmed live by catching exactly that broken-looking state (an animation-timing artifact,
  // not a real bug, but it proved this assertion actually distinguishes the two cases).
  expect(await countAccentPixels(canvas)).toBeGreaterThan(200);
});

test('renders the two "BI dashboard" charts (bar + donut, ROADMAP item 34), not empty scaffolding', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDashboard(page);

  // Indices 1 and 2, not 0 — the Revenue trend line chart (index 0) already has its own,
  // stricter (>200 blue pixels) test above; this one covers the two charts this slice added.
  // Same generic color-presence check test/browser/inventory.spec.ts already established for its
  // own multi-chart page, applied here rather than re-inventing a different pattern.
  const surfaces = page.getByTestId('chart-canvas');
  await expect(surfaces).toHaveCount(3);
  for (const surface of (await surfaces.all()).slice(1)) {
    await expect(surface).toHaveAttribute('aria-hidden', 'true');
    const canvas = surface.locator('canvas').first();
    await expect(canvas).toBeVisible();
    const hasColor = await canvas.evaluate((el) => {
      const canvasEl = el as HTMLCanvasElement;
      const ctx = canvasEl.getContext('2d');
      if (!ctx || canvasEl.width === 0) return false;
      const { data } = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue; // fully transparent
        if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0) return true; // any real drawn pixel
      }
      return false;
    });
    expect(hasColor).toBe(true);
  }

  // Each chart pairs its render surface with its own real, visually-hidden accessible table
  // (Chart.tsx) — same property test/browser/chart.spec.ts's own "not the accessible content"
  // test already checks for the trend chart; here for the two new ones.
  await expect(page.getByRole('table', { name: 'Revenue by region, September 2026' })).toBeAttached();
  await expect(page.getByRole('table', { name: 'Revenue mix by channel, September 2026' })).toBeAttached();
});

test('without a reduced-motion preference, the chart still finishes drawing the real data (just animated in)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  // Deliberately no emulateMedia call here — this is the default-preference path every user
  // without "reduce motion" set actually gets.
  await page.goto('/#examples');
  await page.getByRole('button', { name: 'Open command palette', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /^Dashboards\b/ }).click();

  // Same positional dependency as the test above: `.first()` here resolves the Revenue trend
  // line chart's canvas because it's the first of Dashboard's now-3 charts in DOM order.
  const canvas = page.getByTestId('chart-canvas').locator('canvas').first();
  await expect(canvas).toBeVisible();
  // ECharts' default draw-in animation is ~1s; wait past it rather than asserting mid-animation.
  await page.waitForTimeout(1200);
  expect(await countAccentPixels(canvas)).toBeGreaterThan(200);
});

test('the canvas is not the accessible content — a real data table stands in for it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDashboard(page);

  // getByRole intentionally excludes aria-hidden subtrees, so this finding the table at all is
  // itself proof the render surface (aria-hidden) is correctly out of the accessibility tree
  // while the table stands in for it.
  const table = page.getByRole('table', { name: 'Revenue trend, last 6 months' });
  await expect(table).toBeAttached();
  await expect(table.getByRole('columnheader', { name: 'Category' })).toBeAttached();
  await expect(table.getByRole('cell', { name: 'Sep' })).toBeAttached();
  await expect(table.getByRole('cell', { name: '$486,000' })).toBeAttached();

  // Visually hidden, not merely present — a sighted user should never see a duplicate table
  // floating next to the chart. Two things to check, not one: Playwright's own toBeHidden()
  // doesn't recognize the standard visually-hidden technique (1x1px wrapper + clipped overflow,
  // not display:none) as hidden — it has real geometry, just geometry too small to see. And the
  // table's OWN boundingBox() reports its natural, unclipped content width regardless of the
  // wrapper's overflow:hidden (ancestor clipping changes what's painted, not a descendant's own
  // computed layout box — the same getBoundingClientRect()-doesn't-reflect-clipping gotcha this
  // repo's Control Center popover ran into). So check the WRAPPER's own box, not the table's.
  const wrapperBox = await table.locator('..').evaluate((el) => el.getBoundingClientRect());
  expect(wrapperBox.width).toBeLessThanOrEqual(1);
  expect(wrapperBox.height).toBeLessThanOrEqual(1);
});

test('resizes the chart when its container changes size, instead of staying pinned to first-render dimensions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDashboard(page);

  // Same positional dependency noted above: `.first()` resolves the Revenue trend line chart,
  // the first of Dashboard's now-3 charts in DOM order.
  const canvas = page.getByTestId('chart-canvas').locator('canvas').first();
  await expect(canvas).toBeVisible();
  const initialBox = await canvas.boundingBox();
  expect(initialBox).not.toBeNull();

  // The chart's Card is full-width with no `maxWidth` (docs/design-conventions.md's "Page width
  // and responsive layout"), so a narrower viewport genuinely narrows its container. Unlike
  // Chart.js's own `<canvas>` (which resized itself via Chart.js's built-in responsive mode),
  // ECharts does not resize its render surface when its container's box changes on its own —
  // Chart.tsx wires a `ResizeObserver` on the container that calls the chart instance's own
  // `resize()`. 700px stays above Shell's own 640px narrow-chrome breakpoint (src/shell/Shell.tsx)
  // so this only exercises the resize wiring, not a structural chrome change that could also
  // shrink or grow the content area for an unrelated reason.
  await page.setViewportSize({ width: 700, height: 900 });
  await expect(async () => {
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThan(initialBox!.width - 150);
  }).toPass({ timeout: 2000 });
});

test('agrees with the REVENUE THIS MONTH stat card instead of inventing its own number', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoDashboard(page);

  await expect(page.getByText('$486K')).toBeVisible();
  await expect(page.getByText('+6.4% vs last month')).toBeVisible();
  await expect(page.getByRole('cell', { name: '$486,000' })).toBeAttached();

  // The two "BI dashboard" charts (ROADMAP item 34) make the same claim from two more angles —
  // their own hidden tables' value columns really do sum to the same $486,000, not just a
  // comment asserting it. Reads each table's own rendered cell text, not the source data array,
  // so this fails if Chart.tsx's real render ever drifts from what was supplied.
  async function sumValueColumn(tableName: string): Promise<number> {
    const table = page.getByRole('table', { name: tableName });
    const cells = await table.getByRole('cell').allTextContents();
    const values = cells.filter((text) => text.startsWith('$'));
    return values.reduce((total, text) => total + Number(text.replace(/[$,]/g, '')), 0);
  }
  expect(await sumValueColumn('Revenue by region, September 2026')).toBe(486000);
  expect(await sumValueColumn('Revenue mix by channel, September 2026')).toBe(486000);
});

test.describe('ROADMAP item 51 (issue #22) — 4 real defects', () => {
  test('a label containing an HTML tag renders as inert text, not executable markup (tooltip XSS)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoChartLab(page);

    const canvas = chartCanvasIn(page, 'xss label');
    await expect(canvas).toBeVisible();

    // 'axis' trigger fires on hovering anywhere over the plot area, not just precisely over the
    // bar — the single category here still spans a real x range.
    await canvas.hover();

    // No fixed API to await "the tooltip finished painting"; the assertions below (polled via
    // toPass, since the tooltip renders on a short internal delay) are the real check, this just
    // gives it room to have painted by the time they run.
    await page.waitForTimeout(200);

    await expect(async () => {
      // If ECharts' tooltip ever regresses to its default `renderMode: 'html'`, this exact label
      // gets assigned as innerHTML, creating a real `<img src="x">` (which fails to load, since
      // "x" isn't a real image URL) and firing its inline `onerror` — proof the string was parsed
      // as markup, not proof of any particular payload's specific effect.
      const fired = await page.evaluate(() => (window as unknown as { __chartXssFired?: boolean }).__chartXssFired);
      expect(fired).toBeFalsy();
      const injectedImages = await page.evaluate(() => document.querySelectorAll('img[src="x"]').length);
      expect(injectedImages).toBe(0);
    }).toPass({ timeout: 2000 });
  });

  test('a negative value draws below the zero axis instead of clipping at it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoChartLab(page);

    const canvas = chartCanvasIn(page, 'negative values');
    await expect(canvas).toBeVisible();

    // Data is [120, -60, 90] (preview/ChartLab.tsx). A hardcoded `min: 0` would clip the -60 bar
    // at the zero line, leaving every drawn bar confined to a narrow band near the top of the
    // canvas; letting ECharts auto-scale the axis (no `min` set at all) spreads the positive AND
    // negative bars across a real vertical range instead.
    expect(await accentRowSpanFraction(canvas)).toBeGreaterThan(0.35);
  });

  test.describe('reinit guard', () => {
    test('does not dispose+reinit the chart when data is value-equal (new array reference, unchanged values)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoChartLab(page);

      const region = page.getByRole('region', { name: 'reinit guard' });
      const canvas = region.getByTestId('chart-canvas').locator('canvas').first();
      await expect(canvas).toBeVisible();

      // Stamp the live canvas node — ECharts' `init()` gives no other handle on it, and a
      // dispose()+init() cycle would create a BRAND NEW <canvas> with no such marker.
      await canvas.evaluate((el) => {
        (el as HTMLElement).dataset.reinitProbe = 'original';
      });

      // Each click recomputes preview/ChartLab.tsx's `reinitData` via a fresh `.map()` over the
      // SAME `dataset` — a new array reference, identical values, the exact case examples/
      // BiExplore.tsx hits on every unrelated re-render.
      const forceRerender = region.getByRole('button', { name: 'Force unrelated re-render' });
      await forceRerender.click();
      await forceRerender.click();
      await forceRerender.click();
      await expect(page.getByText('Tick: 3')).toBeVisible();

      await expect(canvas).toHaveAttribute('data-reinit-probe', 'original');
    });

    test('a genuine data change still redraws the chart for real', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoChartLab(page);

      const region = page.getByRole('region', { name: 'reinit guard' });
      const canvas = region.getByTestId('chart-canvas').locator('canvas').first();
      await expect(canvas).toBeVisible();

      const before = await countAccentPixels(canvas);
      await region.getByRole('button', { name: 'Swap dataset' }).click();

      // Dataset A is [40, 65, 52], dataset B is [90, 12, 70] (preview/ChartLab.tsx) — genuinely
      // different bar heights, so the drawn accent-pixel area is expected to differ for real, not
      // just be redrawn identically.
      await expect(async () => {
        const after = await countAccentPixels(canvas);
        expect(after).not.toBe(before);
      }).toPass({ timeout: 2000 });
    });
  });

  test.describe('theme reactivity', () => {
    test("light and dark `<Theme>`-wrapped charts each use that theme's own axis/gridline tokens, not fixed light-mode literals", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoChartLab(page);

      const lightCanvas = chartCanvasIn(page, 'light theme chrome');
      const darkCanvas = chartCanvasIn(page, 'dark theme chrome');
      await expect(lightCanvas).toBeVisible();
      await expect(darkCanvas).toBeVisible();

      // lightPalette.border #e2e8f0 = rgb(226,232,240); darkPalette.border #334155 = rgb(51,65,85)
      // (tokens.stylex.ts) — gridlines/axis lines are solid 1px strokes in these exact colors, so
      // a real theme switch shows up as which of these two colors' pixels are present, not a
      // fuzzy shift assertion.
      expect(await countPixelsNear(lightCanvas, [226, 232, 240], 4)).toBeGreaterThan(10);
      expect(await countPixelsNear(darkCanvas, [51, 65, 85], 4)).toBeGreaterThan(10);
      // And genuinely switched, not just "some dark-ish pixel happened to qualify": the OTHER
      // theme's literal is absent from each.
      expect(await countPixelsNear(lightCanvas, [51, 65, 85], 4)).toBe(0);
      expect(await countPixelsNear(darkCanvas, [226, 232, 240], 4)).toBe(0);
    });

    test('a live `<Theme>` toggle on an already-mounted chart recolors it, with no remount', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoChartLab(page);

      const region = page.getByRole('region', { name: 'live theme chrome' });
      const canvas = region.getByTestId('chart-canvas').locator('canvas').first();
      await expect(canvas).toBeVisible();
      await expect(region.getByText('Live theme: light')).toBeVisible();
      expect(await countPixelsNear(canvas, [226, 232, 240], 4)).toBeGreaterThan(10); // light border

      // Same `<Theme>` element, same position, only its `value` prop changes (preview/
      // ChartLab.tsx's own comment) — this is what examples/AppShell.tsx's Control Center
      // "Appearance" control does to an already-rendered page; it does NOT remount the chart.
      await region.getByRole('button', { name: 'Toggle live theme' }).click();
      await expect(region.getByText('Live theme: dark')).toBeVisible();

      await expect(async () => {
        expect(await countPixelsNear(canvas, [51, 65, 85], 4)).toBeGreaterThan(10); // dark border
      }).toPass({ timeout: 2000 });
    });

    test('an OS-level prefers-color-scheme flip recolors an already-mounted chart with no `<Theme>` wrapper', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
      await page.goto('/#chart-lab');

      // No `<Theme>` wrapper on this one (preview/ChartLab.tsx) — it follows the bare
      // `prefers-color-scheme` default the same way every other themed component in this system
      // already does with zero host code (ROADMAP item 19).
      const canvas = chartCanvasIn(page, 'negative values');
      await expect(canvas).toBeVisible();
      expect(await countPixelsNear(canvas, [226, 232, 240], 4)).toBeGreaterThan(5);

      await page.emulateMedia({ colorScheme: 'dark' });
      await expect(async () => {
        expect(await countPixelsNear(canvas, [51, 65, 85], 4)).toBeGreaterThan(5);
      }).toPass({ timeout: 2000 });
    });
  });
});
