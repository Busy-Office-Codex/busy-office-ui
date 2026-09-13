---
category: data-display
tests:
  - test/browser/focus-ring-and-placeholder.spec.ts
  - test/state-channels.test.ts
  - test/components.test.ts
---

Compact tag for displaying record or view state. `variant="status"` (default reading) is a static, non-interactive tone-colored tag — `tone="neutral" | "strong" | "accent" | "danger"`. `variant="filter"` is an interactive pill — `selected` fills it dark, sets `aria-pressed`, and shows a leading `✓` and heavier text weight so the state doesn't rely on the fill colour alone; `onRemove` shows a trailing `×` when selected. Not for a primary action — Chip is a tag for filtering or status, not a call-to-action; use `Button` for that.

```jsx
<Chip variant="status" tone="danger">Overdue 12d</Chip>
<Chip variant="filter" selected onRemove={() => {}}>Awaiting approval</Chip>
```
