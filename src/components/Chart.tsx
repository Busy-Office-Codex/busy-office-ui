import * as stylex from '@stylexjs/stylex';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  DoughnutController,
  PointElement,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js';
import { useEffect, useId, useRef } from 'react';
import { space } from '../tokens.stylex.js';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table.js';

// Tree-shaken registration — only what bar/line/donut + legend/tooltip actually need, not
// `chart.js/auto` (which registers every controller/scale/plugin the library ships and would
// undo the point of picking a "low learning curve, good performance, lightweight" library in the
// first place — see docs/Chart.md for the full library comparison this decision was made from).
// Deliberately NOT called at module top level: this package declares `"sideEffects": false`
// (package.json) so a host bundler can drop any component this file exports that a host never
// imports — chart.js's own package.json makes the same claim for everything except its `/auto`
// entry (which this file doesn't use). A top-level `ChartJS.register(...)` call would be a real
// module-evaluation side effect, defeating that claim specifically for this file and pulling
// chart.js into every consumer's bundle whether or not they ever render a `Chart` — measured
// live: chart.js added ~63KB gzipped to this package's minified bundle. Registering once on
// first render keeps that cost paid only by hosts that actually use this component.
let registered = false;
function ensureRegistered() {
  if (registered) return;
  ChartJS.register(BarController, LineController, DoughnutController, BarElement, LineElement, PointElement, ArcElement, CategoryScale, LinearScale, Legend, Tooltip);
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

// Canvas 2D's fillStyle/strokeStyle/font take literal CSS values — the Canvas API has no notion
// of resolving a `var(--…)` custom-property reference the way the DOM/CSSOM does, so `color.*`'s
// StyleX tokens (which compile to exactly that) can't be handed to Chart.js directly. These
// literals are kept identical to tokens.stylex.ts's own values — the same "must be a literal,
// kept in sync with its token" exception this codebase already accepts elsewhere (e.g.
// AppShell.tsx's notification-button border comment). `PALETTE[0]` is `color.accent`; the rest
// are new categorical hues chosen to stay in the same cool, professional key and to avoid
// `color.danger`'s red, so a multi-series chart never reads a neutral category as an alert.
const PALETTE = ['#0057b8', '#0891b2', '#7c3aed', '#b45309', '#0f172a'];
const AXIS_COLOR = '#475569'; // color.textSecondary
const GRID_COLOR = '#e2e8f0'; // color.border
const FONT_FAMILY = '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const TICK_FONT = { family: FONT_FAMILY, size: 12.5 };

export type ChartSeries = { label: string; value: number }[];

export type ChartProps = {
  /** `bar`/`line` read one series along a category axis; `donut` reads one value per category as a share of the whole. */
  type: 'bar' | 'line' | 'donut';
  data: ChartSeries;
  /** Accessible name — also the caption on the visually-hidden data table a screen reader gets instead of the canvas. */
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
 * Renders on `<canvas>` via Chart.js (owner-directed, 2026-09-15 — supersedes issue #16's own
 * default recommendation of hand-rolled SVG, made once a real charting library was decided to be
 * worth the dependency: low learning curve, canvas performance that's plenty at ERP sample-data
 * scale, and — unlike ECharts/Plotly/D3 — no bundled capability this package will never use).
 *
 * A canvas has no accessibility tree of its own, so every chart also renders a visually-hidden
 * real `Table` with the same data right after it — that's what a screen reader actually reads;
 * the canvas itself is `aria-hidden`. `prefers-reduced-motion` disables Chart.js's own draw
 * animation, matching every other animated thing in this package (`motion.stylex.ts`'s durations
 * collapsing to 0 under the same media query).
 */
export function Chart({ type, data, title, valueLabel, height = 220 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const tableId = useId();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ensureRegistered();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const labels = data.map((point) => point.label);
    const values = data.map((point) => point.value);

    let config: ChartConfiguration;
    if (type === 'donut') {
      config = {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: data.map((_point, index) => PALETTE[index % PALETTE.length]) }],
        },
        options: {
          animation: reduceMotion ? false : undefined,
          plugins: {
            // `bottom`, not `right` — found live: Chart.js's `right` legend allocates a fixed-
            // width side column that doesn't grow to fit longer labels (it clips instead), even
            // in a genuinely wide container. A `bottom` legend wraps its items across the full
            // chart width, which scales with however wide the caller's own layout makes this
            // component — far more robust for real business labels, not just this file's own
            // short "Paper"/"Cable"/"Switches" example.
            legend: { position: 'bottom', labels: { color: AXIS_COLOR, font: TICK_FONT, boxWidth: 12, padding: 12 } },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatValue(Number(ctx.raw), valueLabel)}` } },
          },
        },
      };
    } else {
      config = {
        type,
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: type === 'bar' ? PALETTE[0] : 'transparent',
              borderColor: PALETTE[0],
              borderWidth: 2,
              pointBackgroundColor: PALETTE[0],
              borderRadius: type === 'bar' ? 4 : 0,
              tension: type === 'line' ? 0.3 : 0,
            },
          ],
        },
        options: {
          animation: reduceMotion ? false : undefined,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => formatValue(ctx.parsed.y ?? 0, valueLabel) } },
          },
          scales: {
            x: { ticks: { color: AXIS_COLOR, font: TICK_FONT }, grid: { display: false } },
            y: { ticks: { color: AXIS_COLOR, font: TICK_FONT }, grid: { color: GRID_COLOR }, beginAtZero: true },
          },
        },
      };
    }

    chartRef.current = new ChartJS(canvas, config);
    return () => chartRef.current?.destroy();
  }, [type, data, valueLabel]);

  return (
    <div {...stylex.props(styles.wrapper)}>
      <div style={{ height }}>
        <canvas ref={canvasRef} aria-hidden="true" />
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
