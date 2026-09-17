import { describe, expect, it } from 'vitest';
import { chartSeriesEqual } from '../src/components/chart-utils.js';

// ROADMAP item 51, issue #22 — the pure part of Chart.tsx's dispose()+re-init() fix. Imported
// directly from source (not `dist/`, unlike this repo's other tests in test/components.test.ts):
// `chart-utils.ts` is plain TS with no React/JSX/echarts, so it needs no build step to run, and
// isn't part of the package's public API (never re-exported from src/index.ts) — this is a unit
// test of an internal implementation detail, not a contract test of the published package.
describe('chartSeriesEqual', () => {
  it('treats the same array reference as equal without inspecting it', () => {
    const series = [{ label: 'Jan', value: 10 }];
    expect(chartSeriesEqual(series, series)).toBe(true);
  });

  it('treats two different array instances with identical label/value pairs as equal', () => {
    // The exact shape examples/BiExplore.tsx produces on every render: a brand-new array (a
    // fresh `.map()` over the same underlying store data) whose points are value-identical to
    // the previous render's — this is the case Chart.tsx must NOT treat as a real data change.
    const a = [
      { label: 'East', value: 420 },
      { label: 'West', value: 310 },
    ];
    const b = [
      { label: 'East', value: 420 },
      { label: 'West', value: 310 },
    ];
    expect(a).not.toBe(b);
    expect(chartSeriesEqual(a, b)).toBe(true);
  });

  it('treats two empty arrays as equal', () => {
    expect(chartSeriesEqual([], [])).toBe(true);
  });

  it('treats a different length as unequal', () => {
    const shorter = [{ label: 'A', value: 1 }];
    const longer = [
      { label: 'A', value: 1 },
      { label: 'B', value: 2 },
    ];
    expect(chartSeriesEqual(shorter, longer)).toBe(false);
    expect(chartSeriesEqual(longer, shorter)).toBe(false);
  });

  it('treats a different value at the same label as unequal', () => {
    expect(chartSeriesEqual([{ label: 'A', value: 1 }], [{ label: 'A', value: 2 }])).toBe(false);
  });

  it('treats a different label at the same value as unequal', () => {
    expect(chartSeriesEqual([{ label: 'A', value: 1 }], [{ label: 'B', value: 1 }])).toBe(false);
  });

  it('treats reordered points as unequal — order is significant, since it is what an axis renders left to right', () => {
    const forward = [
      { label: 'A', value: 1 },
      { label: 'B', value: 2 },
    ];
    const reversed = [
      { label: 'B', value: 2 },
      { label: 'A', value: 1 },
    ];
    expect(chartSeriesEqual(forward, reversed)).toBe(false);
  });
});
