---
category: data-display
---

Compound table primitive for tabular data. Compose with `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell` — content is expressed as nested children (not a data-array prop), so cells can hold any real component (e.g. a `Chip` for a status column). `TableHeaderCell`/`TableCell` both take an optional `align="start" | "end"` (use `"end"` for numeric columns).

```jsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeaderCell>Order</TableHeaderCell>
      <TableHeaderCell>Status</TableHeaderCell>
      <TableHeaderCell align="end">Amount</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>PO-1042</TableCell>
      <TableCell><Chip variant="status" tone="accent">Awaiting</Chip></TableCell>
      <TableCell align="end">$1,240.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```
