---
category: feedback
---

Full-screen overlay dialog that interrupts the flow to communicate or demand a response (confirm/cancel a delete, approve a change). Controlled via `open` + `onClose`; `title` and `children` are the header/body content slots, `actions` takes the footer button row. There is no built-in trigger — the host app owns the `open` state.

Accessibility: the panel is `role="dialog"` with `aria-modal="true"`, named by `title`; the title renders as an `h2`. Opening moves focus to the first focusable child (or the panel itself); Tab from the last focusable child wraps to the first and Shift+Tab from the first wraps to the last; Escape (when `onClose` is set) and clicking the backdrop call `onClose`; closing returns focus to whatever was focused before it opened, when that element is still connected, visible and enabled. The page behind is not made `inert` — `aria-modal` is the only screen-reader containment.

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
