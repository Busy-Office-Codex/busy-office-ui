import * as stylex from '@stylexjs/stylex';
import { BarChart, LineChart, PieChart, type BarSeriesOption, type LineSeriesOption, type PieSeriesOption } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent, type GridComponentOption, type LegendComponentOption, type TooltipComponentOption } from 'echarts/components';
import { init, use, type ComposeOption, type ECharts } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useId, useRef } from 'react';
import { space } from '../tokens.stylex.js';
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

// ECharts' style options (axisLabel.color, itemStyle.color, …) take literal CSS color strings the
// same way Chart.js's did — these literals are kept identical to tokens.stylex.ts's own values,
// the same "must be a literal, kept in sync with its token" exception this codebase already
// accepts elsewhere (e.g. AppShell.tsx's notification-button border comment). `PALETTE[0]` is
// `color.accent`; the rest are new categorical hues chosen to stay in the same cool, professional
// key and to avoid `color.danger`'s red, so a multi-series chart never reads a neutral category
// as an alert.
const PALETTE = ['#0057b8', '#0891b2', '#7c3aed', '#b45309', '#0f172a'];
const AXIS_COLOR = '#475569'; // color.textSecondary
const GRID_COLOR = '#e2e8f0'; // color.border
const FONT_FAMILY = '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const LABEL_STYLE = { color: AXIS_COLOR, fontFamily: FONT_FAMILY, fontSize: 12.5 };

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
 * file; every real consumer (Dashboard, Inventory, Planning, Analytics) needed no changes.
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
 */
export function Chart({ type, data, title, valueLabel, height = 220 }: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ECharts | null>(null);
  const tableId = useId();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    ensureRegistered();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const labels = data.map((point) => point.label);
    const values = data.map((point) => point.value);

    const instance = init(container, undefined, { renderer: 'canvas' });
    chartRef.current = instance;

    let option: ChartOption;
    if (type === 'donut') {
      option = {
        animation: !reduceMotion,
        color: PALETTE,
        tooltip: {
          trigger: 'item',
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
        legend: { bottom: 0, left: 'center', textStyle: LABEL_STYLE, itemWidth: 12, itemHeight: 12, itemGap: 12 },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            data: data.map((point) => ({ name: point.label, value: point.value })),
            label: { show: false },
          },
        ],
      };
    } else {
      option = {
        animation: !reduceMotion,
        grid: { left: 8, right: 8, top: 12, bottom: 8, containLabel: true },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const point = Array.isArray(params) ? params[0] : params;
            return `${point.name}: ${formatValue(Number(point.value), valueLabel)}`;
          },
        },
        legend: { show: false },
        xAxis: {
          type: 'category',
          data: labels,
          axisLine: { lineStyle: { color: GRID_COLOR } },
          axisTick: { show: false },
          axisLabel: LABEL_STYLE,
        },
        yAxis: {
          type: 'value',
          min: 0,
          axisLine: { show: false },
          splitLine: { lineStyle: { color: GRID_COLOR } },
          axisLabel: LABEL_STYLE,
        },
        series: [
          type === 'bar'
            ? { type: 'bar', data: values, itemStyle: { color: PALETTE[0], borderRadius: 4 } }
            : {
                type: 'line',
                data: values,
                smooth: 0.3,
                showSymbol: true,
                symbol: 'circle',
                lineStyle: { color: PALETTE[0], width: 2 },
                itemStyle: { color: PALETTE[0] },
              },
        ],
      };
    }

    instance.setOption(option);

    const resizeObserver = new ResizeObserver(() => instance.resize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      instance.dispose();
      chartRef.current = null;
    };
  }, [type, data, valueLabel]);

  return (
    <div {...stylex.props(styles.wrapper)}>
      <div ref={containerRef} style={{ height }} aria-hidden="true" data-testid="chart-canvas" />
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
