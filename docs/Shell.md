---
category: layout
tests:
  - test/browser/shell-focus.spec.ts
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

Chrome density matches the ERP skeleton reference. App-strip nav items render as a real `Button` with `size="compact"` (32px, `variant="secondary"|"ghost"` depending on `aria-current`), so they carry the branded `:focus-visible` ring and `:hover` states like any other `Button` — a host's own `account` content (e.g. a compact `Button` for a primary action) gets the same benefit for free, since `account` is a plain slot Shell only renders as given. The palette trigger (a 520×36px search-bar look), and the dock launcher/pinned tiles (44×44px icon squares), stay plain styled elements rather than `Button` — their shape (a rectangular search bar; a fixed icon square) isn't one `Button`'s pill shape can produce even at a compact size. Pinned tiles show a single uppercase initial as their glyph (`aria-label`/`title` still carry the full name); there is no Icon component yet to render a real glyph instead. These specific bespoke elements get the browser's default focus outline and no `:hover` treatment (both are CSS states plain inline styles can't express) — a known, disclosed gap for just this handful of icon/search-shaped controls, not the nav strip.
