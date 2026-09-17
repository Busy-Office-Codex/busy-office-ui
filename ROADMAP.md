# UI framework roadmap

## Objective

**Busy Office hosts import one small, dependable UI package instead of
rebuilding presentation and interaction per screen** (see `intent.md`). The
framework stays lean: simplicity is the first test and wins every tie. Every
proposal to add, change or remove anything passes these three tests before it
becomes an item. "It would be useful" is not enough on its own.

1. **Simplicity — less for more.** *Accept* when the change removes more host
   code or decisions than the API it adds, or deletes code outright. *Refuse* a
   prop, variant or component with one caller. *Rethink* when a composition of
   existing exports already does the job.
2. **Boundary.** *Accept* presentation or interaction a host would otherwise
   reimplement. *Refuse* anything that needs ERP data, business rules,
   permissions or a runtime. *Rethink* screen-specific composition: it belongs
   in `examples/` or the host.
3. **Proven reuse.** A new shared component needs two named consumers (host
   screens or examples) with a concrete scenario, raised as a `[UI request]`
   issue. Suitability at the point of use beats reuse.

## Milestone

The loop works only on the current milestone and stops when it is complete.
The owner sets the next one.

**M1 — Accessible core, docs that cannot drift — complete.** Items 4, 5, 6, 7
are all `[x]`; the full gate suite (including `pnpm test:browser`) passed at
the batch head before it merged into `main`. A release recommendation is
recorded in that merge commit — the owner decides whether to cut it.

**M2 — Prove the framework with real sample pages — UI side complete.** Item
3, issue #11 (`agreed`, project owner, 2026-09-13); landed at `e419e4b`. The
one open clause — the core session records `accepted` on #11 — is an
acknowledgement, not a build item, so M2 stops the loop for nothing and M3
proceeds; item 3 flips to `[x]` when that comment lands.

**M3 — One density tier, realigned to the ERP skeleton — complete.** Items
10–14, issue #12 (`agreed`, project owner, 2026-09-14); landed at `77b9e43`. A
host sets one density (`compact` / `comfortable` / `spacious`) on any wrapper
and every control, row and label follows; the sample screens measure against
the ERP skeleton reference instead of approximating it. Set by the owner
after a grilled review (2026-09-14): the "too big at 100%" impression was
traced, with measurements, to ink weight, vertical budget and a missing
13/14px tier — not to the type scale — so a uniform 90% scale was refused.
The full gate suite (including `pnpm test:browser`, 76/76) passed at each
batch head before merging into `main`; the Claude Design project is re-synced
(`/design-sync`, 2026-09-14 — the new `Density` component plus 10
density-wired components re-verified). **`0.4.0` cut and released** for the
whole of M3 (items 10–14: the density tier, filter/action hierarchy, Table
alignment, Shell chrome on tokens, page composition), owner approval
2026-09-14.

**M4 — Docs website for `@busyoffice/design-system` — complete.** Item 15,
issue #14 (`agreed`, project owner, 2026-09-14). The framework stopped
expanding after M3 (no new component, prop or export cleared the Objective
tests in the open backlog); item 15 documents the system that has stopped
moving instead of adding to it — see item 15 below for full scope, the
hosting decision and the verify-review fixes.

**M5 — Remove the deprecated `size`/`density` per-instance overrides —
complete.** Item 16, issue #15 (`agreed`, project owner, 2026-09-14).
Follow-up to item 10: `Button.size` and `Table.density` were removed from
the public `.d.ts` surface once every real call site (`src/shell/Shell.tsx`,
`examples/{AppShell,ListReport,RecordDetail}.tsx`, 12 Button/Table uses
total) migrated to wrapping its region in `<Density value="compact">`.
`Input`'s `size="compact"` (2 real call sites, both search-bar fields) was
un-deprecated instead of migrated, renamed to `size="search"`: the owner's
resolution (issue #15) of the height question this item raised — its fixed
36px never tracked any density tier (`Density`'s compact `rowHeight` is
32px, a different concept), so treating it as a density override was the
original mistake, not something worth preserving through a migration. A
required three-lens verify review (this batch closed M5) found and fixed a
real gap before merge — see item 16 below.

**M6 — Sample pages for every desktop screen in the ERP skeleton reference —
complete.** Items 17–33, issue #17 (`agreed`, project owner, 2026-09-14).
Owner-directed (2026-09-14): the Claude Design project's `templates/
erp-skeleton/ErpSkeleton.dc.html` ("a gray wireframe canvas of every ERP
page") has 24 distinct desktop screens; only 3 were mirrored before this
milestone (`Launcher`≈Home, `RecordDetail`≈Sales order detail,
`ListReport`≈Purchase order). 16 buildable from existing components landed
across 4 batches; 5 (Inventory, Finance, Reports, BI dashboard, BI explore)
stayed blocked on a proposed `Chart` primitive (issue #16, still
`proposed`) and were never items in this milestone. Structural first pass
throughout, per owner decision: real components, correct composition and
content matching the reference's own labels/data — not independently
pixel-measured or contrast-audited (a later, separate fidelity pass,
screen-by-screen, the way item 12 did it, remains open). `AppShell.tsx`'s
route registry and `preview/client.tsx`'s routing were rebuilt
incrementally batch by batch — the prior 3-route preview is now 20 real
routes plus `#login`'s standalone mount, and General/Sales/Administration/
Builder each gained real app-strip siblings for the first time (closing a
previously disclosed gap in `docs/Shell.md`/`test/browser/shell-chrome-
color.spec.ts`). Every batch that closed the milestone (batch 4) went
through this repo's required 3-lens review (spec-match, contrast/
accessibility, simplicity); the simplicity lens found and fixed one real
cross-milestone duplication (`examples/filterTabs.tsx`, extracted from 9
call sites across 8 files) before merge.

**M7 — Chart primitive (issue #16), Icon (#18), real theming (#19), Shell
breadcrumbs (#20) — in progress.** Issues #18/#19/#20 marked `agreed` by the
project owner, 2026-09-16 (via direct instruction, recorded here rather than
as a separate issue comment — the same precedent issue #16's own `agreed`
citation below already set), expanding this milestone's scope beyond item 34
alone; items 35–37 below track them. Item 34, issue #16
(`agreed`, project owner, 2026-09-16 — was `proposed` since M6). Owner-
directed: build the primitive M6 deferred, using a real charting library
(Chart.js) rather than issue #16's own original hand-rolled-SVG default,
once the owner reviewed a 5-library comparison (ECharts, ApexCharts,
Chart.js, Plotly.js, D3.js) and decided a dependency was worth it. Chart.js
won on fit, not raw capability: this package only ever needs bar/line/donut
at ERP-sample-data scale, which ruled out ECharts/Plotly's large-dataset/
scientific/geographic strength as unneeded weight, and D3's "build a
charting library on top of D3 before building a chart" cost against a
package that had exactly one runtime dependency before this. Registered
tree-shaken (`BarController`/`LineController`/`DoughnutController` +
elements/scales/`Legend`/`Tooltip` only, never `chart.js/auto`), and — a
finding surfaced while wiring it up, not assumed in advance — the whole
package had no `package.json` `sideEffects` declaration, so no consumer
ever got real tree-shaking even before this; added `"sideEffects": false`
and moved `Chart`'s own `ChartJS.register(...)` off the module top level
(a real side effect that would have defeated that declaration for this one
file) into a first-render guard. Measured, not assumed: a host importing
only `{ Button }` now ships 5.5KB minified/1.9KB gzipped with zero chart.js
code (verified directly — grepped the bundle), while a host using `Chart`
pays chart.js's real cost, ~201KB minified/~69KB gzipped for the whole
package (was ~20KB/~6.4KB before Chart existed). Accessibility: canvas
carries no accessibility tree, so `Chart` renders `aria-hidden` and pairs
it with a real, visually-hidden `Table` of the same data as what a screen
reader actually gets — not an `aria-label`/`aria-describedby` summary.
`prefers-reduced-motion` disables Chart.js's own draw-in animation
(matching `motion.stylex.ts` elsewhere); found live while verifying this,
not assumed: an early screenshot caught the chart mid-animation with a
fully-drawn grid/axes but an invisible data line — not a rendering bug,
but proof the default ~1s animation needs accounting for in both real
usage and tests, not just documentation. First real consumer landed:
Dashboard.tsx's "Revenue trend" line chart (issue #16's own "19 BI
dashboard" scenario), sharing its $486K/+6.4% figures with the existing
REVENUE THIS MONTH stat card rather than inventing a second number for
the same fact. Inventory.tsx's own "15 Inventory" scenario landed in the
same wave (stock-by-warehouse bar + a mix-by-material donut, both real
consumers reading live `stockLevels`). Corrected here (2026-09-16, this
text previously listed the Inventory chart as still open after it had
already landed): the 3 genuinely remaining named consumers are "17
Finance — cash flow, 12 months" (the Finance module has no real screen at
all yet — a NAV placeholder only, so this is a new-screen-plus-chart
effort, not a one-chart addition), "18 Reports" (BuilderReports.tsx's own
Preview stays structural by design — see its header comment — a real
Chart there needs live aggregations, several not computed anywhere yet),
"19 BI dashboard"'s other 2 charts ("by region" bar, "mix" donut —
Dashboard.tsx already exists and already has real revenue data, so this
one doesn't need a new route), and "20 BI explore" (a new pivot-result
screen needing its own new route, and issue #16's own "Pie" ask — `Chart`
today only has `'bar' | 'line' | 'donut'`, no `'pie'` variant). Each is
its own separate, reviewed slice, per this repo's own "manageable
slices" discipline — not a punch list to clear in one batch.

Redirected (owner-directed, 2026-09-16, in progress): the rendering engine
moves from Chart.js to ECharts — a reversal of this milestone's own earlier
Chart.js decision above, made now rather than revisited from scratch; the
Boundary discipline that decision already established stays the rule, not
the specific library — `Chart`'s public `ChartProps`/`ChartSeries` shape
stays byte-for-byte the same, so every real consumer (Dashboard, Inventory
×2, Planning, Analytics) renders identically and ECharts itself is never
imported or referenced outside `src/components/Chart.tsx`. `SHELL_MAX_ROUTES`
(`src/shell/Shell.tsx`) was also raised 32→40 (owner-directed, 2026-09-16) —
it was a bare defensive array-length sanity check, not a reasoned ceiling,
and sat at exactly 32/32 after item 13, blocking any new route the Finance
module or BI explore would need.

Further expanded (owner-directed, 2026-09-17, issue #21): a website, content
and sample-app reorganization — items 40–48 below track it. This is not
framework expansion (no new component, prop or export), so it doesn't need
the Objective tests below; it's the "documentation" and "pure examples"
half of `intent.md`'s own scope, following an audit-first process (six
parallel read-only agents over docs-site pages/nav, `docs/*.md`, all 45
`examples/*.tsx`, preview labs + quality gates, the generated-refs
pipeline, and the reference repo's IA — findings and a compact old→new
content map are in issue #21). Real click-through navigation between
sample screens (list → detail → edit → confirmation) is explicitly OUT of
this scope — it would be new interactive behavior in `examples/`, not a
content reorg, and needs its own proposal.

After M6, or once its scope is exhausted, stop expanding the framework: new
work starts only from a request that passes the Objective tests. M7 is the
one exception already in flight; after it closes, this line applies again
until the next request clears the same bar.

## Items

Format: `[x]` done · `[ ]` open · `[?]` proposed (needs an agreed issue).
**Accept** names the property a test checks, never the expected value.
**Serves** names the Objective test or `intent.md` clause. Keep open items
plus at most 10 closed one-liners here; detail lives in commit messages and
issues.

1. [x] Dialog accessibility and command-palette focus containment — PR #3
   (`d27f653`).
2. [x] Minimal reusable shell API, `@busyoffice/design-system/shell` 0.2.0 —
   issue #5, PR #6 (`1986ef0`).
3. [ ] **Prove the framework with the Purchase Orders and Sales sample pages.**
   Accept: the preview host renders both pages only through `Shell` from the
   `./shell` subpath; a browser test crosses between them by command palette
   and dock, and confirms the app strip reflects and can reassert the active
   page (each page is the sole route in its own module here, so app strip has
   no sibling to cross to — verified against `Shell.tsx`'s own `stripRoutes`
   filter, not assumed), checking `aria-current` and the visible page heading
   after each move; each page documents its loading, empty, error and
   permission states in `docs/`; the core session records `accepted` with the
   commit it tested. Serves: Objective 1. Needs: issue #11 (`agreed`, project
   owner, 2026-09-13).
4. [x] Modal on the native `<dialog>` element — `showModal()`/`close()` driven
   by `open`; background content is genuinely `inert` (not just `aria-modal`),
   verified directly since neither `getByRole()` nor `ariaSnapshot()` reflect
   dialog inertness — `a80dce4`, inertness regression test `fab0212`.
5. [x] State is never carried by colour alone — `Card` `selected`/`disabled`
   and filter `Chip` `selected` now expose state both programmatically
   (`aria-pressed`/`aria-disabled`) and by a non-colour cue; enumerated in
   `test/state-channels.test.mjs` — `882c2b5`. Known gap: a `Card` with
   `selected` and no `onClick` still has no programmatic channel (no button
   role to hang `aria-pressed` on); latent today, no real caller does this.
6. [x] Docs cannot drift from components — `test/docs-contract.test.mjs`
   discovers every component doc from the package's own export lines and
   checks `category`, a "Not for" sentence, an example, no hand-written prop
   table, and a `tests:` list of real backing test files — `2eb1964`. That
   last check verifies the doc names real, non-empty tests, not that a given
   sentence maps to a given assertion (disclosed weaker reading; sentence-level
   correspondence isn't mechanically decidable).
7. [x] Point agent instructions at the central integration repository —
   `c03bc2e`. Issue #8 (`agreed`) handoff posted citing this commit.
8. [x] Sample screens aligned to the real ERP skeleton density reference;
   `Dropdown` keyboard/listbox support, `Chip`/`Card` focus-visible rings and
   `Input` placeholder contrast closed (owner-directed, not a milestone item)
   — `0158a19`.
9. [x] Compact `size`/`density` on `Button`/`Input`/`Table` (0.3.0) — closes the
   gap item 8 found; `Shell`'s app-strip nav and the sample host's "+New"
   action moved back onto real `Button` now that it has a compact size. Issue
   #10 (`agreed`), owner-directed — `f0e9748`.
10. [x] Density tier — `density` var group (`controlHeight`/`rowHeight`/
    `cellPaddingX`/`cellPaddingY`/`fieldGap`/`fontSize`, `rem`, compact 28/32/13
    · comfortable 36/40/14 · spacious 44/48/15) and the `Density` component;
    `Button`/`Input`/`Dropdown`/filter-`Chip`/`Table`/`Shell`'s palette trigger
    read it ambiently, `size="compact"`/`density="compact"` kept as deprecated
    per-instance overrides; `sizeControl`(13)/`sizeUi`(14) added to the type
    scale. Issue #12 (`agreed`) — `2dc8370`, fixed `7f50778`.
11. [x] Filter and action hierarchy — `Dropdown` gained an `active?`
    prop (falls back to `items.some(selected)` when omitted) driving the
    trigger's fill, separate from real rest/hover/`:active`/open states;
    keyboard-highlighted options carry a real indicator instead of a
    1.11:1 tint; the listbox keeps a focus-visible ring while open. Issue
    #12 (`agreed`) — `e422e07`.
12. [x] Table aligned to the reference and AA — header cells now
    `textSecondary` on `bgCanvas` (was `textTertiary`/`bgSubtle`,
    4.34:1 → 7.24:1 AA); new `color.borderSubtle` token for row
    separators; `Chip`'s danger tone fixed to `border-box` so every
    row is uniform height; `ListReport`'s selection checkboxes styled
    (16px, radius 4, `borderStrong`, shared focus ring — no `Checkbox`
    export, single consumer). Issue #12 (`agreed`) — `7c3069b`, fixed
    `36f5045`, `d19ecee`.
13. [x] Shell chrome on tokens — root `color: textPrimary`; dock count
    badge rebuilt inside the tile button at reference size (dims with a
    disabled tile, part of its accessible name); palette gets compact
    controls, `textSecondary` contrast, and Enter-runs-highlighted-command
    keyboard support; inactive strip tabs `textSecondary`; notification
    button gets hover/focus states; a unit test greps `Shell.tsx`/
    `AppShell.tsx` against `tokens.stylex.ts`'s own literals. Issue #12
    (`agreed`) — `022034e`, fixed `2835601`, `c95f6ef`.
14. [x] Page composition on the reference frame — all three sample pages
    on the reference's 24px content padding, left-aligned (heading x=24
    on all three at 1280px, was 40/160/80); no page scrolls into empty
    canvas (`scrollHeight`=800px viewport for all three, was up to
    +325px of void); preview host resets the UA body margin, banner
    fixed out of flow and clear of the dock's footprint; Purchase-orders
    stat tile is a real `Card` (16px-vs-14px padding a disclosed
    deviation); `Input` `border-box` (`Chip`'s `filter` variant
    investigated, already `border-box` by UA default — no bug, no fix).
    Issue #12 (`agreed`) — `d5e5047`, fixed `edb62ee`.
15. [x] **Docs website.** `docs-site/` (Astro + `@astrojs/react`), a new
    workspace member — one page per `docs/*.md` (discovered from the
    collection, not hardcoded), each rendering its fenced sample as a real,
    hydrated live demo against the actual built package (`@busyoffice/
    design-system`, `/shell`, `/examples/list-report`, `/examples/record-
    detail` — documented subpaths only, package `exports`/`dist`/`src`
    untouched); a tokens page reading real values out of `src/tokens.
    stylex.ts`; a density page with a live three-tier comparison; four
    sample-screen pattern pages (Launcher, ListReport, RecordDetail,
    Dashboard); a conventions page. No search, versioning or build-time
    check scripts beyond the link check, per v1 scope. Hosting: the
    container route (owner decision, 2026-09-14, not Cloudflare Pages — no
    new external account) — `.github/workflows/docs.yml` builds the root
    package + docs-site, runs the link check, and pushes a container image
    to `ghcr.io` on every push to `main` using the built-in `GITHUB_TOKEN`;
    CI does not reach the maintainer's local podman host directly, matching
    how `busy-office-ui-preview` is already run there manually.
    A three-lens verify review (spec-match, contrast/accessibility,
    simplicity) found and fixed, before merge: 5 of 13 doc pages had a
    broken live demo (undefined refs / an unmatched ```tsx fence / an
    unrenderable Fragment-wrapped IIFE — see `db0e06f`/`ee8ba75`), and a
    docs-site-only dark-mode media query gave `.live-demo` the exact hex of
    Button's primary ink fill, making it (and Text/Dropdown/filter-Chip)
    invisible to OS-dark-mode viewers — `@busyoffice/design-system` reads no
    `prefers-color-scheme` anywhere, so the docs canvas was pinned light
    instead. Full gate suite green at the batch head (`pnpm test` 94/94,
    `pnpm test:browser` 76/76); docs-site's own build + 20/20-page link
    check clean; all 5 fixed pages and the contrast fix manually confirmed
    live in Chrome. Serves: intent.md "documentation". Issue #13/#14
    (`agreed`, project owner, 2026-09-14).
16. [x] **Remove the deprecated `size`/`density` per-instance overrides.**
    Every live Button/Table call site (`src/shell/Shell.tsx` x2,
    `examples/AppShell.tsx` x1, `examples/ListReport.tsx` x3,
    `examples/RecordDetail.tsx` x6 — one wave-1 workflow agent per file,
    isolated worktrees, exact wrap boundaries pre-specified to avoid a
    layout regression at any flex-item-owning container) migrated from
    `size="compact"`/`density="compact"` to a wrapping
    `<Density value="compact">` region; `Button.size`/`ButtonSize` and
    `Table.density`/`TableDensity` then removed from the public `.d.ts`.
    `Input`'s 2 real call sites (Shell's command palette, ListReport's PO
    search) renamed `size="compact"` → `size="search"`, un-deprecated
    rather than migrated — the owner's resolution (issue #15) of the
    36px-vs-32px question this item raised: that height was never a
    density concept, so it was never meant to track the compact
    `rowHeight` tier. `docs/{Button,Input,Table,Shell,Density,
    design-conventions}.md` updated; docs-site rebuilt. A required
    three-lens verify review (this batch closed M5) found `docs/Shell.md`
    and `docs/Density.md` still asserted the removed props as live —
    fixed before merge, along with two minor test/formatting nits. Full
    gate suite green (`pnpm test` 94/94, `pnpm test:browser` 76/76,
    pixel-identical to pre-migration — confirming the Density wraps
    changed no visible output); docs-site rebuilds clean, 20/20 links
    resolve, zero stale prop references outside intentional history
    sentences. Serves: Objective 1 (simplicity — one way to get compact
    sizing, not two). Issue #15 (`agreed`, project owner, 2026-09-14).
17. [x] Login (01) — `examples/Login.tsx` rebuilt as a two-column screen
    (workspace switcher, email/password, "Continue with SSO", a
    remember-device row, brand panel) mirroring the fuller erp-skeleton
    reference, replacing the simpler `templates/login`-based version —
    one login example, not two. Standalone, reachable via `#login` (not
    Shell-routed — it precedes the shell conceptually). Built by one of 4
    parallel workflow agents (isolated worktrees). Issue #17.
18. [x] Role page (03) — `examples/RolePage.tsx`, module General. KPI tile
    row, a work-queue `Table`, shortcuts, and a team/delegation panel
    behind the same filter-`Chip`-as-tabs pattern item 21 established.
    Issue #17.
19. [x] Inbox (04) — `examples/Inbox.tsx`, module General. Two-pane thread
    list + detail: a real, controlled `Dropdown` filter that actually
    narrows the list, linked-record context `Card`, a message thread, a
    reply composer. Issue #17.
20. [x] Notifications (05) — `examples/Notifications.tsx`, module General.
    Grouped notification list (Today/Yesterday) with inline actions, a
    channel-preferences panel sharing `examples/checkboxStyles.ts`. Issue
    #17.
21. [x] Profile (07) — `examples/Profile.tsx`, module General. Avatar/name
    header, a filter-`Chip`-as-tabs row (no `Tab` component in this
    package — reuses the same selection affordance Shell's palette
    category row already does), 8-field settings form. Reachable via the
    command palette (`general/profile`-style wiring in
    `preview/client.tsx`). Issue #17.
22. [x] Help (08) — `examples/Help.tsx`, module General. Setup checklist
    (3 of 6 complete), a guided-tour `Card`, and docs/shortcuts/support
    link lists. General now has 5 real routes (with item 21), giving the
    app strip its first genuine sibling set — closed a previously
    disclosed gap (docs/Shell.md, `test/browser/shell-chrome-color.spec.ts`):
    an inactive app-strip item's `:hover` radius is now confirmed directly,
    not just inferred. Issue #17.
23. [x] Customers (09) — `examples/Customers.tsx`, module Sales. Search
    plus four `Dropdown` filters (Segment/Region/Owner/Status), a `Table`
    of 10 customers, no row selection. Issue #17.
24. [x] Sales order — list (10) — `examples/SalesOrderList.tsx`, module
    Sales, route label "Sales orders" (plural) — a new `NAV.Sales` entry
    added alongside the existing singular "Sales order" (RecordDetail.tsx's
    detail view, kept untouched). Status tabs, search plus three
    `Dropdown` filters, a `Table` of 9 orders. Sales now has 5 real
    routes, its first genuine app-strip sibling set (matching General
    after item 22). Issue #17.
25. [x] Delivery — list view (12) — `examples/Delivery.tsx`, module Sales.
    A view-toggle row (List/Board/Map/Calendar, only List has real
    content — the other three deferred, present but inert) and status
    tabs above a `Table`, plus a tracking-timeline detail panel for one
    delivery. Issue #17.
26. [x] Invoice (13) — `examples/Invoice.tsx`, module Sales. Two-column
    document layout: an invoice `Table` with subtotal/tax/total, and a
    sidebar of payment status, payments received, linked records, and a
    history log. Issue #17.
27. [x] Approvals (16) — `examples/Approvals.tsx`, module General (the
    cross-module queue screen, now General's 6th real route). Category
    tabs, a real click-to-select queue list, and a detail pane with
    Approve/Reject/Request changes actions. Issue #17.
28. [x] Admin overview (21) — `examples/AdminOverview.tsx`, module
    Administration. A 9-card admin-area grid plus a recent-activity panel
    with a status `Chip`. Issue #17.
29. [x] Users and roles (22) — `examples/UsersAndRoles.tsx`, module
    Administration, route label "Users and roles" — a new NAV entry
    (the reference screen is one unified editor covering both concepts;
    NAV's separate "Users"/"Roles" stay as unbuilt placeholders,
    untouched). A role list plus a real 6×6 (36-cell) permissions matrix
    `Table` of individually-labeled checkboxes. Issue #17.
30. [x] Builder — forms (23) — `examples/BuilderForms.tsx`, module
    Builder. Static 3-pane layout (field/layout/block palette, a form
    preview, a field-properties panel) — no drag-and-drop, no new
    dependency. Issue #17.
31. [x] Builder — workflow (24) — `examples/BuilderWorkflow.tsx`, module
    Builder. A static vertical step-flow (trigger → condition → approval
    → actions) with an approval-step config panel — no drag/diagram
    library. A required 3-lens review (this batch closed M6) found the
    config panel was wired with more interactivity than its own "static"
    docstring and its sibling BuilderForms.tsx's Properties panel both
    called for; simplified to match before merge, along with extracting
    the filter-Chip-as-tabs pattern (by then duplicated 9 times across 8
    files) to `examples/filterTabs.tsx`. Issue #17.
32. [x] Settings (25) — `examples/Settings.tsx`, module Settings, route
    label "General" (matching `NAV.Settings`'s own first entry and the
    reference's own header). Company fields, four `Dropdown` value
    pickers (deliberately `active={false}` — these are value pickers, not
    narrowed filters, see docs/design-conventions.md's `active` contract),
    Modules toggle rows sharing `examples/checkboxStyles.ts` with
    ListReport.tsx (extracted once this file became its second real
    consumer — a batch-1 review finding, fixed before merge). Issue #17.
33. [x] Rebuilt `preview/client.tsx`'s routing to host every item above
    plus the 3 pre-M6 pages — done incrementally, batch by batch,
    replacing the original 3-route preview with 20 real routes (General
    6, Sales 5, Administration 2, Builder 2, Settings 1, Purchase 1, BI
    1) plus `#login`'s standalone mount, rather than one big-bang rewrite
    at the end. `AppShell.tsx`'s `NAV` map expanded twice (`"Sales
    orders"`, `"Users and roles"`), each purely additive. Every item
    17–32's page confirmed reachable via app strip and/or command
    palette (verified route-by-route by a required milestone-closing
    review); `pnpm test:browser` 77/77 green. Issue #17.
34. [ ] Chart primitive — `src/components/Chart.tsx`, exported from
    `src/index.ts`. Bar/line/donut, `aria-hidden` canvas/render surface
    paired with a real visually-hidden accessible `Table`,
    `prefers-reduced-motion` disables draw-in animation. Rendering engine
    in progress moving from Chart.js to ECharts (owner-directed,
    2026-09-16), wrapped identically — `ChartProps`/`ChartSeries` unchanged,
    ECharts never referenced outside this one file. Package gained
    `"sideEffects": false` (package.json) as part of the original Chart.js
    work — genuinely accurate now that `Chart`'s own registration moved off
    the module top level — unlocking real per-export tree-shaking for every
    component, not just this one. Real consumers landed: Dashboard.tsx's
    "Revenue trend" line chart, Inventory.tsx's "stock by warehouse" bar +
    "mix by material" donut (issue #16's own "15 Inventory" scenario).
    Still open: Finance (no real screen yet), Reports (BuilderReports.tsx's
    live-aggregation gap), BI dashboard's other 2 charts, BI explore (new
    route + a `'pie'` variant `Chart` doesn't have yet). Issue #16.
35. [x] Icon component — `src/components/Icon.tsx`, exported from
    `src/index.ts`. A closed `IconName` union (`'sliders' | 'bell'`) as
    inline SVG, `size`/`color` props reading the token system; decorative
    (`aria-hidden`) by default, a real `<title>` + `role="img"` when given
    one. Migrates `ControlCenter.tsx`'s `SlidersGlyph` and `AppShell.tsx`'s
    notification bell to real consumers. `Invoice.tsx`'s QR stand-in
    deliberately NOT migrated — found live during the build, not assumed
    up front: a QR code is generated 2D data, not a fixed glyph, and would
    be Icon's only caller for such a name, failing both Icon's own
    closed-set discipline and Objective 1/3 (a variant with one caller);
    left as a plain placeholder with an honest, updated comment instead of
    force-fitting a 'qr' glyph name to satisfy this item's original
    3-migration count. Issue #18 (`agreed`, project owner, 2026-09-16).
36. [x] Real dark/light/system theming — every `color.*` token in
    `src/tokens.stylex.ts` now carries a light default plus a
    `@media (prefers-color-scheme: dark)` override (the same per-value
    media-query shape `motion`'s durations already used), so a host that
    renders nothing extra already gets correct system-following dark mode.
    `src/components/Theme.tsx` (`value="light" | "dark"`, exported from
    `src/index.ts`) is the explicit-override half, mirroring `Density`'s
    own `stylex.createTheme` + wrapper shape; no `"system"` value — omitting
    the wrapper already is system, so a third value would be an inert no-op
    (Objective 1). AA-contrast-verified for the dark palette with the same
    rigor items 5/12/13 applied to light (`test/color-contrast.test.ts`,
    real WCAG relative-luminance math, not eyeballed) — a real tradeoff
    found live: `accent`/`danger` each serve two roles (flat text color and
    a fill with `textOnInk` on top), and no single dark-mode shade could
    satisfy both against a near-black canvas, resolved by flipping
    `action`/`textOnInk`'s roles (not just their values) so both checks
    become the same formula. Disclosed gaps, not silently dropped (now also
    in `docs/Theme.md` itself, not just this commit history):
    `examples/*.tsx`'s own sample screens use raw inline hex, never StyleX,
    so they won't visually follow dark mode even though every real `src/`
    component does (items 38/39 close this for 4 of 45 files; 41 remain —
    see item 38); `Button`'s danger-hover `rgba()` and `Shell`'s
    `glass`/`shadow` token groups are static values derived from light hex
    that won't re-tint (still true as of item 39 — `Shell`'s own persistent
    chrome, top bar/dock/palette, does not re-tint even under an explicit
    `Theme` override; a real, disclosed seam a viewer who picks "Dark"
    while their content re-tints and chrome doesn't will actually see).
    `Theme` itself now has a real named consumer — item 39. Fixes a
    confirmed defect, not a speculative want: `src/` read no
    `prefers-color-scheme` anywhere before this (found live during item
    15's docs-site review). Issue #19 (`agreed`, project owner,
    2026-09-16).
37. [x] Shell breadcrumbs — a `breadcrumbs` prop on `Shell`
    (`@busyoffice/design-system/shell`), an ordered `{ label, onClick? }[]`
    rendered above the content area; the last entry always renders
    non-interactive with `aria-current="page"`, regardless of whether it
    was given an `onClick` — a real, tested guarantee (`isLast` gates the
    interactive branch), not just documented: the first version shipped
    this exact defect (branching purely on `onClick`, no `isLast` override)
    and it passed 216/216 browser tests undetected until an independent
    review's own red-proof caught it; `test/browser/shell-breadcrumbs.spec.ts`
    now exercises a last crumb WITH an `onClick` and asserts it stays inert.
    Two named consumers, `RecordDetail.tsx` and `Requisitions.tsx`'s own
    linked-document display (was plain text, "Linked: Purchase order
    PO-4011") — disclosed architecture caveat: neither actually passes data
    through Shell's own `breadcrumbs` prop, since neither owns a `Shell`
    instance to pass it into (both are route-agnostic content panes under
    one shared instance, the same constraint `examples/Analytics.tsx`'s own
    comment documents); each renders a hand-duplicated lookalike
    (`examples/breadcrumbTrail.tsx`) instead, so the real prop's only
    exerciser is a non-shipped lab harness (`preview/ShellBreadcrumbsLab.tsx`).
    A fast follow-up (threading `RecordDetail`'s trail through `AppShell`'s
    existing route registry) would close this without a new one-way change;
    not done here since it's a larger change than "a prop and a small
    render region." Issue #20 (`agreed`, project owner, 2026-09-16).
38. [x] Theme-safe page chrome — `ListReport.tsx`, `RecordDetail.tsx`,
    `examples/breadcrumbTrail.tsx` (mission-directed, 2026-09-16, no new
    issue: examples/-level, two-way per LOOP.md). Every raw hex color and
    every raw spacing number matching the `space.*` scale in these 3 files'
    own page-level chrome now reads `color.*`/`space.*`/`radius.*` from
    `src/tokens.stylex.ts` — the same already-established idiom 7 other
    `examples/*.tsx` files used before this (found via evidence, not
    assumed: `docs/design-conventions.md` claimed "no public design-token
    API to compose from directly," which was already false in practice —
    corrected the doc rather than leave a stale claim standing). Zero
    light-mode visual change (every substituted token's light value equals
    the literal it replaced, confirmed against `src/tokens.stylex.ts`'s own
    values); 220/220 browser tests pass, including 3 new real dark-mode
    regression tests (`test/browser/theme-contrast.spec.ts`) red-proofed
    live. `breadcrumbTrail.tsx` was fixed as a same-day follow-up, not the
    original scope: an independent review of the first two files found its
    own raw-hex text colors would render the breadcrumb's "current page"
    label near-invisible once `RecordDetail.tsx`'s background correctly
    went dark — a real WCAG AA contrast failure the original tests didn't
    catch (they asserted the ancestor's background, never this element's
    own text color). Delivered the requested minimal agent-consumable
    recipe: `docs/design-conventions.md`'s new "Theme-safe page chrome"
    section (3 steps, one pitfall, the verification command). Disclosed,
    not silently dropped: 39 of 45 `examples/*.tsx` files still had their
    own raw color/spacing literals at the time this item landed — items
    39/future work continue the sweep (see item 39).
39. [x] Theme milestone (owner-approved, 2026-09-16, 2 of 4 approved items
    — the other 2, extending items 38/2 respectively, are folded into this
    line since each was small): (a) extended item 38's recipe to
    `Delivery.tsx`/`Inventory.tsx` — one deliberate exception disclosed in
    both files and `docs/design-conventions.md`: `Delivery.tsx`'s
    selected-row tint (`#eff6ff`) has no matching `color.*` token in either
    palette, left as a raw literal rather than force-fit the nearest wrong
    one. (b) Wired the real `Theme` component to `ControlCenter.tsx`'s
    Appearance toggle — `AppShell.tsx` lifts `appearance` as controlled
    state (mirroring `density`'s own established pattern exactly) and wraps
    `home`/`children` in `<Theme value={appearance}>` unless `appearance`
    is `'system'` (no wrapper at all, matching item 36's own "omitting the
    wrapper already is system" contract). Removed the now-false "Dark and
    system themes aren't available" disclosure and the `disabled` flags —
    all three segments are real. **A real, severe regression was found and
    fixed before merge, not shipped**: the first version defaulted
    `appearance` to `'light'`, which forced every page into an explicit
    light override from first render regardless of OS preference —
    silently breaking item 36's own "follows the system setting with zero
    host code" guarantee app-wide for anyone who never opens Control
    Center. Caught by running the full gate suite on the assembled batch
    (none of the 3 parallel builders that built this milestone's pieces
    ran `pnpm test:browser` themselves, by design): all 8
    `test/browser/theme-contrast.spec.ts` tests failed uniformly, including
    tests from unrelated, already-landed work — the uniform failure
    pattern is what made "a bad default" obvious rather than a local bug.
    Fixed by defaulting to `'system'`; the fix then required correcting 2
    further tests whose own assertions had baked in the buggy default
    (`test/browser/control-center.spec.ts`, `test/browser/button-group.spec.ts`),
    including a genuine second finding along the way: the panel's initial
    keyboard focus always lands on "Light" (the first enabled button in DOM
    order, per `ControlCenter.tsx`'s own `FOCUSABLE_SELECTOR`) regardless of
    which segment is actually selected — unrelated to the appearance
    default, but only surfaced while fixing the tests it also broke.
    Disclosed, not fixed here: `Shell`'s own chrome (top bar/dock/palette)
    doesn't re-tint even under this new explicit override — a viewer who
    picks "Dark" sees dark content inside permanently-light chrome (see
    item 36's own updated disclosure). Removing `disabled` from Appearance
    left `ButtonGroup`'s disabled-segment contract with no real consumer in
    `examples/` — kept exercised via a new, non-shipped
    `preview/ButtonGroupLab.tsx` (same precedent as `DensityLab.tsx`/
    `ShellBreadcrumbsLab.tsx`). (c) Extended
    `test/shell-token-audit.test.ts`'s ratchet to cover `Delivery.tsx`/
    `Inventory.tsx`. (d) A compact "Start here" entry-map section added to
    the top of `docs/design-conventions.md` (14 lines, pure pointers, no
    restated component content). Independent review: ship-as-is, no
    blockers — re-ran typecheck/lint/test (159/159) independently and
    traced every token substitution and the focus-order mechanism by hand.
    Disclosed: 41 of 45 `examples/*.tsx` files still have raw color/spacing
    literals.
40. [x] Fix docs-site build/token-drift defects found by the item-21 audit.
    Two real, independent SSR crashes were breaking `pnpm build:docs`
    outright — confirmed pre-existing on `main` (reproduced on a clean
    checkout before any fix) and confirmed unnoticed at real scale:
    `gh run list -w docs -b main` shows the `docs` GitHub Actions workflow
    red on 29 consecutive pushes to `main`, starting at `fix/shell-mobile-
    header-overflow: retract brand...` (2026-09-15T12:08:58Z — the exact
    commit that introduced the unguarded `window.matchMedia` call below)
    through this batch's own start, spanning the rest of M6 batch 4, the
    Chart pivot, the whole M7 ERP reference-app initiative (slices 1-18),
    and the entire theme milestone. The published docs container at
    `ghcr.io` has not rebuilt successfully since. Invisible to this repo's
    own gate discipline the whole time because `gates.yml` never runs
    `pnpm build:docs` — only `docs.yml` does, and nothing treats a red
    `docs` run as a stop condition the way a red `gates` run is; fixed
    below (gates.yml now runs it too). (a)
    `src/shell/Shell.tsx`'s `chromeIsNarrow` state read `window.matchMedia`
    unguarded in a `useState` lazy initializer, which runs during Astro's
    server-side prerender (`client:load`) where `window` doesn't exist —
    crashed `/components/shell`. (b) `examples/data/store.ts`'s
    `useStoreState` called `useSyncExternalStore` with no third
    `getServerSnapshot` argument, which React requires whenever a component
    renders server-side — crashed `/patterns/launcher` (any screen reading
    the shared store). Both fixed with the standard guard/argument, not a
    workaround; `pnpm build:docs` now completes clean (24/24 pages) and
    `docs-site/scripts/check-links.mjs` resolves all links on a fresh build.
    Separately, `docs-site/src/pages/tokens.astro`'s Color section was
    rendering a completely empty swatch grid live on the site:
    `docs-site/src/lib/parseTokens.ts`'s regex assumed flat string-literal
    `color.*` values, which stopped being true once item 19 changed every
    entry to `{ default, '@media...' }` objects — `readTokens('color')` was
    silently returning 0 entries. Fixed by reading `lightPalette`/
    `darkPalette` directly (still flat literals) instead of trying to parse
    `color`; the page now renders all 18 tokens' real light+dark hex pairs,
    manually confirmed live via Chrome DevTools color-scheme emulation in
    both light and dark before and after. `docs-site/src/layouts/Base.astro`
    also carried a now-false comment ("the package is light-only today")
    and hardcoded-light chrome from before the theme milestone; real
    dark-mode component colors were rendering inside a chrome box that
    stayed light. Fixed with a `prefers-color-scheme: dark` block using the
    same `lightPalette`/`darkPalette` hex this file already hand-mirrors —
    confirmed live: light mode pixel-unchanged, dark mode legible (the
    `/components/button/` live demo's primary `Button` fill, previously the
    exact failure mode the stale comment described in reverse). Also added
    `pnpm build:docs` and the docs-site link check to `.github/workflows/
    gates.yml` itself — the 29-run blind spot above existed specifically
    because nothing treated a red `docs` run as a stop condition; it now
    fails the same gate a red `pnpm test`/`test:browser` run already does,
    closing the actual process gap, not just today's two instances of it.
    A required independent fresh-context review of this whole batch (see
    below) found and fixed two further real issues before merge: a factual
    error here (originally said "17 tokens", corrected to the true count,
    18); and a second, fresh instance of the exact "light-only chrome"
    bug class this item already fixes once — `tokens.astro`'s own inline
    `<style>` block still had light-only literals for its swatch borders
    and value text (`#64748b` on the now-dark `#020617` canvas measured
    ~4.24:1, under AA's 4.5:1), fixed with the same `prefers-color-scheme:
    dark` pattern as `Base.astro`. The same review also suggested
    simplifying (a)'s guard to an unconditional `useState(false)`, purely
    to avoid a hydration-mismatch warning on the one server-rendered demo
    — tried it, and the full `pnpm test:browser` run caught a real
    regression before merge: `control-center.spec.ts`'s narrow-viewport
    test measures zero top-bar overflow on first paint, which a wrong
    `false` guess broke for every real (client-only) consumer. Reverted to
    the guarded `window`-read, which is correct for every actual usage;
    the hydration-mismatch warning stays an accepted, disclosed tradeoff
    on that one docs-site page, not a functional bug. Accept: `pnpm build
    && pnpm build:docs` complete with exit 0; `docs-site`'s own link-check
    reports 0 broken links; the tokens page's rendered color section lists
    >0 entries with real light+dark hex for both, at AA contrast in both
    modes; `gates.yml` runs `pnpm build:docs` and the link check; `pnpm
    test:browser` stays 224/224. Serves: intent.md "documentation" (docs
    must not silently drift from real component behavior, same principle
    as item 6). Needs: issue #21 (owner-directed, 2026-09-17).
41. [x] Rewrite `examples/README.md`'s file-to-template table to cover
    every `examples/*.tsx` file that renders a screen (helpers/data-layer
    files stay out of scope — they were never in this table). It
    previously documented only the ~21-file M6 batch. Found while fixing
    this that 19 files were missing, all one undocumented lineage: ROADMAP
    M7's own "ERP reference-app initiative" (13 numbered slices, a
    per-module gap inventory, named cross-screen journeys like
    "Sales-to-billing" and "create user → assign role → preview access →
    inspect audit history"), built without a Claude Design `.dc.html`
    template to mirror — unlike this table's other rows. Added all 19 with
    an honest "Mirrors: None" rather than inventing a template citation,
    plus a short note explaining the two lineages so a reader isn't left
    assuming an omission. Accept: every file in `examples/*.tsx` that
    renders a full sample screen has a corresponding README row. Serves:
    intent.md "documentation". Needs: issue #21 (owner-directed,
    2026-09-17).
42. [x] Start Here landing page (`docs-site/src/pages/index.astro`
    rewrite). Added, above the existing Foundations/Components/Patterns
    sections (items 43-45 already gave those their final shape, per the
    original plan's own sequencing): a "What this is" paragraph quoting
    `intent.md`'s real boundary statement verbatim ("a UI dependency, not
    an ERP platform kernel or application implementation"), an "Install"
    section, and a "See it running" section linking `/patterns/
    list-report/` as the first live ERP screen to look at. The install
    snippet is deliberately not a `pnpm add` command: `package.json` says
    `"private": true` — this package isn't on the public npm registry, so
    a generic public-install command would be actively wrong, not just
    incomplete. Instead: an honest one-line note that hosts inside Busy
    Office Codex integrate it via a reviewed, pinned commit (`AGENTS.md`'s
    own coordination process), then the real, verified import syntax from
    `README.md`'s own "Public imports" section. Added `id="components"`/
    `id="patterns"` anchors to their existing `<h2>` headings so the new
    section's "jump straight to a specific component or pattern" links
    actually resolve (`check-links.mjs` doesn't check `#fragment` links at
    all — confirmed by reading its own `isInternal()` filter — so this was
    verified by hand in Chrome, not by the automated check alone).
    A required independent fresh-context review found two small, real
    nits before merge, both fixed here: the import snippet showed only 3
    of `README.md`'s 4 "Public imports" lines (the `AppShell` preview-only
    line omitted) while the prose said "the documented subpaths" without
    qualification — reworded to name the full list's real location rather
    than implying completeness it didn't have; and a stray, unreferenced
    `id="foundations"` anchor (added alongside the two that ARE used, but
    never linked from anywhere) — removed, matching this repo's own "no
    prop or export with a single caller" simplicity bar applied to markup.
    Accept: the page includes the real import snippet (not a fabricated
    public-registry command); `intent.md`'s boundary statement, quoted
    accurately; a working link to a live ERP pattern page
    (`/patterns/list-report/`); check-links stays green (24/24 pages);
    in-page anchors manually confirmed to actually scroll to their target
    in Chrome. Serves: intent.md "documentation". Needs: issue #21
    (owner-directed, 2026-09-17).
43. [x] Foundations restructure: merged tokens/density/theme under one
    "Foundations" section on the docs-site index (a "Design System"
    subsection linking Tokens/Theme/Density, plus a "Base Styles"
    subsection) — real content, not just a new heading: `/tokens/` now
    cross-links `/base-styles/`, `/components/theme/` and `/density/`;
    `/density/` links back to `/tokens/`. New `/base-styles/` page (none
    existed before this) renders `shadow`/`radius`/`glass`/`motion` token
    values, `Icon`'s glyph set, and motion durations/easing live from
    source, not hand-copied: `docs-site/src/lib/parseTokens.ts` gained
    `readMotionDurations()`/`readMotionEasing()` (motion's 3 durations are
    `{ default, '@media (prefers-reduced-motion: reduce)' }` objects, the
    same shape `color` already needed special handling for in item 40 —
    not flat strings `readTokens()` could read directly), `readIconNames()`
    (reads `Icon.tsx`'s own `IconName` union from its source text, the
    same technique `readTokensSource()` already uses for tokens — no
    runtime introspection possible either way), and widened `readTokens()`
    to also accept `radius`/`shadow`/`glass`. Motion durations render as a
    real, clickable button using each token's actual `transition-duration`/
    `easing` value (not just printed text) — click it and feel the real
    120/200/320ms difference, and it genuinely disables itself under
    `prefers-reduced-motion: reduce` via `matchMedia`, not just a claim in
    the paragraph above it.
    Found and fixed live while building this page (a fresh instance of
    the exact class of bug item 40 already fixed twice): `.motion-demo`'s
    button and the `.swatch-value`/`.scale-value` label text were
    light-only, unreadable under `prefers-color-scheme: dark` — fixed
    with the same `@media (prefers-color-scheme: dark)` pattern already
    established in `Base.astro`/`tokens.astro`, confirmed live in Chrome
    DevTools in both themes before merge.
    A required independent fresh-context review found and fixed three
    further issues before merge, all real: (1) the Accept clause below
    originally claimed `Icon`'s glyph set was "live from source" while
    the page actually hand-listed `['sliders', 'bell']` — closed for
    real via `readIconNames()` above, not just reworded; (2) the motion
    demo's own script set each button's transition duration
    unconditionally, ignoring `prefers-reduced-motion` — the literal
    irony of a page whose own text claims every duration respects it —
    fixed by checking `matchMedia` directly, the same discipline
    `src/tokens.stylex.ts`'s own comment demands ("components should
    never hardcode a transition duration"); (3) 4 of 6 `glass` swatches
    demonstrated nothing (`border`/`highlight` had no CSS branch, and
    `blur`/`blurStrong` had no backdrop to blur) — fixed with a colorful
    backdrop behind every glass demo and a real property per token
    (background/border/inset box-shadow as appropriate). Follow-up,
    disclosed not deferred silently: `parseTokens.ts` has no automated
    test coverage of its own (item 40's original bug was exactly this
    class of silent parse drift) — genuinely worth closing, but adding
    it needs either a vitest setup in `docs-site` (none exists — its own
    `test` script is `build + check-links` only, v1 scope per item 15) or
    a path-resolution change to `readTokensSource()`'s `process.cwd()`
    assumption so a root-level test could import it; neither is a
    same-batch fix.
    Accept: `/base-styles/` renders real `shadow`/`radius`/`glass`/
    `motion` token values and `Icon`'s real glyph set, all live from
    source with zero hand-copied lists; `docs-site`'s index groups
    Tokens/Theme/Density under "Foundations → Design System" and links
    "Base Styles" alongside them; check-links stays green (24/24 pages);
    legible in both themes and functionally correct under reduced motion,
    manually confirmed. Serves: intent.md "documentation". Needs: issue
    #21 (owner-directed, 2026-09-17).
44. [x] Components section: group the 14 docs by their existing
    frontmatter `category` (actions/forms/data-display/feedback/layout/
    typography/media) instead of one flat alphabetical list — `index.astro`
    now renders one `<h3>` per category, in a fixed reading order. Added
    `docs/AppShell.md` (a real package export, `@busyoffice/design-system/
    examples/app-shell`, with no doc at all before this). A real,
    pre-existing latent bug was found and fixed while building its live
    demo, not shipped as a workaround — see item 45's own note, the same
    batch closed both.
    Accept: docs-site's components index renders grouped sections keyed by
    each doc's `category` field (verified: `pnpm build:docs` output groups
    Actions/Forms/Data display/Feedback/Layout/Typography/Media, manually
    confirmed live in Chrome); `docs/AppShell.md` exists with the same
    shape as `ListReport.md`/`RecordDetail.md` and renders at
    `/components/appshell/` with a real, working live demo. Serves:
    intent.md "documentation", Objective 1 (no drift). Needs: issue #21
    (owner-directed, 2026-09-17).
45. [x] ERP Patterns: one URL per pattern combining prose and live demo
    (ListReport, RecordDetail, Launcher, Dashboard), replacing the prior
    split routes (prose at `/components/{id}/`, demo at `/patterns/{id}/`,
    no cross-link); wrote new `docs/Launcher.md` and `docs/Dashboard.md`
    (demo-only before this, no prose existed for either).
    Found and fixed while building `docs/AppShell.md`'s live demo (item
    44): `AppShell`'s own documented no-`navigation`-prop fallback,
    `sampleRoutes()`, unconditionally maps its full 9-module `NAV` table —
    52 real routes today — past `SHELL_MAX_ROUTES` (40, raised from 32 only
    the day before, item 34). A real, pre-existing latent bug, not
    introduced by this batch: invisible until now because the one real
    caller, `preview/client.tsx`, always supplies its own explicit
    `navigation` and never exercises this fallback path at all. Fixed by
    raising `SHELL_MAX_ROUTES` to 64 (same bare-defensive-cap reasoning as
    the 32->40 raise — not a reasoned ceiling, headroom past what's real
    today; strictly permissive, no one-way concern — every registry valid
    at 40 stays valid at 64, only 41-64 flip from rejected to accepted),
    updating the two tests that hardcoded the old bound/message, and
    adding a real regression test that locks the property, not the value:
    `preview/AppShellFallbackLab.tsx` (same non-shipped-harness precedent
    as `DensityLab`/`ButtonGroupLab`/`ShellBreadcrumbsLab`) mounts the
    exact bare `<AppShell />` that broke, and `test/browser/
    app-shell-fallback.spec.ts` asserts it renders real navigation, not
    the invalid-registry fallback — so the next `NAV` entry that pushes
    the real count past `SHELL_MAX_ROUTES` fails a running test, not a
    live page.
    Also found: embedding a live `AppShell` demo inside a normal content
    page is unsafe by default — its own chrome (`Shell.tsx`'s command bar/
    app strip/dock) uses `position: fixed`, which escapes a plain
    `.live-demo` box and overlays the whole page (its header/nav included)
    instead of staying inside its own demo. This was already true, unnoticed,
    for `docs/Shell.md`'s own existing live demo (also a real `<Shell>`) —
    not a new risk this batch introduced, a pre-existing one this batch's
    fix happens to also close. Fixed with `contain: layout` on `.live-demo`
    in `Base.astro`, confirmed live in Chrome DevTools in both themes
    (correctly boxed, zero visual change for every other component's demo).
    `Modal`'s native `<dialog>` also uses `position: fixed` but needs no
    fix: `showModal()` promotes it to the browser's own top layer, which
    ignores `contain` by design — a modal is supposed to render above
    everything, unlike a persistent shell chrome silently overlaying a
    page's own nav.
    An independent fresh-context review (required before merge) verified
    the "52 real routes"/"unreachable fallback" claims by direct
    recomputation and grep, and found three real issues before merge, all
    fixed here: `docs/AppShell.md` had claimed omitting `children` renders
    "an empty content area," contradicted by the component's own code
    (`children ?? <Launcher .../>`) — corrected; `docs/Shell.md` still
    named the bound "32 routes" (stale since item 34's own 32->40 raise,
    never updated) — corrected to 64; and the `.live-demo` comment's "none
    uses `position: fixed`" claim was itself false (`Modal`, `Shell.md`'s
    own demo) — corrected as above, and the missing regression test (this
    item's own paragraph above) was added.
    Accept: `/patterns/{list-report,record-detail,launcher,dashboard}/`
    each render both prose and a live demo at one URL; check-links stays
    green; `pnpm build && pnpm lint && pnpm typecheck && pnpm test &&
    pnpm test:browser` all pass (`pnpm test` 203/203, `pnpm test:browser`
    225/225 — zero regression, +1 each for the new fallback regression
    test). Serves: intent.md "documentation". Needs: issue #21 (two-way,
    examples/docs-site-level per AGENTS.md's Gate — `SHELL_MAX_ROUTES` is
    strictly permissive and matches the item 34 precedent already on
    `main`, not separately owner-directed by name).
46. [x] Examples gallery page (`docs-site/src/pages/examples.astro`, new
    — none existed before this) cataloguing all 45 `examples/*.tsx` by
    category: 33 full sample screens (32 from `preview/client.tsx`'s own
    `routes` array, the one authoritative registry, plus `Launcher` —
    reached via the dock's launcher tile, not a NAV id — grouped by
    module), 6 entry/state screens, 6 reusable helpers. Data is hand-
    maintained (matching `examples/README.md`'s own established
    convention for this exact kind of content — a real buildable-page
    catalog, not something derivable from a content collection the way
    `docs/*.md` is), cross-checked against `preview/client.tsx`'s route
    table directly, not recalled from memory. Verified: built output has
    exactly 56 `<tr>` (45 data rows + 11 table headers across 8 module
    groups + Home + entry-screens + helpers), confirmed by counting the
    built HTML, not assumed from the source data array's own length.
    Surfaces the 6 hash-only screens prominently (a dedicated "Entry &
    state screens" section, not buried in the full list) — `Login` +
    `PasswordReset` + 4 error states, each with its real `#hash` and a
    real GitHub source link; confirmed by grep that nothing in `examples/`
    or `preview/` links to any of these 6 hashes from inside the running
    app (the gap this item exists to surface, not just describe).
    Source links resolve to real GitHub URLs for every file except
    `AppShell.tsx`, which links to its own live demo at
    `/components/appshell/` instead (built in an earlier batch) — a
    working page, not a broken choice.
    A required independent fresh-context review exhaustively cross-checked
    every hand-transcribed datum (all 45 files, all 32 route id/label/
    module triples, all 6 hashes, every helper's real consumer list, and
    the "nothing links to these 6 hashes" claim) against the real source
    and found zero wrong modules, zero wrong hashes, zero fabricated
    consumers, zero omissions — a clean result, not a lucky one, given
    this batch's real risk was transcription error, not logic. It did
    flag one real, cheap gap: `Dashboard` was the only screen linking its
    own live demo page even though `ListReport`/`RecordDetail`/`Launcher`
    already have one too (built in earlier batches) — fixed here, all 4
    now link their real `/patterns/{id}/` page alongside their source.
    Accept: every `examples/*.tsx` file with a real screen appears in the
    gallery with its route id or hash (verified: 45/45 present, counted
    in the built HTML); the 6 hash-only screens are individually linked
    with their real hash and source; check-links stays green (25/25
    pages, up from 24); legible in both themes, manually confirmed.
    Serves: intent.md "documentation". Needs: issue #21 (owner-directed,
    2026-09-17).
47. [ ] Quality & Verification page: surface the CI gate suite composition
    (`gates.yml`/`docs.yml`), ROADMAP's own narrated 3-lens review findings
    per milestone, and disclosed limitations (structural-first-pass
    caveat, raw-token file count, Shell chrome re-tint gap). Accept: the
    page names every gate in `gates.yml` and links the validation commands
    (`pnpm build`/`lint`/`typecheck`/`test`/`test:browser`/`security`); no
    invented score or dashboard duplicating manually maintained data —
    confirmed by this milestone's own audit that no such system exists
    anywhere in the org to duplicate. Serves: intent.md "documentation".
    Needs: issue #21.
48. [ ] Build with AI page: boundary/scope (`intent.md`/`ARCHITECTURE.md`),
    supported subpath exports, the two-way/one-way gate from `AGENTS.md`,
    and common mistakes (removed `Button.size`/`Table.density`, importing
    from `src/` instead of documented subpaths, treating `ListReport`/
    `RecordDetail` as components rather than compositions). Accept: page
    content is sourced from `intent.md`/`ARCHITECTURE.md`/`AGENTS.md`'s
    real text, not restated from memory; check-links stays green. Serves:
    intent.md "documentation". Needs: issue #21.
49. [x] **Token-standardization sweep — close the "no exception" gap items 38/39
    disclosed.** Owner-directed, 2026-09-17, issue #21: extend the Theme-safe
    page chrome recipe from the 7 files items 38/39 already covered to the
    remaining 38 `examples/*.tsx` files, so raw color/spacing literals stop
    being a matter of which file you happen to be in. A real token-scale gap
    found along the way, not papered over: `#eff6ff` (a selected-row tint)
    was duplicated raw across 10 files with no matching `color.*` token —
    strong, pre-existing proof of reuse (Objective 3), so it became a new
    token, `color.bgSelected` (light `#eff6ff`, matching every existing
    instance exactly — zero light-mode visual change there; dark Tailwind
    blue-950 `#172554`, both AA-verified in `test/color-contrast.test.ts`:
    textPrimary/textSecondary on it clear 14.0:1/9.9:1). 35 files edited by
    34 parallel single-file agents plus one direct fix (independent files, no
    worktree isolation needed — no shared build step per agent, verified once
    for the whole batch instead, per LOOP.md's own batch-verify shape): 129
    hex literals and 339 spacing numbers replaced with real tokens. Two
    literals left as disclosed exceptions, not force-fit: `Launcher.tsx`'s
    favorited-star amber and `entryScreenLayout.tsx`'s local `warn` amber —
    two different shades for two different one-off purposes, not a proven
    shared concept. "No exception" is mechanically enforced for color, not a
    narrative claim: `test/shell-token-audit.test.ts`'s ratchet now covers
    all 45 `examples/*.tsx` files plus `src/shell/Shell.tsx` (was 7) and
    passes 48/48 — a raw hex duplicating a token can't land in `examples/`
    again without failing a running test (spacing has no equivalent ratchet
    yet — a real, disclosed gap, not claimed as covered).

    A required independent fresh-context review of the whole batch found the
    batch mechanically sound but flagged two real issues, both fixed before
    this line was written, not deferred: (1) `examples/filterTabs.tsx` was
    added to the ratchet but never actually edited — a genuine miss (its one
    `gap: 8` now reads `space.space2`, folded into the counts above). (2)
    Three of the "matching-token" substitutions actually changed a light
    value, not just its representation, and the original Accept clause below
    claimed otherwise — disclosed here instead: `examples/Login.tsx`'s and
    `examples/RolePage.tsx`'s workspace-switcher label read a raw `#334155`
    that matches no LIGHT palette value at all (it's `darkPalette.border`) —
    the ratchet correctly forced a real fix, not a cosmetic one: mapped to
    `color.textSecondary` by visual role (a secondary-emphasis label, same
    as this exact text already reads elsewhere), which the review confirmed
    also fixed a real, pre-existing dark-mode bug — the old literal measured
    ~1.7:1 against dark `bgSurface`, effectively invisible, now 12.0:1.
    `examples/entryScreenLayout.tsx`'s local `danger: '#b91c1c'` (a close
    but not exact duplicate of `color.danger`, `#b42318`) was corrected to
    read the real token instead of hand-duplicating a near-miss of it —
    unforced by the ratchet (no token matched the old literal exactly) but
    the same right call: one danger red instead of two slightly different
    ones, and a better dark-mode contrast as a direct result (3.1:1 → 5.4:1).
    Verified: full gate suite green (`pnpm test` 202/202, `pnpm test:browser`
    224/224 — zero regression across every existing assertion, including
    every per-screen mobile-responsive and dark-mode check); the new
    `bgSelected` token manually confirmed live in Chrome DevTools
    color-scheme emulation on Companies.tsx (light: unchanged; dark: a
    legible, correctly-tinted selected-row highlight where the raw literal
    would previously have stayed a fixed light patch against a dark table).
    Accept: `test/shell-token-audit.test.ts` covers all 45 `examples/*.tsx`
    files plus Shell.tsx and passes; `pnpm build && pnpm lint && pnpm
    typecheck && pnpm test && pnpm test:browser` all pass; every substituted
    value is either byte-identical to the literal it replaced or a disclosed,
    justified correction (the 3 named above) — not a silent visual change.
    Serves: Objective 1 (simplicity — one token per color role, not a raw
    literal per file); intent.md "documentation" doesn't drift from real
    usage. Needs: issue #21 (owner-directed, 2026-09-17). Follow-up, not a
    blocker for this item: extend the ratchet to spacing, and to discover new
    `examples/*.tsx` files automatically instead of a hardcoded list.

Each batch needs an acceptance-to-test mapping and one independent review.
Loop runs follow [LOOP.md](LOOP.md).
