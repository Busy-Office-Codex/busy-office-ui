---
category: data-display
tests:
  - test/browser/chart.spec.ts
  - test/components.test.ts
---

Bar, line, and donut charts from one shape: `data` (`{ label, value }[]`), `type` (`"bar" | "line" | "donut"`), a required `title` (the chart's accessible name), and an optional `valueLabel` unit shown in tooltips (`"$"`, `"units"`, …). No fetching, no live updates, no computed business logic — a caller supplies whatever sample series it already has, the same boundary every other component in this package holds. Renders on `<canvas>` via Chart.js, registered tree-shaken (only the bar/line/doughnut controllers, elements, scales, legend and tooltip plugin — not `chart.js/auto`). A canvas carries no accessibility tree, so every chart also renders a visually-hidden real `Table` with the same data immediately after it (that's what a screen reader actually gets — the canvas itself is `aria-hidden`); `prefers-reduced-motion` disables Chart.js's own draw animation, the same as every other animated thing in this package. Not for anything needing zoom, pan, drill-in interactivity, 3D, geographic, or statistical/scientific plotting — this is a fixed, static rendering of a small series, not a general-purpose charting library's full surface.

**Why a real dependency, and why Chart.js specifically:** ROADMAP issue #16 (5 named consumers — Inventory's stock-by-warehouse, Finance's cash-flow trend, a Reports summary chart, a 3-chart BI dashboard, and BI explore's chart toggle) originally scoped a hand-rolled SVG primitive as the default, reserving a charting library only if those 5 usages proved insufficient. Once a library was worth adding, the actual need — bar/line/donut charts of a small ERP sample series, not maps, 3D, or scientific plotting — ruled out the heavier options: Apache ECharts and Plotly.js are both built for large/complex datasets and scientific or geographic use this package will never need, at real bundle-size cost; D3.js gives the most control but means building a charting library on top of it before building a single chart, which fights this package's one-runtime-dependency-until-now posture. ApexCharts was the closest second choice. Chart.js won on the combination this package actually optimizes for: a low learning curve, canvas performance that's plenty at ERP sample-data scale, and — registered tree-shaken rather than via `chart.js/auto` — a footprint that stays close to "the minimum that makes these screens' charts real," the same bar issue #16 set for the hand-rolled option it superseded.

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
