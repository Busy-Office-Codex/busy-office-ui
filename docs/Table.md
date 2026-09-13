---
category: data-display
tests:
  - test/browser/compact-controls.spec.ts
  - test/components.test.ts
---

Compound table primitive for tabular data. Compose with `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell` — content is expressed as nested children (not a data-array prop), so cells can hold any real component (e.g. a `Chip` for a status column). `TableHeaderCell`/`TableCell` both take an optional `align="start" | "end"` (use `"end"` for numeric columns). `Table` takes `density="default"` (`TableCell` text at 15px, the default) `| "compact"` (12.5px — use for a real, information-dense grid; plain unwrapped cell content otherwise inherits the 15px default with no per-cell override). Scoped to body cell text only: `TableHeaderCell` already renders at the compact `overline` size regardless of `density`, and row padding is unchanged either way. Not for a single record's fields — Table is for row-per-record listings; use `Card` with `Text` for a record-detail layout.

```jsx
<Table density="compact">
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
