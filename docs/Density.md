---
category: layout
tests:
  - test/browser/density.spec.ts
  - test/components.test.ts
---

Applies one of three density tiers — `"compact" | "comfortable" | "spacious"` — to its subtree. `Button`, `Input`, `Dropdown`'s trigger, filter `Chip`, and `Table` head/cells/rows no longer hard-code their own height/padding/font size: they read one shared `density` alias group (`controlHeight`, `rowHeight`, `cellPaddingX`, `cellPaddingY`, `fieldGap`, `fontSize`) ambiently, and `Density` is what changes that group's values for everything underneath it. `comfortable` is the group's own default (so a page needs no `Density` at all to get it); wrapping a region in `Density value="compact"` (or `"spacious"`) swaps every one of those aliases at once. Tiers nest — a `compact` region inside an otherwise-comfortable page renders both correctly, and more generally the nearest `Density` ancestor always wins, the same as any CSS custom property. Not for one-off sizing — `Density` changes a whole subtree's control/row/font scale together; to size a single instance without affecting its neighbors, use that component's own per-instance override (`size="compact"` on `Button`/`Input`, `density="compact"` on `Table`) — both are deprecated and will be removed once the rest of milestone M3 lands, but still work today.

```jsx
<Density value="compact">
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <Button variant="secondary">Export</Button>
    <Dropdown label="Status" items={[{ label: 'Open', selected: true }, { label: 'Closed' }]} onSelect={() => {}} />
  </div>
</Density>
```
