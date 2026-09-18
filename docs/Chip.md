---
category: data-display
tests:
  - test/browser/focus-ring-and-placeholder.spec.ts
  - test/browser/design-fidelity-fixes.spec.ts
  - test/browser/table-row-uniformity.spec.ts
  - test/state-channels.test.ts
  - test/components.test.ts
---

Compact tag for displaying record or view state. `variant="status"` (default reading) is a static, non-interactive tone-colored tag — `tone="neutral" | "strong" | "accent" | "danger" | "success" | "warning"`; its size is fixed (24px, `sizeCaption` text) and does not respond to the ambient density tier — it's metadata, not a control. `variant="filter"` is an interactive pill — `selected` fills it dark, sets `aria-pressed`, and shows a leading `✓` and heavier text weight so the state doesn't rely on the fill colour alone; `onRemove` shows a trailing `×` when selected. Filter Chip's height and font size come from the ambient density tier (see `Density`) — the same `controlHeight`/`fontSize` aliases `Button` and `Dropdown`'s trigger read, since all three are the one "always a capsule" shape family (docs/design-conventions.md): 36px/14px comfortable (the page default), 28px/13px inside a compact `Density` region, 44px/15px inside spacious. Not for a primary action — Chip is a tag for filtering or status, not a call-to-action; use `Button` for that.

`success`/`warning` (added M10, issue #24) use the same outlined shape as `danger` — a bordered, tinted-text tag, not a filled background — so a semantic status color reads as a status, distinct from the generic filled `accent` tone. Use `success` for a genuinely positive/healthy state ("All systems operational"), `warning` for a pending/caution state ("Awaiting approval", "3 days overdue"), `danger` only for something actually wrong or blocking. `accent` is not a status color — avoid it for state that has a real success/warning/danger reading; it's for drawing attention to a value without implying good or bad (a count, a highlight).

```jsx
<Chip variant="status" tone="danger">Overdue 12d</Chip>
<Chip variant="status" tone="success">Active</Chip>
<Chip variant="status" tone="warning">Awaiting approval</Chip>
<Chip variant="filter" selected onRemove={() => {}}>Awaiting approval</Chip>
```
