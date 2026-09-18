---
category: data-display
tests:
  - test/browser/compact-controls.spec.ts
  - test/browser/table-header-contrast.spec.ts
  - test/browser/table-row-separator.spec.ts
  - test/browser/table-row-uniformity.spec.ts
  - test/browser/billing.spec.ts
  - test/components.test.ts
---

Compound table primitive for tabular data. Compose with `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell` — content is expressed as nested children (not a data-array prop), so cells can hold any real component (e.g. a `Chip` for a status column). `TableHeaderCell`/`TableCell` both take an optional `align="start" | "end"` (use `"end"` for numeric columns).

A `TableRow` with an `onClick` is real, keyboard-operable interaction, not just a mouse cue (M10, issue #24) — it becomes tab-focusable, Enter/Space triggers the same click, and it renders a visible `:focus-visible` ring (inset, unlike `Card`'s outset one, since a row has no independent box separation from its neighbors). This is the row-selection pattern 10 real `examples/*.tsx` screens already use (list+detail, `docs/layouts.md`): pass `onClick` plus a background driven by `color.bgSelected` when the row is the current selection.

Row height, cell padding, and body cell font size all come from the ambient density tier (see `Density`) — `TableCell` text renders at 14px comfortable (the page default), 13px inside a compact `Density` region, 15px inside spacious, and cell padding/row height tighten or loosen the same way. `TableHeaderCell` is the one exception: it always renders at a fixed treatment (12.5px `sizeCaption`, uppercase, `.04em` tracked, `textSecondary`) regardless of density — only its padding follows the tier, so header and body columns stay aligned. (ROADMAP item 12, 2026-09-14 design review: this was previously the compact `overline` treatment — 11px, `textTertiary` — but `textTertiary` on the header's `bgCanvas` background measured 4.34:1, failing WCAG AA's 4.5:1 body-text threshold; the corrected pairing measures ~7.24:1.) The header row itself sits on `bgCanvas`, distinct from the `bgSubtle` fill used for other subtle surfaces; body row separators use the lighter `borderSubtle` token rather than the frame's own `border`, so rows read as visually distinct from the table's outer frame.

There is no per-instance density override — wrap the table in `<Density value="compact">` for a compact table (ROADMAP item 16 removed the earlier `density="compact"` prop once every call site had migrated to that). Not for a single record's fields — Table is for row-per-record listings; use `Card` with `Text` for a record-detail layout.

```jsx
<Density value="compact">
  <Table>
    <TableHead>
      <TableRow>
        <TableHeaderCell>Order</TableHeaderCell>
        <TableHeaderCell>Status</TableHeaderCell>
        <TableHeaderCell align="end">Amount</TableHeaderCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow onClick={() => {}} style={{ backgroundColor: color.bgSelected }}>
        <TableCell>PO-1042</TableCell>
        <TableCell><Chip variant="status" tone="accent">Awaiting</Chip></TableCell>
        <TableCell align="end">$1,240.00</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</Density>
```
