---
category: forms
tests:
  - test/browser/dropdown-focus.spec.ts
  - test/browser/design-fidelity-fixes.spec.ts
  - test/browser/filter-hierarchy.spec.ts
  - test/browser/compact-controls.spec.ts
  - test/browser/control-center.spec.ts
  - test/state-channels.test.ts
---

Trigger + popover menu for picking one value from a list (a filter-style select). `label` is the trigger text, `items` is an array of `{ label, selected? }`, `onSelect` fires when an item is chosen. The trigger's height and font size come from the ambient density tier (see `Density`) — the same `controlHeight`/`fontSize` aliases `Button` and filter `Chip` read, since all three are the one "always a capsule" shape family (docs/design-conventions.md): 36px/14px comfortable (the page default), 28px/13px inside a compact `Density` region, 44px/15px inside spacious. Dropdown has no size prop of its own to override that — wrap it in `Density` to change it. Option rows read the same density font size, not the fixed body-copy size. Not for multi-select — an item's `selected` is display-only and choosing one always closes the menu; compose filter `Chip`s for a multi-select filter row.

**`active` vs. `selected` (ROADMAP item 11).** These answer two different questions and are easy to conflate. `items[].selected` is about the MENU: which item shows the checkmark when the menu is opened, including a default item (an "All suppliers"/"Any time" placeholder) a caller marks `selected` purely so the menu renders with something checked. `active` is about the TRIGGER: whether this filter is currently narrowing anything, and it — not the `selected` computation — drives whether the trigger fills dark (the `triggerActive` treatment). A caller whose default item is always marked `selected` (the common case — the trigger label needs to show the current value, default included) must compute and pass `active` itself, typically `currentValue !== defaultValue`; otherwise every such Dropdown renders permanently filled, since `items.some(item => item.selected)` is always true. When `active` is omitted, Dropdown falls back to that old `items.some(item => item.selected)` computation, so a caller that never had this distinction (no default-selected item) keeps working unchanged. See `examples/ListReport.tsx`'s four Purchase-orders filters for the pattern.

The trigger itself now carries real rest/hover/pressed/open states — rest is an unfilled outline pill (`color.borderStrong` border, transparent background), `:hover` tints the background `color.bgSubtle`, `:active` (mouse-down) steps to `color.border`, and `aria-expanded="true"` (the menu open) steps further to a `color.borderStrong` background with a `color.action` border — all distinct from, and lighter than, the dark `triggerActive` fill `active` triggers.

Full keyboard support: the trigger exposes `aria-haspopup="listbox"`/`aria-expanded`; ArrowDown/ArrowUp/Enter/Space on the trigger opens the menu; inside it, ArrowUp/ArrowDown move the highlight (wrapping at the ends), Home/End jump to the first/last item, Enter/Space selects the highlighted item, and Escape closes without selecting — both return focus to the trigger. Clicking outside the menu closes it without selecting. The menu is `role="listbox"` (labelled by `label`) with `role="option"`/`aria-selected` items and `aria-activedescendant` tracking the highlight. The keyboard-highlighted option carries a `color.bgSubtle` fill plus an inset `focusRing`-colored outline (not a bare color tint) so it stays visible against the menu's glass background. Opening the menu via the keyboard moves DOM focus onto the listbox itself, so it — not the trigger — is what shows a `:focus-visible` ring while the menu is open; opening it with a mouse click does not show that ring, matching how `:focus-visible` behaves everywhere else in this system.

Known gap, disclosed rather than silently dropped (M10, issue #24): the menu popover reads the `glass.*` token group (`tokens.stylex.ts`), which has no dark-mode variant — see `docs/Theme.md`'s own disclosure. The menu stays a frozen light-glass panel regardless of theme; the trigger itself (all `color.*` tokens) re-tints correctly.

```jsx
<Dropdown
  label="Status · Awaiting"
  items={[{ label: 'All' }, { label: 'Awaiting approval', selected: true }]}
  onSelect={(label) => console.log(label)}
  active
/>
```
