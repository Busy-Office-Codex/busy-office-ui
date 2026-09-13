---
category: forms
---

Labeled text field. `label` renders a caption above the field; `error` (a string) renders a red border plus a red caption message below — use it for validation errors, not general help text.

```jsx
<Input label="Vendor name" placeholder="Acme Supply Co." />
<Input label="Tax ID" error="Tax ID must be 9 digits." />
```
