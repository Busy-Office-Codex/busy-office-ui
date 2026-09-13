---
category: forms
---

Trigger + popover menu for picking one value from a list (a filter-style select). `label` is the trigger text, `items` is an array of `{ label, selected? }`, `onSelect` fires when an item is chosen. Manages its own open/closed state — the trigger fills in dark whenever any item is selected.

```jsx
<Dropdown
  label="Status · Awaiting"
  items={[{ label: 'All' }, { label: 'Awaiting approval', selected: true }]}
  onSelect={(label) => console.log(label)}
/>
```
