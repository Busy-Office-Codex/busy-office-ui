---
category: sample-page
tests:
  - test/browser/chart.spec.ts
  - test/browser/page-composition.spec.ts
  - test/browser/focus-ring-and-placeholder.spec.ts
  - test/browser/mobile-responsive.spec.ts
---

`examples/Dashboard.tsx` — a KPI dashboard home page (route id `dashboard`, module `BI`), composed only from package components (`Button`, `Card`, `Chart`, `Chip`, `Text`). Mirrors the "dashboard" Claude Design template. Not for a Claude Design canvas template — the KPI cards' selected state is real `useState`, and `Chart` renders to a `<canvas>` at runtime (client-side, via ECharts); use it as a buildable page composition, not a static template.

Theme-safe: the page's own background and every layout gap read `color.bgCanvas`/`space.*` from `src/tokens.stylex.ts` rather than raw hex/pixel literals — see `docs/design-conventions.md`'s "Theme-safe page chrome" recipe.

Unlike `ListReport`/`RecordDetail`, this page has no `state` prop — it is always "ready"; there is no loading/error/forbidden case.

- **Greeting**: a static heading plus a one-line summary ("Here's what needs your attention today.").
- **KPI cards**: a 4-column grid (Open orders, Pending approvals, Overdue invoices, Revenue this month), each a real `Card` with `selected`/`onClick` — clicking one sets local `selected` state (`Card`'s accent border ring), demonstrating the selectable-tile pattern without wiring it to anything else on the page. "Overdue invoices" and "Revenue this month" pair their headline figure with a status `Chip`/caption for extra context.
- **Revenue trend**: a real `Chart` (`type="line"`), the package's first real `Chart` consumer (issue #16's "19 · BI dashboard" scenario) — its 6-month trend ends at the same `$486K`/`+6.4%` the "Revenue this month" KPI card above states, so the chart and the card agree with each other rather than each inventing its own number for the same fact. See `docs/Chart.md` for the component's own accessibility contract (a paired visually-hidden `Table`, `prefers-reduced-motion` handling).
- **Footer**: a single secondary `Button` ("View full report") — illustrative, not wired to a route.

```jsx
<Dashboard />
```
