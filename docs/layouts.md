---
category: guidance
---

Named skeletons — not components — for structural patterns this system's own `examples/*.tsx` screens already repeat, so a new screen can start from a known shape instead of reinventing one. Each is a **guideline**: a purpose, a rough anatomy, and when to reach for it or avoid it — not an exported layout component. This package's own boundary rule (`AGENTS.md`) refuses screen-specific composition as a package export; these skeletons stay host/example-level composition, described here so the pattern itself doesn't have to be rediscovered per screen. `ListReport`/`RecordDetail` (`docs/ListReport.md`, `docs/RecordDetail.md`) ARE real exported compositions of two of the skeletons below — reach for those directly when their exact shape fits; this page is for the broader pattern and its variations, including the many `examples/*.tsx` screens that compose their own version rather than using those two exports.

## List + detail, one route

A filterable/searchable table where selecting a row reveals detail in the same route (a side panel, an inline expansion, or a swap of the main content) — not a navigation to a different screen. **Purpose**: fast scanning across many records with immediate detail access, no round-trip. **Real consumers**: 14 `examples/*.tsx` screens use this exact shape (`selectedId` state, `row.id === selectedId` driving both row highlight via `color.bgSelected` and which detail renders) — Billing, Companies, Delivery, Integrations, Planning, ProductionOrders, Quotations, Requisitions, Roles, Users, and others. Packaged as the `ListReport` example composition when the list is the whole screen.

**Use** when a record's detail is small enough to view without leaving the list, and the list itself is the primary task (triage, quick lookups, bulk scanning). **Avoid** when the detail is itself a large, multi-section document (an invoice, a full order) that deserves its own route and its own URL — that's Record detail (below) instead, reached via real navigation, not inline swap.

## Record detail, two-column (main + sidebar)

A primary content column (the record's own document/body — line items, form fields, a timeline) beside a narrower sidebar of linked/contextual metadata (status, related records, history). **Purpose**: keep a record's own substance visually dominant while still surfacing what it's connected to, without a separate navigation. **Real consumers**: 9 `examples/*.tsx` screens use this two-column flex shape (a wide flex-basis main column beside a ~280-360px sidebar column) — Invoice, Approvals, Inventory, Notifications, Help, Profile, Settings, BuilderWorkflow. Packaged as the `RecordDetail` example composition.

**Use** for a single record that's substantial enough to want its own route (not an inline list-detail swap) and has real contextual metadata worth surfacing beside it. **Avoid** stuffing primary, editable content into the sidebar column — it's for context (status, links, history), not a second content area; a record that genuinely needs two equally-important content areas needs a different shape than this skeleton, not a strained fit into it.

## KPI / stat tile row

A row of `StatTile`s (or an equivalent compact metric card) summarizing key numbers atop a page, above the page's own primary content. **Purpose**: orient a viewer with the page's headline numbers before they read the detail below. **Real consumers**: 5 `examples/*.tsx` screens — Dashboard, BuilderReports, ListReport, RolePage, Help.

**Use** for a page whose numbers genuinely orient the reader (a dashboard, a worklist's own totals). **Avoid** adding a stat row just because a page "could" have numbers — every tile should answer a real question a viewer of that specific page actually has; a tile with no real question behind it is decoration, not orientation (the same "less for more" test this repo's Objective 1 applies everywhere else).

## Not yet standard — disclosed, not claimed

`Inbox.tsx`'s own two-pane split (an independently-scrolling list pane beside a detail pane, with a real resizable divider — `role="separator"`, pointer-drag and keyboard) is a genuinely different shape from "list + detail, one route" above (both panes scroll independently; the divider is user-adjustable). It has exactly one real consumer today (`Inbox.tsx`) — named here for visibility, not endorsed as a repeatable standard yet, since this repo's own reuse rule (Objective 3) asks for two real, named consumers before treating a pattern as proven, not speculative. The next screen that wants this shape is real evidence toward promoting it; until then it stays "Inbox's own pattern," not "the split-pane standard."
