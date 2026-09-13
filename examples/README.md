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
| `ListReport.tsx` | `templates/list-report` | Filterable list: search, filter `Chip`s, a real `Dropdown`, a real `Table` |
| `RecordDetail.tsx` | `templates/record-detail` | Record header + `Chip` status, summary `Card` tiles, a `Modal` confirm flow |
| `Dashboard.tsx` | `templates/dashboard` | KPI `Card` grid with a selected state |
| `Login.tsx` | `templates/login` | A simple centered auth form |

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
no sidebar. Navigation is five pieces, all in `AppShell.tsx`:

1. **Command bar** — always visible, top of every page. Its named shared
   button opens the **command palette** with Enter, Space, or ⌘K/Ctrl+K.
   The palette search receives focus; Escape, its Close button, and the
   backdrop return focus to the opener when it remains connected, visible,
   and active. It is a full search/filter overlay (category
   `Chip`s: All/Orders/Customers/Invoices/Actions/Pages, an "Actions"
   section, a "Records" section) that a real app would wire to live search
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
are all real `useState`/`useEffect` — read `AppShell.tsx` directly for the
wiring, not just this summary.

The shell and launcher are also available to this repository's demo through
`@busyoffice/design-system/examples/app-shell`. This is a preview-only
composition subpath for local examples; it is not a production SDK contract.
