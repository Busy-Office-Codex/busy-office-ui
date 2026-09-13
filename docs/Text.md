---
category: typography
tests:
  - test/components.test.ts
---

Type-scale primitive used across every other component. `variant="display" | "heading" | "title" | "body" | "caption" | "overline"` controls size/weight/line-height — `display` (40px, page heroes) down to `overline` (11px, uppercase, tracked, for eyebrow/category labels). `as` overrides the rendered element. Not for interactive content — Text renders static markup only; use `Button`, `Input` or filter `Chip` for anything clickable or editable.

```jsx
<Text variant="heading">Sales orders awaiting approval</Text>
<Text variant="body">Approve, reject, or request changes.</Text>
```
