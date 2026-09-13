---
category: data-display
tests:
  - test/browser/compact-controls.spec.ts
  - test/components.test.ts
---

Compound table primitive for tabular data. Compose with `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell` — content is expressed as nested children (not a data-array prop), so cells can hold any real component (e.g. a `Chip` for a status column). `TableHeaderCell`/`TableCell` both take an optional `align="start" | "end"` (use `"end"` for numeric columns).

Row height, cell padding, and body cell font size all come from the ambient density tier (see `Density`) — `TableCell` text renders at 14px comfortable (the page default), 13px inside a compact `Density` region, 15px inside spacious, and cell padding/row height tighten or loosen the same way. `TableHeaderCell` is the one exception: it always renders at the compact `overline` treatment (11px, uppercase, tracked) regardless of density — only its padding follows the tier, so header and body columns stay aligned.

`Table`'s own `density="default" | "compact"` prop is a **deprecated** per-instance override, same contract as `Button`/`Input`'s `size="compact"`: it force-renders the compact tier (regardless of the ambient `Density`) by applying that tier directly to the `<table>` element, kept working for this release and to be removed once the rest of milestone M3 lands — prefer wrapping the table in `<Density value="compact">` instead. Not for a single record's fields — Table is for row-per-record listings; use `Card` with `Text` for a record-detail layout.

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
