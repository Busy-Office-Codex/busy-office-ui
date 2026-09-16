---
category: media
tests:
  - test/components.test.ts
---

A minimal, closed set of inline SVG glyphs — `name`: `"sliders" | "bell"` today. No icon font and no external icon library import (matches this package's existing bundle-size discipline); every glyph is hand-built from `<svg>` primitives, sized via `size` (pixel width/height, default 16) and colored via `color` (a CSS color value — typically one of this package's own `color.*` tokens, e.g. `color.textPrimary` — defaulting to `currentColor`). A new glyph needs its own real, named consumer the same way `Chart`'s bar/line/donut variants each did — "it might be useful later" is not enough on its own (Objective 3, `ROADMAP.md`).

Decorative by default: with no `title`, the `<svg>` renders `aria-hidden="true"` and contributes nothing to the accessibility tree — the right choice whenever the icon sits alongside visible text or inside a control that already carries its own accessible name (a button's own `aria-label`/`title`), which is what both real consumers below do today. Pass `title` only when the icon is the *sole* content of its own control with no accessible name anywhere else on it — that renders `role="img"` with a real `<title>` element instead, so a screen reader gets a name from the icon itself. Not for arbitrary or user-supplied graphics, illustrations, brand marks, or anything outside this file's own small `name` union — reach for a plain `<img>`/inline SVG in the host app for those; this component is deliberately a closed set, not a general icon-rendering primitive.

```jsx
<button type="button" aria-label="Control center">
  <Icon name="sliders" color={color.textPrimary} />
</button>
```
