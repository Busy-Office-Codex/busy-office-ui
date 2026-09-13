---
category: data-display
---

Compact tag for displaying record or view state. `variant="status"` (default reading) is a static, non-interactive tone-colored tag — `tone="neutral" | "strong" | "accent" | "danger"`. `variant="filter"` is an interactive pill — `selected` fills it dark, `onRemove` shows a trailing `×` when selected.

```jsx
<Chip variant="status" tone="danger">Overdue 12d</Chip>
<Chip variant="filter" selected onRemove={() => {}}>Awaiting approval</Chip>
```
