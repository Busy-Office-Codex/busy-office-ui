---
category: feedback
---

Full-screen overlay dialog that interrupts the flow to communicate or demand a response (confirm/cancel a delete, approve a change). Controlled via `open` + `onClose`; `title` and `children` are the header/body content slots, `actions` takes the footer button row. There is no built-in trigger — the host app owns the `open` state.

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
