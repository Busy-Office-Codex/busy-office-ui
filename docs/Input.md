---
category: forms
tests:
  - test/browser/compact-controls.spec.ts
  - test/browser/focus-ring-and-placeholder.spec.ts
  - test/components.test.ts
---

Labeled text field. Not for multi-line text — there is no textarea variant; `Input` always renders a single-line `<input>`. `label` renders a caption above the field; `error` (a string) renders a red border plus a red caption message below — use it for validation errors, not general help text. `size="default"` (44px, the default) `| "compact"` (36px — use for a toolbar-row search field, not a form field; the native HTML `size` attribute isn't forwarded, since this prop reuses the name). 36px matches the ERP skeleton reference's own measured search-bar height exactly (chosen over rounding to the 32px spacing-scale value `Button`'s compact size uses, since a search field's width-to-height feel benefits more from matching the reference precisely than from sharing a number with `Button`).

```jsx
<Input label="Vendor name" placeholder="Acme Supply Co." />
<Input label="Tax ID" error="Tax ID must be 9 digits." />
<Input placeholder="Search orders…" size="compact" />
```
