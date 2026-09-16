# Design system page examples

Real, working page compositions built from `@busyoffice/design-system`'s
actual components — the buildable equivalent of the page templates synced
to the [Busy Office Design System](https://claude.ai/design/p/5a1c23d0-2283-4bbc-83f6-7b4095f071de)
Claude Design project (`templates/app-shell`, `templates/list-report`,
`templates/record-detail`, `templates/dashboard`, `templates/login`).

Those Claude Design templates are `.dc.html` canvas files — a proprietary,
non-JSX format meant for the design agent, not for application code. These
`.tsx` files are the same pages expressed as real React, so any coding
agent working in this repo (this codebase's own agents, or an external one
like Codex) has actual, on-brand page structures to read and extend,
rather than an abstract description.

They are pure UI compositions — no server calls, no real ERP data — meant
to demonstrate **how to structure a page** with this design system, not to
be wired into a real feature as-is.

| File | Mirrors | Demonstrates |
|---|---|---|
| `AppShell.tsx` | `templates/app-shell` (rebuilt against `templates/erp-skeleton`'s real "Shell anatomy" spec and its reusable `Shell.dc.html`) | The full shell: command bar with a real ⌘K → command-palette overlay, a module-aware app strip (shows the *current module's* sibling screens, not top-level app names), and a floating dock (launcher + pinned apps with sample counts + recent records). No sidebar — this ERP's shell is command-bar + app-strip + dock. |
| `Launcher.tsx` | `templates/erp-skeleton`'s "Home (launcher)" screen | The Home/launcher screen reached from the shell's dock: a role-picked "For you" row, then an "All apps" grid (folder-style tiles for Finance/BI/Administration). Renders as `AppShell`'s content when its dock's launcher tile is clicked. |
| `ListReport.tsx` | `templates/erp-skeleton`'s "14 · Purchase order" business mockup (deliberately rebuilt away from the generic `templates/list-report` template to match this specific reference — see `docs/ListReport.md`) | Purchase-orders list: a stat-tile strip, search plus four real `Dropdown` filters (Supplier, Status, Buyer, Expected), and a real `Table` with a row-selection checkbox column |
| `RecordDetail.tsx` | `templates/record-detail` | Record header + `Chip` status, summary `Card` tiles, a `Modal` confirm flow |
| `Dashboard.tsx` | `templates/dashboard` | KPI `Card` grid with a selected state |
| `Login.tsx` | `templates/erp-skeleton`'s "01 · Login" screen (rebuilt from the simpler standalone `templates/login` template — ROADMAP M6, one login example, not two) | Two-column sign-in: workspace switcher, email/password, a "Continue with SSO" alternative, a remember-this-device row, and a brand panel |
| `Profile.tsx` | `templates/erp-skeleton`'s "07 · Profile" screen | Avatar/name header, a filter-`Chip`-as-tabs row (no `Tab` component in this package), and an 8-field settings form |
| `AdminOverview.tsx` | `templates/erp-skeleton`'s "21 · Administration — overview" screen | A 9-card admin-area grid plus a recent-activity panel with a status `Chip` |
| `Settings.tsx` | `templates/erp-skeleton`'s "25 · Settings" screen | Sectioned org settings form: Company fields, four `Dropdown` value pickers (Locale & currency), and toggle rows (Modules) |
| `RolePage.tsx` | `templates/erp-skeleton`'s "03 · Role page" screen | Role-scoped workspace: KPI tiles, a work-queue `Table`, shortcuts, and a team/delegation panel |
| `Inbox.tsx` | `templates/erp-skeleton`'s "04 · Inbox" screen | Two-pane thread list + detail: a real `Dropdown` filter, linked-record context `Card`, a message thread, and a reply composer |
| `Notifications.tsx` | `templates/erp-skeleton`'s "05 · Notifications" screen | Grouped notification list (Today/Yesterday) with inline actions, plus a channel-preferences `Card` |
| `Help.tsx` | `templates/erp-skeleton`'s "08 · Help" screen | Setup checklist, a guided-tour `Card`, and docs/shortcuts/support link lists |
| `Customers.tsx` | `templates/erp-skeleton`'s "09 · Customers" screen | Customer list: search plus four `Dropdown` filters, a `Table`, no row selection |
| `SalesOrderList.tsx` | `templates/erp-skeleton`'s "10 · Sales order — list" screen | Status tabs, search plus three `Dropdown` filters, a `Table` — distinct from `RecordDetail.tsx`'s "Sales order" detail route |
| `Delivery.tsx` | `templates/erp-skeleton`'s "12 · Delivery" screen | List view (Board/Map/Calendar deferred), status tabs, a `Table`, and a tracking-timeline detail panel |
| `Invoice.tsx` | `templates/erp-skeleton`'s "13 · Invoice" screen | Two-column document layout: an invoice `Table` with totals, and a sidebar of payment status/history |
| `Approvals.tsx` | `templates/erp-skeleton`'s "16 · Approvals" screen | Cross-module approval queue: category tabs, a selectable queue list, and a detail pane with Approve/Reject actions |
| `UsersAndRoles.tsx` | `templates/erp-skeleton`'s "22 · Users and roles" screen | Two-pane role editor: a role list, and a 6×6 permissions matrix `Table` of real checkboxes |
| `BuilderForms.tsx` | `templates/erp-skeleton`'s "23 · Builder (forms)" screen | Static 3-pane form editor: a field/layout/block palette, a form preview, and a field-properties panel |
| `BuilderWorkflow.tsx` | `templates/erp-skeleton`'s "24 · Builder (workflow)" screen | Static vertical step-flow (trigger → condition → approval → actions) with an approval-step config panel |

The 19 rows below are a second lineage, not an omission from the table
above: ROADMAP M7's "ERP reference-app initiative" filled gaps the M6 batch
never covered (a per-module gap inventory, not the Claude Design canvas),
organized as named journeys built in numbered slices — so unlike every row
above, none of these mirrors a `templates/*` canvas file; "Mirrors" says so
directly instead of citing one that doesn't exist. Every file's own header
comment names its slice and journey — read that first, not just this table.

| File | Mirrors | Demonstrates |
|---|---|---|
| `Quotations.tsx` | None — M7 ERP reference-app initiative, Slice 1 (gap inventory; no Claude Design template) | List-plus-detail-in-one-route: the first hop of the Sales-to-billing journey |
| `Billing.tsx` | None — Slice 1 | Billing worklist + detail, the last hop of the Sales-to-billing journey; its "View invoice" action hands off to `Invoice.tsx` via the shared store |
| `Requisitions.tsx` | None — Slice 2 | Requisitions list + detail, the first hop of the Procurement-to-stock journey; a linked-purchase-order breadcrumb trail |
| `Inventory.tsx` | None — Slice 2 | Stock overview: stock-by-warehouse bar `Chart`, mix-by-material donut `Chart`, movement-history `Table` |
| `Planning.tsx` | None — Slice 3 | Production planning: demand, material availability, and recommendations shown together in one screen (a deliberate one-screen-per-chain judgment, not three separate routes) |
| `ProductionOrders.tsx` | None — Slice 3 | Planned orders → production orders → a simple schedule, the second half of the chain `Planning.tsx`'s recommendations start |
| `Users.tsx` | None — Slice 4 | Users + role assignment + access preview + audit history — "create user → assign role → preview access → inspect audit history" in one screen |
| `AuditLog.tsx` | None — Slice 4 | Cross-domain audit trail, the last hop of `Users.tsx`'s own named journey; reads the same shared activity log every other M7 screen appends to |
| `Analytics.tsx` | None — Slice 5 | Cross-domain exceptions dashboard — "dashboard exception → filtered worklist → record details → relevant action"; every figure is computed live from the shared store, not hardcoded |
| `BuilderScreens.tsx` | None — Slice 6 | A screen/page-definition builder, filling `NAV.Builder`'s pre-existing "Pages" placeholder from M6 |
| `Roles.tsx` | None — Slice 9 | Role management, filling `NAV.Administration`'s pre-existing "Roles" placeholder from M6 |
| `Companies.tsx` | None — Slice 12 | Companies & entities: the entity-lifecycle half of `AdminOverview.tsx`'s "Manage legal entities" card |
| `Integrations.tsx` | None — Slice 12 | Integrations & API, filling `NAV.Administration`'s pre-existing "Integrations" placeholder from M6 |
| `BuilderReports.tsx` | None — Slice 13 | Report/dashboard-definition builder; adds a new `NAV.Builder` entry, "Reports & dashboards" |
| `PasswordReset.tsx` | None — Slice 8 (Entry/nav) | Two-step password-reset flow, standalone pre-shell screen at `#password-reset`; genuinely stateful (submitting moves to a real "check your email" state, "Resend" is a repeatable action), unlike the single-message screens below |
| `AccountLocked.tsx` | None — Slice 8 | Account-locked error state, standalone pre-shell screen at `#account-locked` — a real host shows this before `Shell` ever mounts |
| `SessionExpired.tsx` | None — Slice 8 | Session-expired error state, standalone pre-shell screen at `#session-expired` |
| `AccessDenied.tsx` | None — Slice 8 | Permission-denied error state, standalone pre-shell screen at `#access-denied` — the honest landing spot for a module a viewer's role doesn't grant (see `Users.tsx`'s real "Preview access" module chips, Slice 4) |
| `NotFound.tsx` | None — Slice 8 | 404 error state, standalone pre-shell screen at `#404` |

`PasswordReset.tsx`/`AccountLocked.tsx`/`SessionExpired.tsx`/`AccessDenied.tsx`/`NotFound.tsx` (with `Login.tsx` above) are reachable only by hand-typing their URL hash — nothing inside the running app links to any of them today (`AppShell`'s `Shell` never renders a sign-out/session-expired/404 trigger). Surfacing them as real, discoverable links is tracked separately (ROADMAP item 46).

**`AppShell.tsx` is the one to read to understand navigation** — it composes
a real, working command palette (open it with Ctrl/⌘K or its command button)
and a real, working launcher (click the dark tile in the floating
dock). Both demonstrate local UI state changes — see "How the
launcher and menu work" below.

**These go further than the Claude Design templates could.** The `.dc.html`
canvas format can only pass plain-string props to a component (see
`.design-sync/conventions.md`), so those templates can't use `Dropdown`
(its `items` prop is an array) and can't wire real interactivity (a
permanently-open `Modal` stands in for a real open/close flow). The `.tsx`
files here have no such limitation — `ListReport.tsx` uses a real
`Dropdown`, and `RecordDetail.tsx` wires its `Modal` to real `useState`
open/close behavior via the `actions` prop. Prefer patterns from here over
the canvas templates when writing real page code for that reason.

Kept in sync manually — if the canvas templates change, update the
matching file here (and vice versa; a genuinely better pattern found while
writing one should be back-ported to the other).

## How the launcher and menu work

Per `templates/erp-skeleton`'s own "Shell anatomy" annotations, this ERP has
no sidebar. Navigation is five pieces, implemented in the package's
`src/shell/Shell.tsx` and composed with sample data by `AppShell.tsx`:

1. **Command bar** — always visible, top of every page. Its named shared
   button opens the **command palette** with Enter, Space, or ⌘K/Ctrl+K.
   The palette search receives focus; Escape, its Close button, and the
   backdrop return focus to the opener when it remains connected, visible,
   and active. It is a search/filter overlay over the host's `commands`
   (category `Chip`s derived from each command's `group` — here Actions,
   Records and Pages) that a real app would wire to live search
   results and command execution.
2. **App strip** — right below the command bar. Shows the *current
   module's* sibling screens (e.g. module `"Sales"` → Customers · Sales
   order · Delivery · Invoice · Returns), driven by the `NAV` map keyed by
   module name. This is the ERP's actual page-to-page navigation — one
   click between sibling screens in the same module.
3. **Content** — whatever page is mounted as `AppShell`'s `children`.
4. **Dock** — a floating pill, fixed to the bottom center, present over
   every page (`position: fixed`, not part of page flow). Holds the
   launcher tile, pinned apps (each with a sample count badge, real `Chip`),
   and recent records.
5. **Launcher** — clicking the dock's dark launcher tile (the 2×2 dot-grid
   icon) shows `Launcher.tsx` as the page content: a role-picked "For you"
   row of `Card`s, then an "All apps" grid. This is literally "Home" — the
   real wireframe renders it *inside* the same shell, which is why
   `AppShell` renders `<Launcher />` in its own content slot rather than
   `Launcher` being a separate top-level page.

Implemented local interactions include: the Ctrl/⌘K listener, command-palette
focus return, the launcher toggle, and the app-strip's active-item highlighting
are all real `useState`/`useEffect` — read `src/shell/Shell.tsx` directly for
the wiring, not just this summary.

The reusable shell itself lives in the package as
`@busyoffice/design-system/shell` (`Shell`, `ShellProps`, `validateShellNavigation`
— see `docs/Shell.md`); `AppShell.tsx` is a sample host composition over it
with sample modules, pinned apps and commands. `AppShell` is also exported to
this repository's demo through `@busyoffice/design-system/examples/app-shell`,
a preview-only subpath; the production contract is `Shell`.
