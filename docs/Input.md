---
category: forms
tests:
  - test/browser/compact-controls.spec.ts
  - test/browser/focus-ring-and-placeholder.spec.ts
  - test/browser/page-composition.spec.ts
  - test/components.test.ts
---

Labeled text field. Not for multi-line text — there is no textarea variant; `Input` always renders a single-line `<input>`. `label` renders a caption above the field; `error` (a string) renders a red border plus a red caption message below — use it for validation errors, not general help text. Height and font size come from the ambient density tier (see `Density`) — `size="default"` reads it directly, from the same `rowHeight`/`fontSize` aliases `Table`'s rows use (a text field is a content "row", not a pill-shaped control like `Button`): 40px/14px comfortable (the page default), 32px/13px inside a compact `Density` region, 48px/15px inside spacious. **`size="compact"` is deprecated**: it's a per-instance override kept working for this release, but it does not track the density tiers at all — its 36px height was independently chosen to match the ERP skeleton reference's own measured search-bar height exactly (rather than rounding to `Button`'s compact number), and that specific match is preserved unchanged rather than being pulled onto the compact `rowHeight` tier (32px). It will be removed once the rest of milestone M3 lands; prefer wrapping the region in `<Density value="compact">` instead, accepting the small height difference that comes with using the shared tier.

```jsx
<Input label="Vendor name" placeholder="Acme Supply Co." />
<Input label="Tax ID" error="Tax ID must be 9 digits." />
<Input placeholder="Search orders…" size="compact" />
```
