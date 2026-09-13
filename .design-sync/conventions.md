# Building with @busyoffice/design-system

## Setup

Every component is on `window.BusyOfficeDesignSystem` (`Button`, `Card`, `Chip`, `Dropdown`, `Input`, `Modal`, `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`, `Text`). No provider or theme wrapper is required — load `styles.css` and use the components directly. The font is IBM Plex Sans (shipped in `fonts/`, wired through `styles.css`); do not substitute another family.

## Styling idiom: props only

This is a StyleX design system: the compiled stylesheet contains only hashed, opaque class and custom-property names. **Never author CSS classes or `var(--…)` tokens against it** — there is no utility-class family and no public token API. Style through each component's props:

- `Button`: `variant="primary" | "secondary" | "ghost" | "danger"` (pill). `primary` is solid ink; the accent blue is reserved for focus rings and selection. `danger` is a red outline — use for destructive actions. `size="default"` (40px, a page's one primary/rare action) `| "compact"` (32px, toolbar rows and repeated action bars). `disabled`, `onClick`, `type` pass through.
- `Text`: `variant="display" | "heading" | "title" | "body" | "caption" | "overline"` is the entire type scale (40 → 24 → 17 → 15 → 12.5 → 11px). `as` overrides the element (defaults: display→h1, heading→h2, title→h3, body→p, caption/overline→span). Use it for all copy; never raw `<h1>`/`<p>`.
- `Input`: `label` renders a caption label above; `error` (string) renders a red border plus a red message — validation only, not help text. `size="default"` (44px) `| "compact"` (36px, toolbar search fields). `placeholder`, `value`, `onChange`, `disabled` are forwarded.
- `Chip`: `variant="filter"` (default) is an interactive pill — `selected` fills it ink, `onRemove` adds a trailing ×. `variant="status"` is a static tag with `tone="neutral" | "strong" | "accent" | "danger"` (`accent` for counts/highlights, `danger` for overdue/errors).
- `Card`: container with `selected` (accent ring) and `disabled` (muted); pass `onClick` to make it interactive (hover elevation, pointer).
- `Modal`: controlled by `open` + `onClose`; `title` (string) and `children` are the content slots, `actions` is the footer button row (usually a `ghost` and a `primary`/`danger` `Button`). The host owns `open` state; there is no built-in trigger.
- `Dropdown`: `label` (trigger text), `items: { label, selected? }[]`, `onSelect(label)`. Manages its own open state; `defaultOpen` for an initially open menu.
- `Table` + `TableHead`/`TableBody`/`TableRow`/`TableHeaderCell`/`TableCell`: children-based compound table so any component (e.g. a status `Chip`) can sit in a cell. `TableHeaderCell`/`TableCell` take `align="start" | "end"` — use `"end"` for numeric columns. `Table` takes `density="default" | "compact"` (12.5px body cell text for a dense grid; header cells and row padding are unaffected).

For page layout outside these components (grids, gaps, page padding, surfaces) use plain inline styles or your own CSS — the system ships no layout primitives or spacing scale. Page background is `#f8fafc`; surfaces and table frames are white with a `1px solid #e2e8f0` border and 10–12px radius.

## Where the truth lives

- `components/<group>/<Name>/<Name>.d.ts` — the authoritative prop contract for each component.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage notes and examples.
- `guidelines/docs/design-conventions.md` — the full conventions document from the repo; the per-component docs sit beside it in `guidelines/docs/`.
- `styles.css` and its imports — the shipped stylesheet (read, never hand-extend).

## Idiomatic build snippet

```jsx
const { Button, Card, Chip, Dropdown, Input, Text } = window.BusyOfficeDesignSystem;

function OrdersPanel() {
  return (
    <Card>
      <Text variant="title">Sales orders</Text>
      <div style={{ display: 'flex', gap: 8 }}>
        <Dropdown label="Status · Awaiting" items={[{ label: 'All' }, { label: 'Awaiting approval', selected: true }]} />
        <Chip variant="status" tone="accent">7 waiting</Chip>
      </div>
      <Input label="Vendor name" placeholder="Acme Supply Co." />
      <Input label="Tax ID" error="Tax ID must be 9 digits." />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save vendor</Button>
      </div>
    </Card>
  );
}
```
