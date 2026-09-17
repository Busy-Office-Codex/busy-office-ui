---
category: sample-page
tests:
  - test/browser/launcher.spec.ts
  - test/browser/launcher-favorites.spec.ts
  - test/browser/mobile-responsive.spec.ts
---

`examples/Launcher.tsx` — the Home/launcher screen, composed only from package components (`Button`, `Card`, `Chip`, `Text`). Mirrors `templates/erp-skeleton`'s "Home (launcher)" screen: a role-picked "For you" row, a "Favorites" row, a "Recent activity" list, then an "All apps" grid (folder-style tiles for Finance/BI/Administration). Meant to render as `AppShell`'s content when its dock's launcher tile is clicked (`AppShell.tsx` renders `<Launcher />` in its own content slot, rather than `Launcher` being a separate top-level route) — see `docs/AppShell.md`. Not for a Claude Design canvas template — favoriting is real `useState`/store-backed interaction; use it as a buildable page composition, not a static template.

Unlike `ListReport`/`RecordDetail`, this page has no `state` prop — it is always "ready"; there is no loading/error/forbidden case for the Home screen itself.

- **For you**: a static role-scoped row (`FOR_YOU`) — "My work", "Approvals", "Inbox", "Sales dashboard" — a fixed sample for one seeded "Sales manager" persona, not live-computed; a role-scoped landing view isn't something a single seeded persona can honestly demonstrate live.
- **Favorites**: real, stateful. `destination.id`-keyed via a shared `favoriteRouteIds` array in `examples/data/appStore.ts` (`appActions.toggleFavorite`) — kept in the shared store, not page-local state, because `Shell.tsx` genuinely unmounts this component on every navigation away from Home, which would otherwise lose every starred app on the next visit. Only a real, individually-navigable destination is favoritable — a folder tile (Finance/BI/Administration) represents a whole module, not one destination to pin, and a muted/unbuilt placeholder has nothing to navigate to yet. A first-time visitor sees this section's own honest empty state ("Star an app below to pin it here."), not a silently-hidden feature or an invented pre-favorited entry.
- **Recent activity**: reads the same shared `state.activity` log every other M7-slice screen already appends to (the same log `AuditLog.tsx` reads) — a real cross-screen fact, not a separate "recently viewed" log this page instruments on its own. Renders only when non-empty.
- **All apps**: a static grid (`ALL_APPS`) of every top-level destination, each resolved against the host's `destinations` prop when a matching route exists (real `onNavigate`) and otherwise disabled. Folder tiles (Finance, BI, Administration) and muted/unbuilt tiles (Builder, Settings, Administration) render but are not individually navigable or favoritable.

```jsx
<Launcher
  destinations={[{ id: 'sales/customers', label: 'Customers' }]}
  onNavigate={(routeId) => console.log(routeId)}
/>
```
