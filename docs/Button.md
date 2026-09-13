---
category: actions
tests:
  - test/browser/compact-controls.spec.ts
  - test/browser/design-fidelity-fixes.spec.ts
  - test/components.test.ts
---

Pill-shaped action trigger. `variant="primary"` (solid ink, the default call-to-action) `| "secondary"` (neutral subtle surface) `| "ghost"` (transparent until hovered, for low-emphasis actions) `| "danger"` (red outline, filled only while pressed — reserve for destructive actions like delete/reject). `size="default"` (40px, the default — use for a page's one primary/rare action) `| "compact"` (32px, smaller label — use for toolbar rows, repeated action bars and chrome-level controls where several buttons sit together). Not for a toggled/pressed state — Button has no `selected` concept; use filter `Chip` or `Card`'s `selected` for that.

```jsx
<Button variant="primary">Approve</Button>
<Button variant="danger">Reject</Button>
<Button variant="secondary" size="compact">Export</Button>
```
