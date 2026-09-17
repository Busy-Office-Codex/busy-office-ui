import { useState } from 'react';
import { Chart, Theme, type ChartSeries } from '../src/index.js';

/**
 * A dedicated preview route (`/#chart-lab`, see client.tsx) for `test/browser/chart.spec.ts`'s
 * ROADMAP item 51 (issue #22) coverage — four `Chart.tsx` defects with no single real-consumer
 * home that cleanly isolates all of them: no real consumer accepts free-text user-entered chart
 * labels (needed for the XSS regression); no real consumer's chart sits inside a `<Theme>` at all
 * (needed to check chart chrome against a KNOWN theme, and to exercise `<Theme>` swapping live
 * under an already-mounted chart the way examples/AppShell.tsx's Control Center "Appearance"
 * control does, without also depending on everything else that control's real page renders);
 * Finance's real cash-flow chart is disclosed sample data with no loss month, and inventing one
 * there would drag an unrelated chart's own existing tests along for the ride; and the reinit/
 * setOption fix needs a controlled "recompute the same values into a new array reference" trigger,
 * not a real, hard-to-reach store write while staying mounted. Same reasoning as DensityLab.tsx/
 * ShellBreadcrumbsLab.tsx: not part of the package's public example set (`examples/`), not wired
 * into `package.json`'s `exports`.
 */

const REINIT_DATA: Record<'A' | 'B', ChartSeries> = {
  A: [
    { label: 'Alpha', value: 40 },
    { label: 'Beta', value: 65 },
    { label: 'Gamma', value: 52 },
  ],
  B: [
    { label: 'Alpha', value: 90 },
    { label: 'Beta', value: 12 },
    { label: 'Gamma', value: 70 },
  ],
};

const NEGATIVE_DATA: ChartSeries = [
  { label: 'Q1', value: 120 },
  { label: 'Q2', value: -60 },
  { label: 'Q3', value: 90 },
];

// The label IS the exploit payload: if Chart.tsx's tooltip formatter ever regresses to ECharts'
// default HTML-interpreted tooltip (`renderMode: 'html'`, its default), hovering this bar parses
// the label as markup, creates a real `<img>` element, and its `onerror` fires — setting this
// global. With the fix (`renderMode: 'richText'`), the string is drawn as inert canvas text and
// this global is never set.
const XSS_LABEL = '<img src=x onerror="window.__chartXssFired = true">';
const XSS_DATA: ChartSeries = [{ label: XSS_LABEL, value: 42 }];

const THEME_DEMO_DATA: ChartSeries = [
  { label: 'A', value: 30 },
  { label: 'B', value: 55 },
];

export function ChartLab() {
  const [dataset, setDataset] = useState<'A' | 'B'>('A');
  const [tick, setTick] = useState(0);
  const [liveTheme, setLiveTheme] = useState<'light' | 'dark'>('light');

  // Recomputed fresh on EVERY render, regardless of `tick` — the same shape
  // examples/BiExplore.tsx's own inline `.map()` derivation produces on every unrelated
  // re-render. Re-mapping `REINIT_DATA[dataset]` (rather than passing it directly) means clicking
  // "Force unrelated re-render" reconstructs a brand-new array AND brand-new point objects every
  // time, even though `dataset` itself didn't change — exactly the "new reference, same values"
  // case Chart.tsx must recognize as a no-op.
  const reinitData: ChartSeries = REINIT_DATA[dataset].map((point) => ({ ...point }));

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <section aria-label="reinit guard">
        <p>Tick: {tick}</p>
        <button type="button" onClick={() => setTick((t) => t + 1)}>
          Force unrelated re-render
        </button>
        <button type="button" onClick={() => setDataset((d) => (d === 'A' ? 'B' : 'A'))}>
          Swap dataset
        </button>
        <Chart type="bar" title="Reinit guard" data={reinitData} />
      </section>

      <section aria-label="negative values">
        <Chart type="bar" title="Negative values" valueLabel="$" data={NEGATIVE_DATA} />
      </section>

      <section aria-label="xss label">
        <Chart type="bar" title="XSS label" data={XSS_DATA} />
      </section>

      <section aria-label="light theme chrome">
        <Theme value="light">
          <Chart type="bar" title="Light theme chrome" data={THEME_DEMO_DATA} />
        </Theme>
      </section>

      <section aria-label="dark theme chrome">
        <Theme value="dark">
          <Chart type="bar" title="Dark theme chrome" data={THEME_DEMO_DATA} />
        </Theme>
      </section>

      <section aria-label="live theme chrome">
        <p>Live theme: {liveTheme}</p>
        <button type="button" onClick={() => setLiveTheme((t) => (t === 'light' ? 'dark' : 'light'))}>
          Toggle live theme
        </button>
        {/* Same wrapper shape as examples/AppShell.tsx's `themed()` when `appearance !== 'system'`
            — a single, already-mounted `<Theme>` element whose `value` prop changes, not a
            wrapper that appears/disappears (which would remount its subtree instead of live-
            recoloring it). */}
        <Theme value={liveTheme}>
          <Chart type="bar" title="Live theme chrome" data={THEME_DEMO_DATA} />
        </Theme>
      </section>
    </div>
  );
}
