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

- **`Density`**: wraps a subtree in one of three tiers — `value="compact" | "comfortable" | "spacious"`. `Button`, `Input`, `Dropdown`'s trigger, filter `Chip`, and `Table` head/cells/rows take their height, padding and font size only from this ambient tier (never a hard-coded value) — `comfortable` is the default a page gets with no `Density` at all; wrapping a region in `Density` changes every one of those components together, at once. Tiers nest (the nearest `Density` ancestor wins, like any CSS custom property). See `docs/Density.md`.
- **`Button`**: `variant="primary" | "secondary" | "ghost" | "danger"` (pill-shaped). `primary` = solid ink/navy (the accent color is reserved for focus rings and selection, not the primary CTA); `secondary` = neutral subtle surface; `ghost` = transparent until hovered; `danger` = red outline, filled red only while pressed — use for destructive actions like delete. Height/font size come from the ambient `Density` tier: 36px comfortable / 28px compact / 44px spacious — there is no per-instance size override; wrap the region in `<Density value="compact">` for a compact Button (ROADMAP item 16). Standard button attributes (`disabled`, `onClick`, etc.) pass through.
- **`Text`**: `variant="display" | "heading" | "title" | "body" | "caption" | "overline"` controls the type scale — `display` (40px, boldest, page heroes) → `heading` (24px, section headers) → `title` (17px, card/subsection headers) → `body` (15px, copy) → `caption` (12.5px, secondary-colored metadata/labels — display-only; not a density concept) → `overline` (11px, uppercase, tracked, tertiary-colored, for eyebrow/category labels). `as` overrides the rendered element (defaults follow semantic HTML — `display`→`h1`, `body`→`p`, etc.).
- **`Input`**: `label` renders a caption-style label above the field; `error` (a string) renders a red border plus a red caption message below the field — use it for validation errors, not general help text. Height/font size come from the ambient `Density` tier, via the same `rowHeight` alias `Table`'s rows use: `size="default"` (40px comfortable / 32px compact / 48px spacious). `size="search"` is a **fixed style, not a density override** — 36px/13px, independently matched to the ERP reference's search-bar height, for a command/search-bar-style field (Shell's command palette, a list page's toolbar search); it does not track ambient `Density` (ROADMAP item 16). The typed contract (`Input.d.ts`) exposes `label`, `error`, `size`, `className`, `id`, `style`, `children` — other native `<input>` attributes are forwarded at runtime but are not part of the declared prop types, so prefer sticking to the documented props when composing.
- **`Chip`**: two variants. `variant="filter"` (default) is an interactive pill button — `selected` fills it ink/dark with white text, `onRemove` adds a trailing `×` when selected; its height/font size come from the ambient `Density` tier (the same `controlHeight` alias `Button`/`Dropdown`'s trigger use — all three are one capsule shape family, see below). `variant="status"` is a static, non-interactive tag with a `tone`: `"neutral"` (subtle gray, default), `"strong"` (darker gray), `"accent"` (solid blue, for counts/highlights), `"danger"` (red outline, for overdue/error tags) — fixed-size metadata, not density-aware.
- **`ButtonGroup`**: a small, fixed set of mutually-exclusive options (`options`, `value`, `onChange`, required `aria-label`) rendered as one joined pill — the WAI-ARIA radio-group pattern (roving tabindex, arrow keys move *and* select, Home/End jump to the ends), not a row of separately-spaced pills. The selected segment fills ink/dark like `Button`'s primary variant and filter `Chip`'s `selected` state. Height/font size come from the ambient `Density` tier, same `controlHeight` alias as `Button`/`Dropdown`'s trigger/filter `Chip`. An `option.disabled` segment stays visible, dimmed, with an optional `ariaLabel` explaining why — see `docs/ButtonGroup.md`. Use filter `Chip` instead for an arbitrary-length or independently-spaced option row (see `examples/filterTabs.tsx`).
- **`Card`**: a container with `selected` (accent border ring) and `disabled` (muted background, faded, no shadow) boolean props. Pass an `onClick` to make it interactive (adds hover elevation/pointer cursor, a `role="button"`, keyboard focus and a focus-visible ring, and Enter/Space activation automatically) — omit `onClick` for a purely static card.
- **`Modal`**: controlled via `open` (boolean) + `onClose`. `title` (string) and `children` (body content) are required content slots; `actions` takes the footer button row (typically one or two `Button`s). Renders as a full-screen translucent overlay with a centered glass panel — there is no built-in trigger, the host app owns the `open` state. The panel is a `role="dialog"` with `aria-modal` named by `title` (title renders as an `h2`); on open it focuses the first focusable child (or the panel), Tab from the last child / Shift+Tab from the first wrap inside it, Escape (when `onClose` is set) and backdrop clicks call `onClose`, and on close focus returns to the element that was focused when it opened if that element is still visible and enabled.
- **`Dropdown`**: `label` (trigger text), `items` (array of `{ label, selected? }`), `onSelect`, `active`. Manages its own open/closed state internally (click the trigger to toggle) — the trigger appears filled/dark only when `active` is true (a real narrowed filter), never merely because an item is `selected` (`selected` is menu-only — which item shows the checkmark — since a default "All …" item is typically marked `selected` too; see `docs/Dropdown.md`). Its height/font size come from the ambient `Density` tier (the same `controlHeight` alias as `Button`/filter `Chip`); option rows read that same tier's font size too. It has no size prop of its own to override that. **Only usable from real JSX/React code** — its `items` prop is an array, which cannot be expressed in the `.dc.html` template format's `<x-import>` syntax (attributes are plain strings only). A static page template needing a filter/select affordance should use `Chip` (`variant="filter"`) instead.
- **`Table` / `TableHead` / `TableBody` / `TableRow` / `TableHeaderCell` / `TableCell`**: a compound table — deliberately children-based (not a `rows` data-array prop) so any real component (e.g. a `Chip`) can be composed inside a cell, and so it stays usable from the `.dc.html` template format. `TableHeaderCell`/`TableCell` take an optional `align="start" | "end"` (use `"end"` for numeric columns). Row height, cell padding and body cell font size come from the ambient `Density` tier: 14px/comfortable body text by default, 13px compact, 15px spacious (header cells always render at a fixed 12.5px `sizeCaption`/`textSecondary`/uppercase/`.04em`-tracked treatment regardless of density; only their padding follows the tier — corrected off the compact `overline` size in ROADMAP item 12, 2026-09-14 design review, since `overline`'s `textTertiary` color failed WCAG AA contrast on the header background). There is no per-instance density override — wrap the table in `<Density value="compact">` for a compact table (ROADMAP item 16).

- **`Shell`** (`@busyoffice/design-system/shell`): the application chrome — `navigation` (host-owned `routes`/`activeRouteId`/`onNavigate`), `pinned` dock tiles, `commands` for the palette, `brand`/`account`/`home` slots and `children` as the page. Hosts keep routing, page retention, command execution and permissions; the shell keeps palette/launcher state and the keyboard/focus contracts. Its command-bar palette trigger is density-aware the same way; see `docs/Shell.md`.

### Capsule vs. rounded rectangle

`Button`, filter `Chip`, and `Dropdown`'s trigger always render as a full capsule (`radius.pill`, 999px) — that shape is not a per-use choice, it's what those three components *are*. The rule below governs the cases *outside* those three: whenever chrome composes a highlight or an icon-only control by hand (as `Shell` does for its own chrome) rather than reaching for one of them.

**Capsule** — a control that is its own complete, single-line action, displayed beside peers of the same kind (a row of filter dropdowns, a pair of primary/secondary action buttons, a row of filter chips). The full pill reads as "a discrete thing you press."

**Rounded rectangle** (`radius.sm`/`md`/`lg`, scaled to the element — never `radius.pill`) — everything else, for one of two reasons:
1. **It holds more than a single text label** — a search bar with icon + placeholder + shortcut hint, a stat-tile `Card` (label + value + caption), `Modal`'s panel (header + body + actions), an icon-only utility square (a dock tile, a notification bell). A 999px radius only reads as "rounded" on a short, uniform-height element; on anything wider, taller, or square it either does nothing visible or turns the shape into a literal circle.
2. **It's a highlight behind existing content, not a new action** — e.g. `Shell`'s active app-strip tab: a "you are here" indicator painted behind nav text that's already part of the persistent chrome, not a call-to-action. `Dropdown`'s own highlighted/hovered menu item uses the same reasoning and the same token (`radius.sm`) for exactly this case.

One-line test: is it a thing you click to *do* something, standing next to peers of the same kind? → capsule. Is it a container with structure, or a highlight showing current state/position? → rounded rectangle, radius scaled to size, never a capsule.

For any layout or spacing outside these components (page structure, grids, gaps), use plain inline styles or your own CSS — this design system does not yet ship layout primitives or a spacing scale the agent can reach for.

### Page width and responsive layout

Every sample page's outer content wrapper is full width — no `maxWidth` cap. It fills whatever width `AppShell`/`Shell` gives the content area, the same way `ListReport.tsx`/`SalesOrderList.tsx`/`Customers.tsx`'s table pages always have. A page never caps its own overall width to force a narrower reading measure; where a narrower measure genuinely helps (a search input, a block of prose), cap that one element, not the page.

A page with more than one content column (a main pane plus a side panel, or several panes side by side, e.g. `BuilderForms.tsx`) uses a plain flex row — `display: 'flex', flexWrap: 'wrap', gap: <16-24>, alignItems: 'flex-start'` — with **flexible, not fixed**, column widths:

- The primary/main pane gets more flex-grow than a secondary panel (`flex: '2 1 480px'` main vs. `flex: '1 1 280px'` side is the usual ratio; a 3-pane layout like `BuilderForms.tsx` gives the center pane the largest share, e.g. `'3 1 360px'` against `'1 1 220px'` on each side).
- Every column also sets a `minWidth` floor (so it never collapses illegibly small) and, for narrower side panels, a `maxWidth` ceiling (so it doesn't stretch absurdly wide on an ultra-wide monitor — a 280px-basis panel with `maxWidth: 400` stays a sensible width even as the row's remaining space grows).

This reflows automatically, with no `@media` query: once a row's columns can't fit their flex-basis widths side by side, the browser wraps them onto their own full-width rows — which is exactly what a narrow/mobile viewport needs (each panel becomes a full-width stacked block). Verify a new or changed page at both a wide desktop width and a narrow (~375-400px) mobile width: no column should force horizontal scrolling, and every column should read sensibly at its full-row width once wrapped.

### Full-height workspace pages (the exception)

Every page above scrolls with the rest of the document — the normal case. A page whose job is holding an unbounded list alongside a conversation/composer the user wants anchored (a mail-client-style inbox, not a form) can instead become a full-height "workspace" view that stops scrolling itself: it fills `AppShell`'s content slot exactly and gives its own list/detail regions `overflow-y: auto` instead. `examples/Inbox.tsx` is the one example of this today (scoped there deliberately, gated behind a `matchMedia('(min-width: 900px)')` check — below that width it falls back to the normal stacked/page-scrolling layout unchanged, since a fixed-height dual-pane layout doesn't fit a mobile viewport). Two things a page opting into this needs, both already true in `Shell.tsx`:

- Size against `height: 'calc(100vh - 192px)'` (96px top + 96px bottom, matching `Shell`'s fixed header/dock reservations), not `height: '100%'` — `Shell`'s own root uses `min-height: 100vh` (deliberately, so every normal page can grow taller than the viewport), which never gives the ancestor chain a *definite* height for a percentage to resolve against; anchoring to the viewport directly sidesteps that ambiguity. Confirmed live while building Inbox's version: `height: '100%'` silently rendered at whatever height the content demanded, `overflow: hidden` and all, never actually capping at the viewport.
- `overflow: hidden` on the page's own root, then `overflow-y: auto` + `min-height: 0` on each internally-scrolling region (the classic nested-flexbox requirement — a flex item's default `min-height: auto` refuses to shrink below its content's size unless overridden).

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
