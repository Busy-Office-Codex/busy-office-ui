---
category: actions
tests:
  - test/browser/compact-controls.spec.ts
  - test/browser/design-fidelity-fixes.spec.ts
  - test/browser/density.spec.ts
  - test/components.test.ts
---

Pill-shaped action trigger. `variant="primary"` (solid ink, the default call-to-action) `| "secondary"` (neutral subtle surface) `| "ghost"` (transparent until hovered, for low-emphasis actions) `| "danger"` (red outline, filled only while pressed — reserve for destructive actions like delete/reject). Height and font size come from the ambient density tier (see `Density`) — `size="default"` reads it directly (36px/14px comfortable, the page default; 28px/13px inside a compact `Density` region, 44px/15px inside spacious). **`size="compact"` is deprecated**: it's a per-instance override that force-renders the compact tier's own numbers (28px/13px) regardless of the ambient density — kept working for this release so existing call sites don't break, but it will be removed once the rest of milestone M3 lands; prefer wrapping the region in `<Density value="compact">` instead. Not for a toggled/pressed state — Button has no `selected` concept; use filter `Chip` or `Card`'s `selected` for that.

```jsx
<Button variant="primary">Approve</Button>
<Button variant="danger">Reject</Button>
<Button variant="secondary" size="compact">Export</Button>
```
