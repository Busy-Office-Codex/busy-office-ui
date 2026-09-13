---
category: feedback
tests:
  - test/browser/modal-focus.spec.ts
  - test/components.test.ts
---

Full-screen overlay dialog that interrupts the flow to communicate or demand a response (confirm/cancel a delete, approve a change). Controlled via `open` + `onClose`; `title` and `children` are the header/body content slots, `actions` takes the footer button row. There is no built-in trigger — the host app owns the `open` state. Not for a non-blocking notice — Modal always traps focus and blocks the page; use a status `Chip` or inline `Text` for something that shouldn't interrupt the user.

Accessibility: `Modal` renders on the native `<dialog>` element, opened with `showModal()` and closed with `close()` as the `open` prop changes — never with conditional rendering, so the imperative calls always have an element to act on. A `<dialog>` shown modally puts the rest of the page in the browser's top-layer inertness: it is unfocusable, unreachable by Tab, and absent from the accessibility tree, not just visually dimmed. That also gives initial focus and focus-restore-on-close for free: opening moves focus to the first focusable child (or the dialog itself); closing returns focus to whatever was focused before it opened. Tab from the last focusable child still wraps to the first and Shift+Tab from the first still wraps to the last, but that loop is handled explicitly, not left to the browser — Chromium does not reliably self-contain Tab within a modal dialog's remaining focusable set. `role="dialog"` and `aria-modal="true"` are set explicitly too, for older assistive tech that doesn't infer them from the element; the dialog is named by `title`, which also renders as an `h2`. Escape (when `onClose` is set) and clicking the backdrop call `onClose`; without `onClose`, both are no-ops and the dialog stays open. A closed `Modal` stays mounted with no `open` attribute, which the UA stylesheet renders as `display: none` — hidden and out of the accessibility tree, same as before, but not unmounted, so state inside `children` persists across a close/reopen.

```jsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Reject SO-1042?"
  actions={<><Button variant="ghost">Cancel</Button><Button variant="danger">Reject</Button></>}
>
  The requester and Finance will see your comment in the record history.
</Modal>
```
