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
items 17–33, issue #17 (`agreed`, project owner, 2026-09-14).** Owner-directed
(2026-09-14): the Claude Design project's `templates/erp-skeleton/
ErpSkeleton.dc.html` ("a gray wireframe canvas of every ERP page") has 24
distinct desktop screens; only 3 were mirrored before this milestone
(`Launcher`≈Home, `RecordDetail`≈Sales order detail, `ListReport`≈Purchase
order). 16 are buildable from existing components; 5 (Inventory, Finance,
Reports, BI dashboard, BI explore) are blocked on a proposed `Chart`
primitive (issue #16, `proposed` — not built speculatively, per the owner's
explicit "propose separately" decision) and are not items in this
milestone. Structural first pass, per owner decision: real components,
correct composition and content matching the reference's own labels/data —
not independently pixel-measured or contrast-audited (a later, separate
fidelity pass, screen-by-screen, the way item 12 did it). Also expands
`AppShell.tsx`'s route registry and rebuilds `preview/client.tsx`'s routing
to actually host every page, replacing the prior 3-route preview — the
"redo preview" half of the request.

After M6, or once its scope is exhausted, stop expanding the framework: new
work starts only from a request that passes the Objective tests.

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
17. [ ] Login (01) — update `examples/Login.tsx` to the fuller erp-skeleton
    version (workspace switcher, SSO, MFA row, brand panel) rather than a
    second file. Accept: real Shell-independent standalone page (pre-auth,
    not module-routed), composed from existing exports. Issue #17.
18. [ ] Role page (03) — `examples/RolePage.tsx`, module General. Accept:
    real Shell-hosted page, existing exports only, matches reference tabs/
    content structure. Issue #17.
19. [ ] Inbox (04) — `examples/Inbox.tsx`, module General. Same Accept
    pattern as item 18. Issue #17.
20. [ ] Notifications (05) — `examples/Notifications.tsx`, module General.
    Same Accept pattern as item 18. Issue #17.
21. [ ] Profile (07) — `examples/Profile.tsx`, module General. Same Accept
    pattern as item 18. Issue #17.
22. [ ] Help (08) — `examples/Help.tsx`, module General. Same Accept
    pattern as item 18. Issue #17.
23. [ ] Customers (09) — `examples/Customers.tsx`, module Sales. Same
    Accept pattern as item 18. Issue #17.
24. [ ] Sales order — list (10) — `examples/SalesOrderList.tsx`, module
    Sales; needs a NAV label reconciliation with the existing "Sales
    order" (detail) route before wiring — resolved when this item builds,
    not a blocker on earlier items. Issue #17.
25. [ ] Delivery — list view (12) — `examples/Delivery.tsx`, module Sales;
    Board/Map/Calendar view-toggle explicitly deferred. Issue #17.
26. [ ] Invoice (13) — `examples/Invoice.tsx`, module Sales. Same Accept
    pattern as item 18. Issue #17.
27. [ ] Approvals (16) — `examples/Approvals.tsx`, module General (the
    cross-module queue screen). Same Accept pattern as item 18. Issue #17.
28. [ ] Admin overview (21) — `examples/AdminOverview.tsx`, module
    Administration. Same Accept pattern as item 18. Issue #17.
29. [ ] Users and roles (22) — `examples/UsersAndRoles.tsx`, module
    Administration; spans NAV's separate "Users"/"Roles" entries, resolved
    when this item builds. Issue #17.
30. [ ] Builder — forms (23) — `examples/BuilderForms.tsx`, module
    Builder; static 3-pane layout, no drag-and-drop. Issue #17.
31. [ ] Builder — workflow (24) — `examples/BuilderWorkflow.tsx`, module
    Builder; static step list, no drag/diagram. Issue #17.
32. [ ] Settings (25) — `examples/Settings.tsx`, module Settings. Same
    Accept pattern as item 18. Issue #17.
33. [ ] Rebuild `preview/client.tsx`'s routing to host every item above
    plus the 3 already-built pages, replacing the current 3-route preview;
    expand `examples/AppShell.tsx`'s route registry only where a new
    module/screen name isn't already in its `NAV` map. Accept: every item
    17–32's page is reachable via app strip, dock, or command palette in
    the preview; `pnpm test:browser` green. Issue #17.

Each batch needs an acceptance-to-test mapping and one independent review.
Loop runs follow [LOOP.md](LOOP.md).
