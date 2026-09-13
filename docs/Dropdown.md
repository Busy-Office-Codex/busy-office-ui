---
category: forms
tests:
  - test/browser/dropdown-focus.spec.ts
  - test/browser/design-fidelity-fixes.spec.ts
  - test/state-channels.test.ts
---

Trigger + popover menu for picking one value from a list (a filter-style select). `label` is the trigger text, `items` is an array of `{ label, selected? }`, `onSelect` fires when an item is chosen. Manages its own open/closed state — the trigger fills in dark whenever any item is selected. The trigger's height and font size come from the ambient density tier (see `Density`) — the same `controlHeight`/`fontSize` aliases `Button` and filter `Chip` read, since all three are the one "always a capsule" shape family (docs/design-conventions.md): 36px/14px comfortable (the page default), 28px/13px inside a compact `Density` region, 44px/15px inside spacious. Dropdown has no size prop of its own to override that — wrap it in `Density` to change it. Not for multi-select — an item's `selected` is display-only and choosing one always closes the menu; compose filter `Chip`s for a multi-select filter row.

Full keyboard support: the trigger exposes `aria-haspopup="listbox"`/`aria-expanded`; ArrowDown/ArrowUp/Enter/Space on the trigger opens the menu; inside it, ArrowUp/ArrowDown move the highlight (wrapping at the ends), Home/End jump to the first/last item, Enter/Space selects the highlighted item, and Escape closes without selecting — both return focus to the trigger. Clicking outside the menu closes it without selecting. The menu is `role="listbox"` (labelled by `label`) with `role="option"`/`aria-selected` items and `aria-activedescendant` tracking the highlight.

```jsx
<Dropdown
  label="Status · Awaiting"
  items={[{ label: 'All' }, { label: 'Awaiting approval', selected: true }]}
  onSelect={(label) => console.log(label)}
/>
```
