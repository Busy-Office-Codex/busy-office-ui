---
category: sample-page
tests:
  - test/sample-page-states.test.ts
  - test/browser/sample-pages-states.spec.ts
  - test/browser/sample-pages-navigation.spec.ts
  - test/browser/compact-controls.spec.ts
  - test/browser/dropdown-focus.spec.ts
---

`examples/ListReport.tsx` — a filterable purchase-order list page (route id `purchase-orders`, module `Purchase`), composed only from package components (`Button`, `Card`, `Chip`, `Dropdown`, `Input`, `Table`, `Text`). It renders the header and filter/search toolbar unconditionally, and takes a `state?: 'ready' | 'loading' | 'error' | 'forbidden'` prop (default `'ready'`) that controls what appears below the toolbar, in place of the table region. Not for a Claude Design canvas template — its `Dropdown` usage requires real JSX (see `docs/design-conventions.md`); use it as a buildable page composition, not a static template.

- **`'ready'`** (default): shows the real `Table` of purchase orders, filterable by the toolbar's chips, status `Dropdown` and search `Input`. **Empty** is a reachable case of `'ready'`, not a separate literal — when the toolbar's filters match zero orders, the table body shows one caption row reading "No purchase orders match these filters." instead of a distinct empty-state prop, since it is entirely a consequence of the toolbar's own filter state.
- **`'loading'`**: the table region is replaced by an announced `role="status"` message, "Loading purchase orders…".
- **`'error'`**: the table region is replaced by a `role="alert"` message plus a retry-shaped `Button` ("Retry").
- **`'forbidden'`**: the table region is replaced by an announced `role="status"` message explaining that purchasing access is restricted.

```jsx
<ListReport state="loading" />
<ListReport state="error" />
<ListReport state="forbidden" />
<ListReport /> {/* state="ready", the default */}
```
