---
category: forms
---

Trigger + popover menu for picking one value from a list (a filter-style select). `label` is the trigger text, `items` is an array of `{ label, selected? }`, `onSelect` fires when an item is chosen. Manages its own open/closed state — the trigger fills in dark whenever any item is selected.

Full keyboard support: the trigger exposes `aria-haspopup="listbox"`/`aria-expanded`; ArrowDown/ArrowUp/Enter/Space on the trigger opens the menu; inside it, ArrowUp/ArrowDown move the highlight (wrapping at the ends), Home/End jump to the first/last item, Enter/Space selects the highlighted item, and Escape closes without selecting — both return focus to the trigger. Clicking outside the menu closes it without selecting. The menu is `role="listbox"` (labelled by `label`) with `role="option"`/`aria-selected` items and `aria-activedescendant` tracking the highlight.

```jsx
<Dropdown
  label="Status · Awaiting"
  items={[{ label: 'All' }, { label: 'Awaiting approval', selected: true }]}
  onSelect={(label) => console.log(label)}
/>
```
