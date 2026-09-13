# UI design conventions

## Setup

Use the React exports from `@busyoffice/design-system` and import
`@busyoffice/design-system/styles.css`. No provider is required. Buildable
examples live in `examples/`; the standalone preview renders those React sources.
Canvas/global-bundle exports are a separate design-tool integration, not the
runtime package setup. Real component prop types remain authoritative.

## Styling idiom: props only, no exposed classes or tokens

This design system is built with StyleX (compile-time atomic CSS). The compiled `styles.css` contains only hashed, opaque custom-property names — **never write CSS or hand-author classes against these names**; they are internal implementation detail, not a public vocabulary, and are not guaranteed stable across builds (they are re-hashed on every rebuild). There is no utility-class family and no public design-token API to compose from directly.

Instead, style exclusively through each component's own props:

- **`Button`**: `variant="primary" | "secondary" | "ghost" | "danger"` (pill-shaped, 40px tall). `primary` = solid ink/navy (the accent color is reserved for focus rings and selection, not the primary CTA); `secondary` = neutral subtle surface; `ghost` = transparent until hovered; `danger` = red outline, filled red only while pressed — use for destructive actions like delete. Standard button attributes (`disabled`, `onClick`, etc.) pass through.
- **`Text`**: `variant="display" | "heading" | "title" | "body" | "caption" | "overline"` controls the type scale — `display` (40px, boldest, page heroes) → `heading` (24px, section headers) → `title` (17px, card/subsection headers) → `body` (15px, copy) → `caption` (12.5px, secondary-colored metadata/labels) → `overline` (11px, uppercase, tracked, tertiary-colored, for eyebrow/category labels). `as` overrides the rendered element (defaults follow semantic HTML — `display`→`h1`, `body`→`p`, etc.).
- **`Input`**: `label` renders a caption-style label above the field; `error` (a string) renders a red border plus a red caption message below the field — use it for validation errors, not general help text. The typed contract (`Input.d.ts`) exposes `label`, `error`, `className`, `id`, `style`, `children` — other native `<input>` attributes are forwarded at runtime but are not part of the declared prop types, so prefer sticking to the documented props when composing.
- **`Chip`**: two variants. `variant="filter"` (default) is an interactive pill button — `selected` fills it ink/dark with white text, `onRemove` adds a trailing `×` when selected. `variant="status"` is a static, non-interactive tag with a `tone`: `"neutral"` (subtle gray, default), `"strong"` (darker gray), `"accent"` (solid blue, for counts/highlights), `"danger"` (red outline, for overdue/error tags).
- **`Card`**: a container with `selected` (accent border ring) and `disabled` (muted background, faded, no shadow) boolean props. Pass an `onClick` to make it interactive (adds hover elevation/pointer cursor automatically) — omit `onClick` for a purely static card.
- **`Modal`**: controlled via `open` (boolean) + `onClose`. `title` (string) and `children` (body content) are required content slots; `actions` takes the footer button row (typically one or two `Button`s). Renders as a full-screen translucent overlay with a centered glass panel — there is no built-in trigger, the host app owns the `open` state. The panel is a `role="dialog"` with `aria-modal` named by `title` (title renders as an `h2`); on open it focuses the first focusable child (or the panel), Tab from the last child / Shift+Tab from the first wrap inside it, Escape (when `onClose` is set) and backdrop clicks call `onClose`, and on close focus returns to the element that was focused when it opened if that element is still visible and enabled.
- **`Dropdown`**: `label` (trigger text), `items` (array of `{ label, selected? }`), `onSelect`. Manages its own open/closed state internally (click the trigger to toggle) — the trigger appears filled/dark whenever any item is `selected`. **Only usable from real JSX/React code** — its `items` prop is an array, which cannot be expressed in the `.dc.html` template format's `<x-import>` syntax (attributes are plain strings only). A static page template needing a filter/select affordance should use `Chip` (`variant="filter"`) instead.
- **`Table` / `TableHead` / `TableBody` / `TableRow` / `TableHeaderCell` / `TableCell`**: a compound table — deliberately children-based (not a `rows` data-array prop) so any real component (e.g. a `Chip`) can be composed inside a cell, and so it stays usable from the `.dc.html` template format. `TableHeaderCell`/`TableCell` take an optional `align="start" | "end"` (use `"end"` for numeric columns).

- **`Shell`** (`@busyoffice/design-system/shell`): the application chrome — `navigation` (host-owned `routes`/`activeRouteId`/`onNavigate`), `pinned` dock tiles, `commands` for the palette, `brand`/`account`/`home` slots and `children` as the page. Hosts keep routing, page retention, command execution and permissions; the shell keeps palette/launcher state and the keyboard/focus contracts. See `docs/Shell.md`.

For any layout or spacing outside these components (page structure, grids, gaps), use plain inline styles or your own CSS — this design system does not yet ship layout primitives or a spacing scale the agent can reach for.

## Where the truth lives

- `src/components/`: authoritative React prop types and implementation.
- `src/tokens.stylex.ts`: private internal component styling, not a consumer API.
- `examples/`: real buildable page and shell compositions.
- `dist/design-system.css`: generated stylesheet; do not edit or extract hashed tokens.

Claude Design canvas templates use a different format and are not application
source. Keep canvas synchronization separate from React implementation; do not
assume canvas files are available in this checkout.

## Example composition

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
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary">Save vendor</Button>
        <Button variant="ghost">Cancel</Button>
      </div>
    </Card>
  );
}
```
