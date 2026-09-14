---
category: layout
tests:
  - test/browser/shell-focus.spec.ts
  - test/browser/compact-controls.spec.ts
---

The reusable application shell, exported from `@busyoffice/design-system/shell`: command bar (brand slot, command-palette trigger, account slot), app strip (sibling routes of the active module), content slot, floating dock (launcher + pinned apps) and a launcher/home view. There is no sidebar. Not for a single standalone page — Shell assumes a multi-route host with an app strip and dock; compose `Card`/`Text`/`Button` directly for a one-off page instead of mounting the whole shell around it.

The host owns the route registry, the active route, page retention, command execution, counts and permissions; the shell owns presentation and transient state — palette open/closed (Ctrl/⌘K, Escape, close button, backdrop; focus returns to the opener; Tab is contained), launcher shown/hidden, `aria-current` on the active strip item, and the `role="status"` message when the registry fails `validateShellNavigation`.

```tsx
import { Shell, type ShellRoute } from '@busyoffice/design-system/shell';

const routes: ShellRoute[] = [
  { id: 'purchase-orders', module: 'Purchase', label: 'Purchase orders' },
  { id: 'suppliers', module: 'Purchase', label: 'Suppliers' },
  { id: 'sales-order', module: 'Sales', label: 'Sales order' },
];

<Shell
  navigation={{ routes, activeRouteId, onNavigate: setActiveRouteId }}
  pinned={[{ id: 'approvals', label: 'Approvals', count: 7 }, { id: 'sales', label: 'Sales', routeId: 'sales-order' }]}
  commands={[{ id: 'new-so', label: 'Create sales order', group: 'Actions', onRun: createSalesOrder }]}
  account={<Avatar />}
>
  {activePage}
</Shell>
```

Props: `navigation` (required: `routes`, `activeRouteId`, `onNavigate`), `pinned` (dock tiles; `routeId` makes one navigable, `count` adds a badge; a tile whose `routeId` is missing or not in `routes` renders disabled), `commands` (palette entries grouped by `group`, filtered by the search field; the shell calls `onRun` and closes), `brand` and `account` (command-bar slots), `home` (launcher content; defaults to a route grid grouped by module), `children` (the active page). Module names are host-defined strings. `validateShellNavigation` and the `SHELL_MAX_*` bounds (32 routes, 64-char ids, 80-char labels) are exported for hosts that build registries dynamically.

Chrome density matches the ERP skeleton reference. App-strip nav items render as a real `Button` with **`size="compact"` (deprecated, see docs/Button.md — 28px, `variant="secondary"|"ghost"` depending on `aria-current`)**, so they carry the branded `:focus-visible` ring and `:hover` states like any other `Button` — a host's own `account` content (e.g. a compact `Button` for a primary action) gets the same benefit for free, since `account` is a plain slot Shell only renders as given. Its `border-radius` is overridden to `radius.sm` (6px), not `Button`'s default capsule: per docs/design-conventions.md's capsule-vs-rectangle rule, this is a highlight behind existing nav text (a "you are here" indicator), not a discrete new action, matching the ERP skeleton reference exactly (`templates/erp-skeleton/Shell.dc.html`'s active tab is `border-radius:6px`) and `Dropdown`'s own highlighted-menu-item treatment. The override applies unconditionally, so an inactive item's `:hover` background carries the same radius, not a pill — untested directly, since every module in the current preview's route registry has exactly one route, so no inactive nav item is ever rendered next to an active one; a known, disclosed gap, not a design decision that stops there.

The palette trigger (a 520px-wide search-bar look) is a density-aware command-bar control (ROADMAP item 10): its height and font size read the same ambient `controlHeight`/`fontSize` aliases `Button`/`Dropdown`/filter-`Chip` do (36px/14px comfortable — unchanged from before this task at the page's default density — 28px/13px under a compact `Density`, 44px/15px under spacious), even though it's a plain styled element rather than a real `Button` (its search-bar shape isn't one `Button`'s pill can produce even at a compact size). The command-bar's and app-strip's own *outer* bar heights (52px / 44px) and the dock launcher/pinned tiles (44×44px icon squares) are chrome containers, not controls, and stay fixed regardless of density — the ROADMAP text names "command-bar and app-strip **controls**", not the bars' own heights. Pinned tiles show a single uppercase initial as their glyph (`aria-label`/`title` still carry the full name); there is no Icon component yet to render a real glyph instead. These specific bespoke elements (the palette trigger, the dock/tiles) get the browser's default focus outline and no `:hover` treatment (both are CSS states plain inline styles can't express) — a known, disclosed gap for just this handful of icon/search-shaped controls, not the nav strip.
