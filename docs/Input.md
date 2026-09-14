---
category: forms
tests:
  - test/browser/compact-controls.spec.ts
  - test/browser/focus-ring-and-placeholder.spec.ts
  - test/browser/page-composition.spec.ts
  - test/components.test.ts
---

Labeled text field. Not for multi-line text — there is no textarea variant; `Input` always renders a single-line `<input>`. `label` renders a caption above the field; `error` (a string) renders a red border plus a red caption message below — use it for validation errors, not general help text. Height and font size come from the ambient density tier (see `Density`) — the default size reads it directly, from the same `rowHeight`/`fontSize` aliases `Table`'s rows use (a text field is a content "row", not a pill-shaped control like `Button`): 40px/14px comfortable (the page default), 32px/13px inside a compact `Density` region, 48px/15px inside spacious. `size="search"` is a **fixed style, not a density override** — a 36px/13px search-bar treatment, independently matched to the ERP skeleton reference's own measured search-bar height (a real coincidence: that number equals `Button`'s comfortable `controlHeight`, not any `rowHeight` tier), used for a command/search-bar-style field like Shell's command palette or a list page's toolbar search. It stays fixed regardless of ambient `Density`, by design — wrapping it in `<Density value="compact">` has no effect on it (ROADMAP item 16; this was previously named `size="compact"`, which wrongly implied it tracked the density tiers the way `Button`'s old `compact` override did).

```jsx
<Input label="Vendor name" placeholder="Acme Supply Co." />
<Input label="Tax ID" error="Tax ID must be 9 digits." />
<Input placeholder="Search orders…" size="search" />
```
