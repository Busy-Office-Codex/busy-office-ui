# UI design conventions

## Start here

An entry map, not a summary — each row points to the one doc that already has
the answer instead of restating it here.

| Task | Read |
| --- | --- |
| Build a new page/composition from scratch | This file: "Example composition", "Page width and responsive layout", "Theme-safe page chrome" |
| Need a specific component's props/behavior | `docs/<Component>.md` for each of: Button, ButtonGroup, Card, Chart, Chip, Density, Dropdown, Icon, Input, ListReport, Modal, RecordDetail, Shell, Table, Text, Theme |
| Make a page/region theme-safe (dark mode) | This file's "Theme-safe page chrome" section, below |
| Set density (compact/comfortable/spacious) on a region | `docs/Density.md` |
| Work with Shell/routing/navigation/breadcrumbs | `docs/Shell.md` |
| Verify a change | `pnpm typecheck && pnpm lint && pnpm test`; add `pnpm test:browser` for anything visual/interactive |

## Setup

Use the React exports from `@busyoffice/design-system` and import
`@busyoffice/design-system/styles.css`. No provider is required. Buildable
examples live in `examples/`; the standalone preview renders those React sources.
Canvas/global-bundle exports are a separate design-tool integration, not the
runtime package setup. Real component prop types remain authoritative.

## Styling idiom: props only, no exposed classes or tokens

This design system is built with StyleX (compile-time atomic CSS). The compiled `styles.css` contains only hashed, opaque custom-property names — **never write CSS or hand-author classes against these names**; they are internal implementation detail, not a public vocabulary, and are not guaranteed stable across builds (they are re-hashed on every rebuild). There is no utility-class family, and this is not a promise to external hosts of a stable, versioned token API to build against.

Within this repository, `examples/*.tsx` — first-party page compositions built from source, not an external consumer of the compiled package — already import `color`/`space`/`radius`/`font`/`shadow`/`glass` directly from `../src/tokens.stylex.js` for page-level chrome no component prop covers (a page's own background, a custom border, a one-off gap): every `examples/*.tsx` file that has any color or scale-matching spacing to tokenize does this today (`test/shell-token-audit.test.ts`'s ratchet, widened to the full 45-file surface by the token-standardization sweep, 2026-09-17, enforces it — a raw hex duplicating a token can't land in `examples/` again without failing a running test). This is the approved way to keep a page theme-safe (issue #19) — see "Theme-safe page chrome" below — corrected here after this same statement's own "no design-token API" claim above was found to already be false in practice.

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

For layout structure and grids outside these components (a page's own flex/grid wrapper), use plain inline styles — this design system does not ship layout primitives (no `Stack`/`Grid`/`Box`). For the actual gap/padding *values* inside that structure, reach for the `space` scale (`space.space1`…`space.space16`, `4px`→`64px`) from `../src/tokens.stylex.js` rather than a raw number — see "Theme-safe page chrome" below.

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

### Theme-safe page chrome (the minimal recipe)

A page's own chrome — its outer background, a custom border, the gaps in its own layout `<div>`s — sits outside every component's props, so it's easy to hardcode a color/spacing literal that looks right once and then silently drifts from dark mode (`Theme`, issue #19) or from every other page's spacing scale. Fixed for `ListReport.tsx`/`RecordDetail.tsx` (owner-directed, 2026-09-16); apply the same 3 steps to any other page:

1. **Import the tokens your page's own `<div>`s need** — `import { color, radius, space } from '../src/tokens.stylex.js';` (add only what you use; `font`/`shadow`/`glass` exist too).
2. **Replace every raw hex color** in a page-level `style={{...}}` with the matching `color.*` token — `background: '#f8fafc'` → `background: color.bgCanvas`; `border: '1px solid #e2e8f0'` → `` border: `1px solid ${color.border}` ``. Grep your page for `#[0-9a-fA-F]{3,6}` before and after — zero matches when done (font-family strings are the one expected exception; they don't vary by theme).
3. **Replace every raw spacing number that already matches the `space` scale** (`space1`=4 · `space2`=8 · `space3`=12 · `space4`=16 · `space5`=20 · `space6`=24 · `space8`=32 · `space10`=40 · `space12`=48 · `space16`=64) with `space.spaceN` — `gap: 16` → `gap: space.space4`. A number with no matching token (a deliberate fixed width like a 280px search box, or a genuinely bespoke value) stays a plain literal; don't force-fit the nearest token onto something that was never meant to track the scale.

Verify: `pnpm typecheck && pnpm lint && pnpm test` (fast, catches import/type errors), then `pnpm test:browser` with a real dark-mode assertion on the specific element you changed — `test.use({ colorScheme: 'dark' })`, then `toHaveCSS('background-color', 'rgb(...)')` against the exact `darkPalette` value from `src/tokens.stylex.ts` (see `test/browser/theme-contrast.spec.ts`) — not just that the page still renders. `radius`/`font` values are theme-independent (they don't change between light and dark), so leaving a bespoke radius/font literal alone is not a theme-safety gap; only colors and spacing are in scope here.

Closed (token-standardization sweep, owner-directed, 2026-09-17, issue #21): every `examples/*.tsx` file now passes this recipe, enforced by `test/shell-token-audit.test.ts`'s ratchet covering all 45 files plus `src/shell/Shell.tsx` — a raw hex duplicating a `color.*` token can't land in `examples/` again without failing a running test. The one real token-scale gap this recipe's earlier pass found (`#eff6ff`, the selected-row tint 10 real screens shared with no matching token) is now `color.bgSelected` (light `#eff6ff`, dark Tailwind blue-950 `#172554`, both AA-verified in `test/color-contrast.test.ts`) — added because the reuse was already proven (10 named consumers, identical literal), not invented speculatively. A small number of genuinely off-palette literals remain by design, each with an explanatory comment at its own call site rather than a force-fit token: `Launcher.tsx`'s favorited-star amber and `entryScreenLayout.tsx`'s local `warn` amber (two different shades, two different one-off purposes — not a proven shared concept), and any `radius`/`font` literal (theme-independent, out of this recipe's scope per the Verify step above).

## Where the truth lives

- `src/components/`: authoritative React prop types and implementation.
- `src/tokens.stylex.ts`: authoritative token values — a private, unversioned surface for an *external* host (no compatibility promise, don't build a published integration against it), but the real source `examples/*.tsx` compositions in this repo import directly (see "Theme-safe page chrome" above).
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
