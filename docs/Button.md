---
category: actions
tests:
  - test/browser/compact-controls.spec.ts
  - test/browser/design-fidelity-fixes.spec.ts
  - test/browser/density.spec.ts
  - test/components.test.ts
---

Pill-shaped action trigger. `variant="primary"` (solid ink, the default call-to-action) `| "secondary"` (neutral subtle surface) `| "ghost"` (transparent until hovered, for low-emphasis actions) `| "danger"` (red outline, filled only while pressed — reserve for destructive actions like delete/reject). Height and font size come from the ambient density tier (see `Density`) — always: 36px/14px comfortable (the page default), 28px/13px inside a compact `Density` region, 44px/15px inside spacious. There is no per-instance size override — wrap the region in `<Density value="compact">` for a compact Button (ROADMAP item 16 removed the earlier `size="compact"` prop once every call site had migrated to that). Not for a toggled/pressed state — Button has no `selected` concept; use filter `Chip` or `Card`'s `selected` for that.

```jsx
<Button variant="primary">Approve</Button>
<Button variant="danger">Reject</Button>
<Density value="compact">
  <Button variant="secondary">Export</Button>
</Density>
```
