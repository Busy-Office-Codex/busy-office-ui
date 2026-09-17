export type ChartSeriesPoint = { label: string; value: number };

/**
 * Value equality for `Chart`'s `data` prop (ROADMAP item 51, issue #22). Plain TS, no React/DOM
 * import — deliberately its own file so it stays trivially unit-testable (`test/chart-utils.test.ts`
 * imports it directly from source) without pulling in `echarts`/JSX the way `Chart.tsx` itself does.
 *
 * `Chart.tsx` used to dispose() + re-init() ECharts on every render where `data` was a NEW array
 * reference, even when every point's value was unchanged — the common case for a caller that
 * derives its series inline on every render (examples/BiExplore.tsx's own pivot aggregation, a
 * fresh `.map()` over the shared store on every render) rather than memoizing it. This is what lets
 * `Chart.tsx` recognize that case and keep the OLD reference (see its `stableDataRef` use) instead
 * of treating a same-values-new-reference `data` prop as real work.
 */
export function chartSeriesEqual(a: readonly ChartSeriesPoint[], b: readonly ChartSeriesPoint[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].label !== b[i].label || a[i].value !== b[i].value) return false;
  }
  return true;
}
