---
category: data-display
tests:
  - test/browser/chart.spec.ts
  - test/components.test.ts
---

Bar, line, and donut charts from one shape: `data` (`{ label, value }[]`), `type` (`"bar" | "line" | "donut"`), a required `title` (the chart's accessible name), and an optional `valueLabel` unit shown in tooltips (`"$"`, `"units"`, …). No fetching, no live updates, no computed business logic — a caller supplies whatever sample series it already has, the same boundary every other component in this package holds. Renders via Apache ECharts' canvas renderer, registered tree-shaken through `echarts/core` + explicit imports (only the bar/line/pie chart types, the grid/legend/tooltip components, and the canvas renderer — never bare `echarts`, which registers every chart type, coordinate system, and feature the library ships). The render surface carries no accessibility tree, so every chart also renders a visually-hidden real `Table` with the same data immediately after it (that's what a screen reader actually gets — the render surface itself is `aria-hidden`); `prefers-reduced-motion` disables ECharts' own draw animation, the same as every other animated thing in this package. A `ResizeObserver` on the render surface keeps the chart matched to its container's actual size, since ECharts (unlike Chart.js) does not resize itself when its container's box changes. Not for anything needing zoom, pan, drill-in interactivity, 3D, geographic, or statistical/scientific plotting — this is a fixed, static rendering of a small series, not a general-purpose charting library's full surface.

**Why a real dependency, and why this one specifically — a reversal, not a re-litigation:** ROADMAP issue #16 (5 named consumers — Inventory's stock-by-warehouse, Finance's cash-flow trend, a Reports summary chart, a 3-chart BI dashboard, and BI explore's chart toggle) originally scoped a hand-rolled SVG primitive as the default, reserving a charting library only if those 5 usages proved insufficient. Once a library was worth adding, the actual need — bar/line/donut charts of a small ERP sample series, not maps, 3D, or scientific plotting — first ruled out the heavier options: Apache ECharts and Plotly.js were both judged built for large/complex datasets and scientific or geographic use this package will never need, at real bundle-size cost; D3.js gives the most control but means building a charting library on top of it before building a single chart. Chart.js won that first comparison and shipped first, tree-shaken to ~63KB gzipped over the package's pre-Chart baseline.

The project owner then directed a switch to ECharts anyway (2026-09-16), overriding that comparison's own conclusion rather than finding it wrong — this doc keeps the reasoning above intact because it was sound, not because it was followed. Measured, not assumed, the real cost of the switch: even trimmed to bar/line/pie + grid/legend/tooltip + the canvas renderer, ECharts adds **~188KB gzipped** to this package versus Chart.js's own ~63KB — `echarts/core` plus just the canvas renderer, with zero chart types registered, already costs ~101KB gzipped, more than Chart.js's entire footprint, because ECharts is a general-purpose visualization engine (its own coordinate-system and data-pipeline machinery, not the chart types themselves, is most of the weight); the `GridComponent` that bar/line need on top of that adds another ~33KB on its own. No amount of import-trimming closes that gap — it's the shape of the two libraries, not an integration mistake. See `src/components/Chart.tsx`'s own registration comment for the full breakdown.

```jsx
<Chart
  type="line"
  title="Revenue trend vs. target"
  valueLabel="$"
  data={[
    { label: 'Apr', value: 182000 },
    { label: 'May', value: 191000 },
    { label: 'Jun', value: 205500 },
  ]}
/>
```
