import * as stylex from '@stylexjs/stylex';
import { BarChart, LineChart, PieChart, type BarSeriesOption, type LineSeriesOption, type PieSeriesOption } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent, type GridComponentOption, type LegendComponentOption, type TooltipComponentOption } from 'echarts/components';
import { init, use, type ComposeOption, type ECharts } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useId, useRef, type RefObject } from 'react';
import { color, space } from '../tokens.stylex.js';
import { chartSeriesEqual } from './chart-utils.js';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table.js';

// Tree-shaken registration — only what bar/line/donut + grid/legend/tooltip actually need, via
// `echarts/core` + explicit chart/component/renderer imports, never bare `echarts` (that
// convenience entry registers every chart type, component and feature the library ships — maps,
// 3D, every coordinate system — which would undo the point of picking pieces at all; see
// docs/Chart.md for the full library comparison this decision was made from, both times).
// Deliberately NOT called at module top level: this package declares `"sideEffects": false`
// (package.json) so a host bundler can drop any component this file exports that a host never
// imports — echarts's own package.json makes the same claim for `core.js`/`charts.js`/
// `components.js`/`renderers.js` (its `sideEffects` list only names the convenience entries this
// file doesn't use). A top-level `use(...)` call would be a real module-evaluation side effect,
// defeating that claim specifically for this file and pulling echarts into every consumer's
// bundle whether or not they ever render a `Chart` — measured live, the same way as the Chart.js
// number below it (full package minified+gzipped, with vs. without this file's dependency): this
// package is now ~571KB minified / ~194KB gzipped with `Chart` in it (was ~201KB/~69KB on
// Chart.js, ~20KB/~6.4KB before `Chart` existed at all) — ECharts adds ~188KB gzipped versus
// Chart.js's own ~63KB, a real ~125KB-gzipped regression, NOT an improvement, from this swap.
// Broken down (also measured, not assumed): `echarts/core` + `CanvasRenderer` alone, with zero
// chart types registered, already costs ~101KB gzipped — more than Chart.js's entire footprint —
// before a single `BarChart`/`LineChart`/`PieChart` (+~39KB combined) or `GridComponent` (+~33KB
// on its own, the cartesian coordinate-system machinery bar/line need) is added. This is exactly
// the tradeoff docs/Chart.md's original Chart.js decision named ECharts as *not* worth paying for
// at this package's bar/line/donut-only, ERP-sample-data scale — trimming imports here cannot
// close that gap, since the cost lives in ECharts' general-purpose core, not in the unused chart
// types the tree-shaken import list already excludes. Registering once on first render at least
// keeps that real cost paid only by hosts that actually use this component, not by every host.
let registered = false;
function ensureRegistered() {
  if (registered) return;
  use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);
  registered = true;
}

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.space2,
  },
  // Standard visually-hidden treatment — present in the accessibility tree and to screen
  // readers, invisible and non-reflowing for sighted users.
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});

// Theme-color "probes" (ROADMAP item 51, issue #22) — never shown (rendered inside the same
// visually-hidden wrapper `styles.srOnly` above), read only via `getComputedStyle(...).color`.
// ECharts' style options (axisLabel.color, tooltip.backgroundColor, …) take literal CSS color
// strings, painted onto a `<canvas>` — a canvas 2D context's fillStyle/strokeStyle never resolves
// a `var(--token)` reference the way a real DOM element's `color: var(--token)` would (canvas has
// no cascade to resolve against), so the only way to hand ECharts the CURRENT theme's actual
// literal color is to read it back off a real, themed DOM node. Each probe sits inside THIS
// chart's own render tree, so it inherits whichever `Theme` (or bare `prefers-color-scheme`
// default) ancestor is actually in effect at this exact point in the page, same as any other
// themed element in this system.
const probeStyles = stylex.create({
  axis: { color: color.textSecondary },
  grid: { color: color.border },
  tooltipBg: { color: color.bgSurface },
  tooltipText: { color: color.textPrimary },
});

// ECharts' style options (axisLabel.color, itemStyle.color, …) take literal CSS color strings the
// same way Chart.js's did — these literals are kept identical to tokens.stylex.ts's own values,
// the same "must be a literal, kept in sync with its token" exception this codebase already
// accepts elsewhere (e.g. AppShell.tsx's notification-button border comment). `PALETTE[0]` is
// `color.accent`; the rest are new categorical hues chosen to stay in the same cool, professional
// key and to avoid `color.danger`'s red, so a multi-series chart never reads a neutral category
// as an alert. Deliberately NOT theme-derived like the chrome colors below: data-ink stays a
// constant identity across light/dark so a series reads as "the same data", the same reasoning
// this file's own AXIS_COLOR/GRID_COLOR values used to hardcode for everything (ROADMAP item 51's
// own scope is chart chrome — axis/gridline/tooltip — not the data series palette).
const PALETTE = ['#0057b8', '#0891b2', '#7c3aed', '#b45309', '#0f172a'];
const FONT_FAMILY = '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

type ChartOption = ComposeOption<
  BarSeriesOption | LineSeriesOption | PieSeriesOption | GridComponentOption | LegendComponentOption | TooltipComponentOption
>;

export type ChartSeries = { label: string; value: number }[];

export type ChartProps = {
  /** `bar`/`line` read one series along a category axis; `donut` reads one value per category as a share of the whole. */
  type: 'bar' | 'line' | 'donut';
  data: ChartSeries;
  /** Accessible name — also the caption on the visually-hidden data table a screen reader gets instead of the render surface. */
  title: string;
  /** Optional unit shown in tooltips and the hidden table's value column header, e.g. `"$"`, `"units"`. */
  valueLabel?: string;
  height?: number;
};

function formatValue(value: number, unit?: string): string {
  const formatted = value.toLocaleString('en-US');
  if (unit === '$') return `$${formatted}`;
  return unit ? `${formatted} ${unit}` : formatted;
}

type ThemeColors = { axis: string; grid: string; tooltipBg: string; tooltipText: string };

type ColorProbeRefs = {
  axisRef: RefObject<HTMLSpanElement | null>;
  gridRef: RefObject<HTMLSpanElement | null>;
  tooltipBgRef: RefObject<HTMLSpanElement | null>;
  tooltipTextRef: RefObject<HTMLSpanElement | null>;
};

function readThemeColors({ axisRef, gridRef, tooltipBgRef, tooltipTextRef }: ColorProbeRefs): ThemeColors | null {
  const axisEl = axisRef.current;
  const gridEl = gridRef.current;
  const tooltipBgEl = tooltipBgRef.current;
  const tooltipTextEl = tooltipTextRef.current;
  if (!axisEl || !gridEl || !tooltipBgEl || !tooltipTextEl) return null;
  return {
    axis: getComputedStyle(axisEl).color,
    grid: getComputedStyle(gridEl).color,
    tooltipBg: getComputedStyle(tooltipBgEl).color,
    tooltipText: getComputedStyle(tooltipTextEl).color,
  };
}

function buildChartOption(type: ChartProps['type'], data: ChartSeries, valueLabel: string | undefined, colors: ThemeColors, reduceMotion: boolean): ChartOption {
  const labelStyle = { color: colors.axis, fontFamily: FONT_FAMILY, fontSize: 12.5 };

  // Tooltip XSS fix (ROADMAP item 51, issue #22): ECharts' DEFAULT tooltip `renderMode` ('html')
  // assigns the formatter's returned string as innerHTML, so a label containing e.g.
  // `<img src=x onerror=...>` was a real, published XSS sink for any consumer whose chart labels
  // come from user-entered data. `renderMode: 'richText'` is ECharts' own first-class safe path —
  // confirmed against node_modules/echarts/lib/component/tooltip/TooltipRichContent.js, which
  // hands the formatted string straight to a zrender `Text` graphic painted onto the SAME canvas
  // as the rest of the chart (`this._zr.add(this.el)`), never `innerHTML`/DOM parsing — so the
  // string always renders as inert literal glyphs, never executable markup. Not a hand-rolled
  // escaping function: ECharts already has the safe option built in.
  const tooltipChrome = {
    renderMode: 'richText' as const,
    backgroundColor: colors.tooltipBg,
    textStyle: { color: colors.tooltipText, fontFamily: FONT_FAMILY },
  };

  if (type === 'donut') {
    return {
      animation: !reduceMotion,
      color: PALETTE,
      tooltip: {
        trigger: 'item',
        ...tooltipChrome,
        formatter: (params) => {
          const point = Array.isArray(params) ? params[0] : params;
          return `${point.name}: ${formatValue(Number(point.value), valueLabel)}`;
        },
      },
      // `bottom`, not `right` — kept from the Chart.js version's own finding: a side legend
      // allocates a fixed-width column that clips long labels instead of growing to fit them,
      // even in a genuinely wide container. ECharts' own `bottom` legend additionally wraps its
      // items across the full chart width natively (no equivalent fixed-column failure mode to
      // route around in the first place) — a real, verified improvement over the Chart.js
      // version's own workaround, not just a ported-over choice.
      legend: { bottom: 0, left: 'center', textStyle: labelStyle, itemWidth: 12, itemHeight: 12, itemGap: 12 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: data.map((point) => ({ name: point.label, value: point.value })),
          label: { show: false },
        },
      ],
    };
  }

  return {
    animation: !reduceMotion,
    grid: { left: 8, right: 8, top: 12, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      ...tooltipChrome,
      formatter: (params) => {
        const point = Array.isArray(params) ? params[0] : params;
        return `${point.name}: ${formatValue(Number(point.value), valueLabel)}`;
      },
    },
    legend: { show: false },
    xAxis: {
      type: 'category',
      data: data.map((point) => point.label),
      axisLine: { lineStyle: { color: colors.grid } },
      axisTick: { show: false },
      axisLabel: labelStyle,
    },
    yAxis: {
      type: 'value',
      // No hardcoded `min: 0` (ROADMAP item 51, issue #22) — was clipping negative values (e.g. a
      // Finance cash-flow loss month) at the zero line instead of drawing them below it. ECharts'
      // own default (`scale: false`, unset here) already keeps zero on-axis for all-positive data
      // — identical rendering for every existing all-positive consumer — while still auto-
      // extending the axis min below zero whenever the data actually goes negative.
      axisLine: { show: false },
      splitLine: { lineStyle: { color: colors.grid } },
      axisLabel: labelStyle,
    },
    series: [
      type === 'bar'
        ? { type: 'bar', data: data.map((point) => point.value), itemStyle: { color: PALETTE[0], borderRadius: 4 } }
        : {
            type: 'line',
            data: data.map((point) => point.value),
            smooth: 0.3,
            showSymbol: true,
            symbol: 'circle',
            lineStyle: { color: PALETTE[0], width: 2 },
            itemStyle: { color: PALETTE[0] },
          },
    ],
  };
}

/**
 * A minimal chart primitive (ROADMAP issue #16 — 5 named consumers, well over Objective 3's
 * two-consumer bar) — bar, line and donut, driven entirely by a `{ label, value }[]` prop and
 * nothing else. No data fetching, no live updates, no business logic: a caller supplies whatever
 * sample series it already has, the same boundary every other component in this package holds
 * (Objective 2, docs/design-conventions.md).
 *
 * Renders via Apache ECharts' canvas renderer (owner-directed, 2026-09-16 — a reversal of this
 * same milestone's own Chart.js decision, not a re-litigation of it: docs/Chart.md keeps the full
 * "why Chart.js" reasoning that decision was made from, with this switch noted alongside it). The
 * public contract this component wraps around ECharts is unchanged from the Chart.js version —
 * `ChartProps`/`ChartSeries` are identical — and `echarts` is never imported anywhere outside this
 * file; every real consumer at the time of the switch (Dashboard, Inventory, Planning, Analytics)
 * needed no changes — a historical snapshot, not the current count; see `docs/Chart.md` for that.
 *
 * ECharts renders into a container element it owns and manages internally — unlike Chart.js,
 * which is handed a `<canvas>` this component created — so the wrapping `<div>` below, not a bare
 * `<canvas>`, is the DOM node this component controls directly and the one carrying `aria-hidden`.
 * That div has no accessibility tree either way, so every chart also renders a visually-hidden
 * real `Table` with the same data right after it — that's what a screen reader actually reads.
 * `prefers-reduced-motion` disables ECharts' own draw-in animation, matching every other animated
 * thing in this package (`motion.stylex.ts`'s durations collapsing to 0 under the same query).
 *
 * ECharts does not resize its own render surface when its container's size changes (Chart.js's
 * `<canvas>` did this on its own via responsive-mode resize handling) — a real behavioral gap
 * found while making this swap, not present in the Chart.js version. A `ResizeObserver` on the
 * container calls the chart instance's own `resize()` whenever the container's box changes,
 * cleaned up alongside `dispose()` on unmount; confirmed live that without it, a chart rendered
 * at one container width stays that pixel width even after its page reflows narrower or wider.
 *
 * The chart instance itself is created exactly once, on mount, and lives until unmount — every
 * update (a `type`/`data`/`valueLabel` change, or the ambient theme changing) goes through
 * `setOption()` on that SAME instance (ROADMAP item 51, issue #22 — this used to `dispose()` +
 * re-`init()` on every render where `data` was merely a new array reference, even with unchanged
 * values, which is what a caller deriving its series inline on every render — examples/
 * BiExplore.tsx's own pivot aggregation — hit on every unrelated re-render: a visible flicker/
 * restarted draw-in animation for no real change). `data` is compared by VALUE (see
 * `chart-utils.ts`'s `chartSeriesEqual`), not by reference, before any of that runs, so a
 * same-values-new-reference `data` prop is recognized as a no-op and skips even `setOption` —
 * only a genuine change to `type`/`data`'s values/`valueLabel`, or the ambient theme, triggers a
 * real redraw.
 */
export function Chart({ type, data, title, valueLabel, height = 220 }: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ECharts | null>(null);
  const tableId = useId();

  const axisProbeRef = useRef<HTMLSpanElement | null>(null);
  const gridProbeRef = useRef<HTMLSpanElement | null>(null);
  const tooltipBgProbeRef = useRef<HTMLSpanElement | null>(null);
  const tooltipTextProbeRef = useRef<HTMLSpanElement | null>(null);

  // Value-stable `data` (ROADMAP item 51, issue #22) — see this component's own doc comment above.
  // Comparing during render (not in an effect) and caching the winner in a ref is the standard
  // "memoize against a non-primitive prop" escape hatch: it lets the effect below's own dependency
  // array ([stableData]) see the SAME reference across renders whenever the new `data` is
  // value-equal to the last one, so React skips re-running that effect at all.
  const stableDataRef = useRef<ChartSeries>(data);
  if (!chartSeriesEqual(stableDataRef.current, data)) stableDataRef.current = data;
  const stableData = stableDataRef.current;

  // Always-current closure the mount effect's theme listeners (set up once, below) call into, so
  // they rebuild the option with THIS render's latest type/data/valueLabel rather than whatever
  // was current when they were attached.
  const applyOptionRef = useRef<() => void>(() => {});
  applyOptionRef.current = () => {
    const instance = chartRef.current;
    if (!instance) return;
    const colors = readThemeColors({ axisRef: axisProbeRef, gridRef: gridProbeRef, tooltipBgRef: tooltipBgProbeRef, tooltipTextRef: tooltipTextProbeRef });
    if (!colors) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // `notMerge: true` on every call, first paint included — the ONE update path now (ROADMAP
    // item 51, issue #22): switching `type` (e.g. bar → donut) needs the previous option's
    // xAxis/yAxis/grid fully replaced rather than merged with the new, axis-less pie option, and a
    // full replace via `setOption` is what lets this component never call `dispose()` + `init()`
    // again after the first mount.
    instance.setOption(buildChartOption(type, stableData, valueLabel, colors, reduceMotion), true);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    ensureRegistered();
    const instance = init(container, undefined, { renderer: 'canvas' });
    chartRef.current = instance;
    applyOptionRef.current();

    const resizeObserver = new ResizeObserver(() => instance.resize());
    resizeObserver.observe(container);

    // Live theme reactivity (ROADMAP item 51, issue #22). Neither `Theme` (Theme.tsx — a
    // `stylex.createTheme` class swapped onto some ancestor `<div>`, ROADMAP item 19) nor a live
    // OS `prefers-color-scheme` flip carries a JS event this component would otherwise see: every
    // OTHER themed component in this system just repaints for free because it reads `color.*` as
    // a real CSS var, but ECharts' canvas colors are plain JS strings baked in at `setOption`
    // time, so an already-mounted chart would keep stale colors across either kind of live
    // change without this. `media`'s `change` event covers the OS case. The `MutationObserver`
    // covers an explicit `<Theme>` toggle — see examples/AppShell.tsx's Control Center
    // "Appearance" control, the one real place in this system that swaps `<Theme value>` under an
    // ALREADY-mounted subtree (light ↔ dark keeps the same `<Theme>` element mounted, only its
    // theme class changes — no remount, so no other effect here would ever re-run on its own).
    // `subtree: true` on `document.body`, not a specific ancestor, because that wrapper can sit at
    // any depth above this chart, or not exist at all.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => applyOptionRef.current();
    media.addEventListener('change', handleThemeChange);
    const classObserver = new MutationObserver(handleThemeChange);
    classObserver.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });

    return () => {
      resizeObserver.disconnect();
      media.removeEventListener('change', handleThemeChange);
      classObserver.disconnect();
      instance.dispose();
      chartRef.current = null;
    };
    // Mount/unmount only — every update flows through `applyOptionRef` + the effect below, never
    // by re-running this one.
  }, []);

  useEffect(() => {
    applyOptionRef.current();
  }, [type, stableData, valueLabel]);

  return (
    <div {...stylex.props(styles.wrapper)}>
      <div ref={containerRef} style={{ height }} aria-hidden="true" data-testid="chart-canvas" />
      <div aria-hidden="true" {...stylex.props(styles.srOnly)}>
        <span ref={axisProbeRef} {...stylex.props(probeStyles.axis)} />
        <span ref={gridProbeRef} {...stylex.props(probeStyles.grid)} />
        <span ref={tooltipBgProbeRef} {...stylex.props(probeStyles.tooltipBg)} />
        <span ref={tooltipTextProbeRef} {...stylex.props(probeStyles.tooltipText)} />
      </div>
      <div id={tableId} {...stylex.props(styles.srOnly)}>
        <Table>
          <caption>{title}</caption>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell align="end">{valueLabel ? `Value (${valueLabel})` : 'Value'}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((point) => (
              <TableRow key={point.label}>
                <TableCell>{point.label}</TableCell>
                <TableCell align="end">{formatValue(point.value, valueLabel)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
