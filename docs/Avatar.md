---
category: data-display
tests:
  - test/components.test.ts
---

A decorative circular placeholder for a person or account with no photo — a plain filled circle, sized via `size` (pixel width/height, default 32). Always renders `aria-hidden="true"`: it shows no image and carries no identity data, so there is nothing for assistive tech to announce; the accessible name for who the avatar represents belongs on nearby visible text (a name label) or the control that hosts it, the same way every real consumer already works. Not for a real profile photo, an uploaded image, or an identity-bearing glyph (initials, a category color) — this component is deliberately just the gray placeholder shape; a photo/initial variant is a distinct, not-yet-proven need (`examples/Inbox.tsx`'s colored initial-letter avatar is the only consumer today, short of this package's own 2+-consumer bar for a new prop).

```jsx
<Avatar />
<Avatar size={64} />
```
