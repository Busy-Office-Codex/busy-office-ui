---
category: data-display
tests:
  - test/browser/focus-ring-and-placeholder.spec.ts
  - test/browser/design-fidelity-fixes.spec.ts
  - test/state-channels.test.ts
---

Container block for displaying a piece of record/view state (e.g. a dashboard tile). `selected` shows an accent border ring and a `✓` badge in the top-right corner, so the state still reads without colour vision; on an interactive card (`onClick` given) it also sets `aria-pressed`. `disabled` mutes the background, fades content, sets `aria-disabled`, and removes the click handler and tab stop; pass `onClick` to make it interactive (adds hover elevation and pointer cursor automatically). Not for a row in a list of many records — Table's row/cell primitives handle that; reserve Card for tile/summary layouts. Padding is fixed, not density-tiered (M10, issue #24) — a tile container, not a control; wrap its own *content* in `Density` if that content needs a tier, the same way `docs/layouts.md`'s KPI-row pattern does.

```jsx
<Card>
  <Text variant="title">Open orders</Text>
  <Text variant="heading">128</Text>
  <Text variant="caption">+12 this week</Text>
</Card>
<Card selected onClick={() => {}}>
  <Text variant="title">Pending approvals</Text>
  <Text variant="heading">14</Text>
</Card>
<Card disabled>
  <Text variant="title">Archived</Text>
  <Text variant="heading">0</Text>
</Card>
```
