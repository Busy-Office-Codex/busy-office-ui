---
category: sample-page
tests:
  - test/sample-page-states.test.ts
  - test/browser/sample-pages-navigation.spec.ts
  - test/browser/shell-focus.spec.ts
---

`examples/RecordDetail.tsx` — a sales-order detail page (route id `sales-order-detail`, module `Sales`), composed only from package components (`Button`, `Card`, `Chip`, `Input`, `Modal`, `Text`). It renders the header (order title, status `Chip`, "Created…" caption) unconditionally, and takes a `state?: 'ready' | 'loading' | 'empty' | 'error' | 'forbidden'` prop (default `'ready'`) that controls what appears below the header. Not for a Claude Design canvas template — the reject-confirmation `Modal`'s open/close state is real React state; use it as a buildable page composition, not a static template.

- **`'ready'`** (default): shows the three summary `Card`s (order total, line items, requested by) and the approve/reject action row.
- **`'empty'`**: the record exists but has no summary/line-item data yet (e.g. a freshly-created draft) — the three summary cards are replaced by one placeholder `Card` ("This draft has no summary data yet. Add line items to see totals here."); the action row stays, since a draft can still be worked on.
- **`'loading'`**: the cards and action row are both replaced by an announced `role="status"` message, "Loading order details…" — there is nothing to act on yet.
- **`'error'`**: the cards and action row are both replaced by a `role="alert"` message plus a retry-shaped `Button` ("Retry").
- **`'forbidden'`**: the cards and action row are both replaced by an announced `role="status"` message explaining that access to this sales order is restricted.

```jsx
<RecordDetail state="empty" />
<RecordDetail state="loading" />
<RecordDetail state="error" />
<RecordDetail state="forbidden" />
<RecordDetail /> {/* state="ready", the default */}
```
