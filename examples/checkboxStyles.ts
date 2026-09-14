import * as stylex from '@stylexjs/stylex';
import { color } from '../src/tokens.stylex.js';

// ROADMAP item 12 (2026-09-14 design review, confirmed LOW finding): row-selection checkboxes
// were bare native `<input type="checkbox">` — unstyled, browser-default appearance (13x13px,
// square corners, UA accent color). The reference (`templates/erp-skeleton/Table.dc.html`) draws
// them at 16x16, radius 4, `border #cbd5e1`. Extracted here (ROADMAP M6, issue #17) once a second
// consumer (`examples/Settings.tsx`'s Modules toggle rows) needed the exact same treatment —
// this repo's Objective 2 "Proven Reuse" test wants two named consumers before a shared thing
// earns its keep; internal to `examples/`, not a new package `Checkbox` export, since neither
// consumer needs anything beyond this file's own native-checkbox styling (see docs/design-
// conventions.md — a real package export is a bigger, one-way decision this doesn't warrant).
// `:focus-visible` is a CSS pseudo-class a plain React `style` object can't express, so — same
// precedent as examples/AppShell.tsx's notification button — a small scoped `stylex.create`
// block handles it; the outline treatment matches the shared focus ring every other focusable
// control in this repo uses (Button/Input/Dropdown/Chip/AppShell's notification button): 2px
// `color.focusRing` outline, 2px offset, `:focus-visible` only.
export const checkboxStyles = stylex.create({
  checkbox: {
    width: '16px',
    height: '16px',
    // A browser's native checkbox widget (appearance: auto, the default) honors width/height but
    // silently ignores border-radius/border-color/background-color — verified directly: without
    // `appearance: 'none'` this rendered a real 16x16 box (that assertion passed) but a flat 0px
    // border-radius (that assertion failed) regardless of the declared 4px. `appearance: none`
    // fixes that, at the cost of also discarding the native checked-state tick — replaced below
    // with a solid-fill `:checked` treatment (same visual language as filter `Chip`'s
    // selected-fills-solid pattern elsewhere in this design system), not a redrawn glyph; the
    // element is still a real `<input type="checkbox">`, so `:checked`/keyboard/form semantics
    // and screen-reader announcement are unaffected — only the paint changes.
    appearance: 'none',
    margin: 0,
    cursor: 'pointer',
    // Off this package's 4px+ radius scale on the low end (`radius.sm` is 6px, no 4px token) —
    // a literal matching the reference exactly, same category as other hand-measured literals
    // already in this codebase (e.g. the badge's `1px 6px` padding from ROADMAP item 13).
    borderRadius: '4px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: {
      default: color.borderStrong,
      ':checked': color.action,
    },
    backgroundColor: {
      default: color.bgSurface,
      ':checked': color.action,
    },
    outlineStyle: 'solid',
    outlineOffset: '2px',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.focusRing,
    },
    outlineWidth: {
      default: 0,
      ':focus-visible': '2px',
    },
  },
});
