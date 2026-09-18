---
category: guidance
---

Named skeletons — not components — for structural patterns this system's own `examples/*.tsx` screens already repeat, so a new screen can start from a known shape instead of reinventing one. Each is a **guideline**: a purpose, a rough anatomy, and when to reach for it or avoid it — not an exported layout component. This package's own boundary rule (`AGENTS.md`) refuses screen-specific composition as a package export; these skeletons stay host/example-level composition, described here so the pattern itself doesn't have to be rediscovered per screen.

Every consumer count below was checked directly against real `examples/*.tsx` source (not recalled from memory) — a first draft of this page overclaimed two of the three counts, caught by independent review, and corrected here.

## List + detail, one route

A table where clicking a row reveals detail in the same route (a side panel or a swap of the main content) — not a navigation to a different screen. **Purpose**: fast scanning across many records with immediate detail access, no round-trip. **Real consumers**: 13 `examples/*.tsx` screens genuinely implement this (a real `onClick` sets `selectedId`, which drives which detail renders) — 10 style the selected row via `color.bgSelected` (Billing, Companies, Delivery, Integrations, Planning, ProductionOrders, Quotations, Requisitions, Roles, Users) and 3 style the selected item via `Card`'s own `selected` prop instead (Approvals, BuilderReports, BuilderScreens) — two real, distinct selection-styling mechanisms for the same structural pattern, not one uniform look. (`Invoice.tsx` also holds a `selectedId`, but never sets it from a click — it's a lookup key for whichever invoice `Billing.tsx` navigated to, not a user-facing list; it belongs under Record detail below instead, not double-counted here.) The `ListReport` example composition (`docs/ListReport.md`) is the list HALF of this pattern only — it has no inline detail panel of its own — not a packaged version of the combined pattern.

**Use** when a record's detail is small enough to view without leaving the list, and the list itself is the primary task (triage, quick lookups, bulk scanning). **Avoid** when the detail is itself a large, multi-section document (an invoice, a full order) that deserves its own route and its own URL — that's Record detail (below) instead, reached via real navigation, not inline swap.

## Record detail, two-column (main + sidebar)

A primary content column (the record's own document/body — line items, form fields, a timeline) beside a narrower sidebar of linked/contextual metadata (status, related records, history). **Purpose**: keep a record's own substance visually dominant while still surfacing what it's connected to, without a separate navigation. **Real consumers**: 8 `examples/*.tsx` screens use this two-column flex shape (a wide main column beside a ~260-360px sidebar column) — Invoice, Inventory, Notifications, Help, Profile, Settings, BuilderWorkflow, UsersAndRoles (the last puts its narrower column first — a role list beside wider permissions detail — same pattern, mirrored order). Not packaged as `RecordDetail` — that composition's own top-level layout is a single stacked column, not this two-column shape, despite the name; naming it here would have been a false claim, caught and removed.

Two real, similar-looking candidates were checked and rejected: `Approvals.tsx` (two comparable-width panes, a queue list beside its detail — that's the list+detail pattern above, using `Card`'s `selected` styling, not this one) and `Inbox.tsx` (two independently-scrolling panes with a resize divider — a different, disclosed pattern below, not this one).

**Use** for a single record that's substantial enough to want its own route (not an inline list-detail swap) and has real contextual metadata worth surfacing beside it. **Avoid** stuffing primary, editable content into the sidebar column — it's for context (status, links, history), not a second content area; a record that genuinely needs two equally-important content areas needs a different shape than this skeleton, not a strained fit into it.

## KPI / stat tile row

A row of compact metric tiles summarizing key numbers atop a page, above the page's own primary content. **Purpose**: orient a viewer with the page's headline numbers before they read the detail below. **Real consumers**: 3 `examples/*.tsx` screens — Dashboard (a real KPI stat-card grid), RolePage (a `ROLE_KPIS` grid), and `ListReport` (its own `StatTile` helper, `Awaiting approval`/`Sent to supplier`/etc.). Two screens were checked and rejected despite surface similarity: `Help.tsx` only mentions "KPI cards" in one changelog-style text string, with no actual stat-tile grid anywhere in the file; `BuilderReports.tsx`'s grid is its report-builder's own configurable widget-preview canvas (one of several widget *types* it can render, not a fixed orienting row above the page's real content).

**Use** for a page whose numbers genuinely orient the reader (a dashboard, a worklist's own totals). **Avoid** adding a stat row just because a page "could" have numbers — every tile should answer a real question a viewer of that specific page actually has; a tile with no real question behind it is decoration, not orientation (the same "less for more" test this repo's Objective 1 applies everywhere else).

## Not yet standard — disclosed, not claimed

`Inbox.tsx`'s own two-pane split (an independently-scrolling list pane beside a detail pane, with a real resizable divider — `role="separator"`, pointer-drag and keyboard) is a genuinely different shape from "list + detail, one route" above (both panes scroll independently; the divider is user-adjustable). It has exactly one real consumer today (`Inbox.tsx`) — named here for visibility, not endorsed as a repeatable standard yet, since this repo's own reuse rule (Objective 3) asks for two real, named consumers before treating a pattern as proven, not speculative. The next screen that wants this shape is real evidence toward promoting it; until then it stays "Inbox's own pattern," not "the split-pane standard."
