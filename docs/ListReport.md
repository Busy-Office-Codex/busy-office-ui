---
category: sample-page
tests:
  - test/sample-page-states.test.ts
  - test/browser/sample-pages-states.spec.ts
  - test/browser/sample-pages-navigation.spec.ts
  - test/browser/compact-controls.spec.ts
  - test/browser/dropdown-focus.spec.ts
  - test/browser/focus-ring-and-placeholder.spec.ts
  - test/browser/design-fidelity-fixes.spec.ts
  - test/browser/shell-focus.spec.ts
  - test/browser/table-header-contrast.spec.ts
  - test/browser/table-row-separator.spec.ts
  - test/browser/table-row-uniformity.spec.ts
  - test/browser/list-report-checkboxes.spec.ts
  - test/browser/page-composition.spec.ts
---

`examples/ListReport.tsx` — a filterable purchase-order list page (route id `purchase-orders`, module `Purchase`), composed only from package components (`Button`, `Card`, `Chip`, `Dropdown`, `Input`, `Table`, `Text`). Rebuilt against `templates/erp-skeleton/ErpSkeleton.dc.html`'s "14 · Purchase order" section in the "Busy Office Design System" Claude Design project — a specific business mockup — rather than the generic `templates/list-report` template it previously mirrored. It renders the header, stat-tile strip, and filter/search toolbar unconditionally, and takes a `state?: 'ready' | 'loading' | 'error' | 'forbidden'` prop (default `'ready'`) that controls what appears below the toolbar, in place of the table region. Not for a Claude Design canvas template — its `Dropdown` usage requires real JSX (see `docs/design-conventions.md`); use it as a buildable page composition, not a static template.

Theme-safe (2026-09-16): the page's own chrome (background, table-region border, skeleton colors, all spacing) reads `color.*`/`space.*`/`radius.*` from `src/tokens.stylex.ts` rather than raw hex/pixel literals, so it re-tints correctly under `Theme`/`prefers-color-scheme` dark mode — see `docs/design-conventions.md`'s "Theme-safe page chrome" recipe.

- **Header**: `Purchase orders` heading, a `Button variant="secondary"` ("From requisition") and a `Button variant="primary"` ("+ New PO").
- **Stat tiles**: a 4-column grid — Awaiting approval, Sent to supplier, Due to receive this week, Open commitments — each computed from the sample `ORDERS` data. Each tile is a real `Card` (no `onClick`, so it renders as a static, non-interactive tile) — the same component `RecordDetail`'s summary cards and `Dashboard`'s KPI tiles already used, one tile implementation across all three sample pages (ROADMAP item 14). `Card`'s 16px padding vs. the `templates/erp-skeleton` reference's own measured 14px is a disclosed deviation, accepted rather than adding a new `Card` padding variant for a 2px difference.
- **Toolbar**: a search `Input` ("Search POs…", matching against PO #, supplier and buyer) plus four `Dropdown` filters — Supplier, Status, Buyer, Expected.
- **Table columns**: a row-selection checkbox column, then PO #, Supplier, Buyer, Expected, Received, Total (end-aligned), Status (a status `Chip`). The checkbox column has proper `aria-label`s ("Select PO-1042", "Select all rows") for accessibility; selection is local UI state (no server call), same as the search/filter state.

- **`'ready'`** (default): shows the real `Table` of purchase orders, filterable by the toolbar's search and four dropdowns, and stat tiles showing real computed numbers. **Empty** is a reachable case of `'ready'`, not a separate literal — when the toolbar's filters match zero orders, the table body shows one caption row reading "No purchase orders match these filters." instead of a distinct empty-state prop, since it is entirely a consequence of the toolbar's own filter state.
- **`'loading'`**: the table region is replaced by an announced `role="status"` (`aria-label="Loading purchase orders"`) shimmer skeleton — matching the owner's loading screenshot of this reference screen: the 4 stat tiles show gray shimmer bars instead of numbers, and every one of the 8 skeleton rows' 7 data cells shows a shimmer bar instead of text. This skeleton is deliberately **not** a real `<table>` (a fake table risks a screen reader announcing placeholder shimmer as real tabular data) — it's a `div`-based grid that mirrors the real table's column layout. The checkbox column stays real (disabled `<input type="checkbox">`s, both the header "select all" and one per skeleton row) since which rows exist isn't in question, only their content.
- **`'error'`**: the table region is replaced by a `role="alert"` message plus a retry-shaped `Button` ("Retry").
- **`'forbidden'`**: the table region is replaced by an announced `role="status"` message explaining that purchasing access is restricted.

```jsx
<ListReport state="loading" />
<ListReport state="error" />
<ListReport state="forbidden" />
<ListReport /> {/* state="ready", the default */}
```
