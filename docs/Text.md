---
category: typography
tests:
  - test/components.test.ts
  - test/color-contrast.test.ts
  - test/browser/palette-contrast.spec.ts
---

Type-scale primitive used across every other component. `variant="display" | "heading" | "title" | "body" | "caption" | "overline"` controls size/weight/line-height — `display` (40px, page heroes) down to `overline` (11px, uppercase, tracked, for eyebrow/category labels). `as` overrides the rendered element (each variant maps to a sensible default: `display`→`h1`, `heading`→`h2`, `title`→`h3`, `body`→`p`, `caption`/`overline`→`span`). Not for interactive content — Text renders static markup only; use `Button`, `Input` or filter `Chip` for anything clickable or editable.

```jsx
<Text variant="display">128</Text>
<Text variant="heading">Sales orders awaiting approval</Text>
<Text variant="title" as="span">Sales order SO-1042</Text>
<Text variant="body">Approve, reject, or request changes.</Text>
<Text variant="caption">Updated 2 minutes ago</Text>
<Text variant="overline">Open orders</Text>
```
