import * as stylex from '@stylexjs/stylex';

/**
 * Busy Office ERP foundation tokens — one neutral (cool slate) scale + one
 * accent, per the Claude Design handoff (templates/erp-foundation in the
 * synced project). Keep new tokens additive — components should never reach
 * for raw values.
 */

// Light values — unchanged from before item 19 (issue #19, `agreed`, project owner, 2026-09-16).
// Kept as its own object, rather than inlined straight into `color` below, for two reasons: it's
// the single source `lightColor` (the explicit force-light theme, further down) themes from, and
// it's what `test/color-contrast.test.ts` imports to check real WCAG ratios against `darkPalette`
// — a change to either palette without a passing numeric check fails a running assertion, not
// just a comment.
export const lightPalette = {
  bgCanvas: '#f8fafc',
  bgSurface: '#ffffff',
  bgSubtle: '#f1f5f9',
  border: '#e2e8f0',
  // Same literal as `bgSubtle` above — deliberately, not a copy/paste accident. ROADMAP item 12
  // (2026-09-14 design review): `Table`'s frame border (`border`, #e2e8f0) and its body row
  // separators need to read as visually distinct, so row separators get their own semantic name
  // at the lighter value the reference actually uses (`Table.dc.html`: frame #e2e8f0, row
  // separator #f1f5f9) — which happens to be the same hex this scale already uses for subtle
  // surface fills. Naming it for its *use* (a subtle border) rather than reusing `bgSubtle` keeps
  // a future change to either one (e.g. a surface-fill vs. a hairline needing to diverge) from
  // silently dragging the other along.
  borderSubtle: '#f1f5f9',
  borderStrong: '#cbd5e1',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#64748b',
  textDisabled: '#94a3b8',
  textOnInk: '#ffffff',
  action: '#0f172a',
  actionHover: '#1e293b',
  actionActive: '#020617',
  accent: '#0057b8',
  accentHover: '#1f6fcf',
  focusRing: '#0057b8',
  danger: '#b42318',
  // Added for M10's color-scale work (owner-directed, 2026-09-18, issue #24): real, evidenced gap
  // — 8+ real `examples/*.tsx` screens use `Chip`'s `tone="accent"` for status text that isn't
  // actually accent-colored in meaning (e.g. AdminOverview.tsx's "All systems operational" reads
  // as success, RecordDetail.tsx's "Awaiting approval" reads as a pending/caution state), because
  // `accent` was the only non-neutral, non-danger tone available. Sourced from
  // `src/palette.generated.ts` (the new 24-range OKLCH palette, `scripts/generate-palette.mjs`):
  // `emerald.600`, chosen over `green.600` for a more vivid/conventional "success" read; verified
  // 5.38:1 as flat text against `bgSurface` (matches `danger`'s own flat-text usage pattern) —
  // `test/color-contrast.test.ts` checks the real number, not assumed.
  success: '#3d7821',
  // `amber.600` (over `gold.600` — amber's more orange character reads as caution more
  // conventionally than gold's more yellow one). 5.93:1 as flat text against `bgSurface`.
  warning: '#a34a0e',
  // Added for the token-standardization sweep (owner-directed, 2026-09-17, issue #21): a single
  // selected-row background wash, the pale-blue tint every list-plus-detail-in-one-route screen
  // uses for `row.id === selectedId ? '<this>' : undefined` (Billing, Companies, Delivery,
  // Integrations, Planning, ProductionOrders, Quotations, Requisitions, Roles, Users — 10 real
  // consumers, all the identical literal, confirmed by grep before adding this). Tailwind blue-50,
  // matching every existing hand-written instance exactly — zero visual change in light mode for
  // any file this migrates.
  bgSelected: '#eff6ff',
};

// Dark values (ROADMAP item 19 / issue #19, `agreed`, project owner, 2026-09-16). Built from the
// same cool-slate Tailwind ramp `lightPalette` already draws from (`#f8fafc` is exactly slate-50;
// the whole light scale reads as slate-50…950 already) — walked from the other end:
// `bgCanvas`/`bgSurface`/`bgSubtle` take slate-950/900/800 (darkest first, surfaces one step
// LIGHTER than canvas — the standard dark-UI elevation direction, the mirror of light mode's
// surfaces being lighter only because the canvas itself already sits near white); text takes
// slate-50/300/400/500 (lightest first); `border`/`borderStrong` take slate-700/600 (a border
// that needs to read as more visible than a subtle one has to sit further from a DARK ground, so
// it moves toward lighter slate steps, the mirror of light mode moving toward darker ones).
//
// `action`/`textOnInk` flip roles, not just values. Light mode's `action` is the *darkest*
// neutral ("ink"), filled with white `textOnInk` text; on a canvas that's already near-black, a
// near-black button would vanish into it. So dark mode's `action` becomes the *lightest* neutral
// instead (slate-100, hover slate-50, active slate-300 — the same "hover lightens further, active
// darkens past the base" shape `action`/`actionHover`/`actionActive` already have in
// `lightPalette`, just walked from the opposite end of the scale), and `textOnInk` flips to a
// near-black slate-900 to read on it.
//
// That flip also solves `accent`/`danger`'s harder problem for free. Both tokens do two jobs at
// once: flat TEXT color (`Card`'s selected checkmark, `Dropdown`'s selected-item color,
// `Button`'s danger label, `Chip`'s danger outline, `Input`'s error message) AND a FILL color
// with `textOnInk` on top (`Chip`'s accent tone, `Shell`'s active tab/dock badge, `Button`
// danger's `:active` fill). A color light enough to read as flat text on a near-black canvas
// needs relative luminance ≳0.22 by the WCAG formula — but by that same formula, anything that
// light is already too light for *white* text on top of it to clear 4.5:1 (which needs luminance
// ≲0.18): the two requirements' windows don't overlap, so no single shade could have served both
// roles with `textOnInk` staying white. Once `textOnInk` is near-black instead, contrast against
// it becomes (mathematically) nearly the same formula as contrast against the near-black
// `bgSurface`/`bgCanvas` — so any `accent`/`danger` shade that clears 4.5:1 as flat text against
// the canvas clears essentially the same ratio again as a fill with `textOnInk` on top. Verified
// numerically in `test/color-contrast.test.ts`, not assumed: `#3b82f6` (Tailwind blue-500)
// measures ~4.85:1 both ways against `bgSurface`/`textOnInk`, `#ef4444` (Tailwind red-500) ~4.74:1
// both ways — both real AA passes, not eyeballed. `focusRing` follows `accent` the same way it
// does in `lightPalette`.
export const darkPalette = {
  bgCanvas: '#020617',
  bgSurface: '#0f172a',
  bgSubtle: '#1e293b',
  border: '#334155',
  borderSubtle: '#1e293b', // same literal as bgSubtle, mirroring lightPalette's own convention above
  borderStrong: '#475569',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  textDisabled: '#64748b',
  textOnInk: '#0f172a',
  action: '#f1f5f9',
  actionHover: '#f8fafc',
  actionActive: '#cbd5e1',
  accent: '#3b82f6',
  accentHover: '#60a5fa',
  focusRing: '#3b82f6',
  danger: '#ef4444',
  // `emerald.400`/`amber.400` — same reasoning as `lightPalette.success`/`warning` above, a
  // lighter step for legibility against a dark ground (mirroring `danger`'s own light-step-in-
  // light-mode/darker... lighter-step-in-dark-mode pattern). 7.32:1 / 6.81:1 as flat text against
  // `bgSurface`.
  success: '#81b36e',
  warning: '#db8d65',
  // Tailwind blue-950 — a dark, blue-HUED wash (not a lightness step: its luminance nearly
  // matches `bgSubtle`'s own slate-800, ~1.0:1 against it) so a selected row reads as distinctly
  // TINTED against the `bgSurface` a Table row actually sits on, rather than just another neutral
  // surface. AA-verified in test/color-contrast.test.ts: textPrimary/textSecondary on this clear
  // 14.0:1 / 9.9:1, both comfortably over the 4.5:1 body-text floor every other bg/text pair here
  // clears.
  bgSelected: '#172554',
};

// Each var gets `lightPalette`'s value as its `default` and `darkPalette`'s value under
// `@media (prefers-color-scheme: dark)` — the exact same per-value media-query shape `motion`'s
// durations already use for `prefers-reduced-motion` (below). This is the "no host action
// needed" half of item 19: every component already reads `color.*` as a StyleX var (never a raw
// hex — that's the whole point of this token layer), so this one change gives every real
// component real dark-mode support with zero component-file edits (confirmed by grep — see the
// item 19 commit message for the one place that assumption doesn't reach: `examples/`'s own
// plain inline `style={{ background: '#f8fafc' }}`-style literals, which were never StyleX and
// were already out of this issue's scope).
export const color = stylex.defineVars({
  bgCanvas: { default: lightPalette.bgCanvas, '@media (prefers-color-scheme: dark)': darkPalette.bgCanvas },
  bgSurface: { default: lightPalette.bgSurface, '@media (prefers-color-scheme: dark)': darkPalette.bgSurface },
  bgSubtle: { default: lightPalette.bgSubtle, '@media (prefers-color-scheme: dark)': darkPalette.bgSubtle },
  border: { default: lightPalette.border, '@media (prefers-color-scheme: dark)': darkPalette.border },
  borderSubtle: { default: lightPalette.borderSubtle, '@media (prefers-color-scheme: dark)': darkPalette.borderSubtle },
  borderStrong: { default: lightPalette.borderStrong, '@media (prefers-color-scheme: dark)': darkPalette.borderStrong },
  textPrimary: { default: lightPalette.textPrimary, '@media (prefers-color-scheme: dark)': darkPalette.textPrimary },
  textSecondary: { default: lightPalette.textSecondary, '@media (prefers-color-scheme: dark)': darkPalette.textSecondary },
  textTertiary: { default: lightPalette.textTertiary, '@media (prefers-color-scheme: dark)': darkPalette.textTertiary },
  textDisabled: { default: lightPalette.textDisabled, '@media (prefers-color-scheme: dark)': darkPalette.textDisabled },
  textOnInk: { default: lightPalette.textOnInk, '@media (prefers-color-scheme: dark)': darkPalette.textOnInk },
  action: { default: lightPalette.action, '@media (prefers-color-scheme: dark)': darkPalette.action },
  actionHover: { default: lightPalette.actionHover, '@media (prefers-color-scheme: dark)': darkPalette.actionHover },
  actionActive: { default: lightPalette.actionActive, '@media (prefers-color-scheme: dark)': darkPalette.actionActive },
  accent: { default: lightPalette.accent, '@media (prefers-color-scheme: dark)': darkPalette.accent },
  accentHover: { default: lightPalette.accentHover, '@media (prefers-color-scheme: dark)': darkPalette.accentHover },
  focusRing: { default: lightPalette.focusRing, '@media (prefers-color-scheme: dark)': darkPalette.focusRing },
  danger: { default: lightPalette.danger, '@media (prefers-color-scheme: dark)': darkPalette.danger },
  success: { default: lightPalette.success, '@media (prefers-color-scheme: dark)': darkPalette.success },
  warning: { default: lightPalette.warning, '@media (prefers-color-scheme: dark)': darkPalette.warning },
  bgSelected: { default: lightPalette.bgSelected, '@media (prefers-color-scheme: dark)': darkPalette.bgSelected },
});

// Explicit host opt-in (ROADMAP item 19) — mirrors `compactDensity`/`comfortableDensity`/
// `spaciousDensity`'s own `createTheme` shape exactly (see the `density` group and `Density`
// below/`src/components/Density.tsx`). `Theme` (`src/components/Theme.tsx`) is the wrapper that
// applies one of these to force a mode regardless of `prefers-color-scheme`. `lightColor` uses
// the same values `color`'s own `default` branch already has — not a no-op, the same reasoning
// `comfortableDensity` documents: without a real `createTheme` object here, forcing "light" would
// do nothing under an OS set to dark (the bare default's own media query would still switch it),
// so a real theme is what lets a host force light *regardless* of system preference. There is no
// third "system" value — see `Theme`'s own doc comment for why omitting the wrapper entirely is
// that case instead.
export const lightColor = stylex.createTheme(color, lightPalette);
export const darkColor = stylex.createTheme(color, darkPalette);

export const space = stylex.defineVars({
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space5: '20px',
  space6: '24px',
  space8: '32px',
  space10: '40px',
  space12: '48px',
  space16: '64px',
});

export const radius = stylex.defineVars({
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  pill: '999px',
});

export const font = stylex.defineVars({
  family: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  sizeDisplay: '40px',
  sizeHeading: '24px',
  sizeTitle: '17px',
  sizeBody: '15px',
  sizeCaption: '12.5px',
  sizeOverline: '11px',
  // `rem`, added for ROADMAP item 10 (density tiers): sizeControl backs the compact tier's own
  // control text size (originally also Button/Table's `size`/`density="compact"` per-instance
  // overrides, before ROADMAP item 16 removed them in favor of `Density` regions — it still
  // backs Input's fixed `size="search"` style directly, which was never a density override),
  // and sizeUi is a general "compact ambient" UI text size for anything reading that isn't a
  // control. Unlike
  // every other `font` entry above, these two intentionally scale with the root font size — see
  // `density` below, whose own `fontSize` alias's comfortable default equals `sizeUi`.
  // `sizeCaption` (12.5px, px, unchanged) stays metadata-only from here on — captions/labels,
  // never a component's own control text — components that used to reuse it for that purpose
  // now read `sizeControl`/`density.fontSize` instead (see Button/Input/Dropdown/Chip/Table).
  sizeControl: '0.8125rem', // 13px @ 16px root
  sizeUi: '0.875rem', // 14px @ 16px root
  weightRegular: '400',
  weightMedium: '500',
  weightSemibold: '600',
  lineHeightDisplay: '1.15',
  lineHeightHeading: '1.25',
  lineHeightTitle: '1.4',
  lineHeightBody: '1.6',
  lineHeightCaption: '1.5',
  letterSpacingDisplay: '-0.02em',
  letterSpacingHeading: '-0.01em',
  letterSpacingOverline: '0.06em',
});

/**
 * Density tier aliases (ROADMAP item 10) — the one shared sizing vocabulary components read
 * for their own internal sizing instead of hard-coding px. Two families of height:
 * `controlHeight` for pill-shaped interactive controls (`Button`, `Dropdown`'s trigger, filter
 * `Chip` — the three components docs/design-conventions.md already groups as "always a capsule")
 * and `rowHeight` for content-bearing "row" elements (`Input`'s field, `Table`'s rows) — kept as
 * a separate, slightly taller alias because a text field/row has always read a few px taller
 * than a button in this system (old scale: Input 44 vs Button 40; new scale preserves that same
 * 4px relationship: Input 40 vs Button 36).
 *
 * Values are `rem`, not `px` (ROADMAP: "density and type tokens move to rem"), so control/row
 * sizing scales with the root font size instead of clipping content at a fixed pixel box —
 * paired with consumers using `min-height` rather than `height` (see Button/Input/Dropdown/
 * Chip/Table), so a box only ever grows to fit, never clips.
 *
 * `cellPaddingX`/`cellPaddingY`/`fieldGap` were not independently measured against the ERP
 * reference (only controlHeight/rowHeight/fontSize were, per the 2026-09-14 design review) —
 * chosen from the existing `space` scale to read proportionally tighter/looser per tier:
 * compact space2/space1/space2, comfortable space4/space2/space4, spacious space6/space3/space6
 * (block padding always half the inline padding/gap; comfortable roughly doubles compact,
 * spacious is 1.5x comfortable). `space` itself stays `px` and unchanged — only the three
 * height/font aliases above were given exact reference-matched values.
 *
 * This group's own defaults (below) are the comfortable tier. `compactDensity`/
 * `spaciousDensity` (via `stylex.createTheme`) override every value for a `Density`-wrapped
 * subtree — the only way to get a non-comfortable tier as of ROADMAP item 16, which removed
 * Button/Table's own per-instance overrides. `Input`'s `size="search"` is not one of these: a
 * fixed style, not a density override, that never reads any `density` alias.
 */
export const density = stylex.defineVars({
  controlHeight: '2.25rem', // 36px @ 16px root
  rowHeight: '2.5rem', // 40px @ 16px root
  cellPaddingX: space.space4,
  cellPaddingY: space.space2,
  fieldGap: space.space4,
  fontSize: font.sizeUi,
});

// Same values as `density`'s own defaults above — needed anyway, not redundant: a `Density`-
// wrapped region can only override an ambient non-default (compact/spacious) ancestor by applying
// a real `createTheme` object of its own. Without this, `<Density value="comfortable">` nested
// inside an active compact/spacious ancestor could not reset back to comfortable — it would just
// inherit the ancestor's CSS custom properties unchanged, since there'd be nothing to override
// them with. Keep every value here identical to `density`'s defaults; a drift between the two
// would be a real bug (the two definitions of "comfortable" disagreeing).
export const comfortableDensity = stylex.createTheme(density, {
  controlHeight: '2.25rem', // 36px @ 16px root
  rowHeight: '2.5rem', // 40px @ 16px root
  cellPaddingX: space.space4,
  cellPaddingY: space.space2,
  fieldGap: space.space4,
  fontSize: font.sizeUi,
});

export const compactDensity = stylex.createTheme(density, {
  controlHeight: '1.75rem', // 28px @ 16px root
  rowHeight: '2rem', // 32px @ 16px root
  cellPaddingX: space.space2,
  cellPaddingY: space.space1,
  fieldGap: space.space2,
  fontSize: font.sizeControl,
});

export const spaciousDensity = stylex.createTheme(density, {
  controlHeight: '2.75rem', // 44px @ 16px root
  rowHeight: '3rem', // 48px @ 16px root
  cellPaddingX: space.space6,
  cellPaddingY: space.space3,
  fieldGap: space.space6,
  fontSize: '0.9375rem', // 15px @ 16px root — spacious has no separate named font token
});

export const shadow = stylex.defineVars({
  xs: '0 1px 2px rgba(15,23,42,.06)',
  sm: '0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)',
  md: '0 6px 16px -4px rgba(15,23,42,.12), 0 2px 4px rgba(15,23,42,.05)',
  lg: '0 16px 40px -8px rgba(15,23,42,.18), 0 4px 10px rgba(15,23,42,.06)',
});

/** Secondary surfaces only (command bar, dock, dropdowns, modals) — never tables, forms, or record bodies. */
export const glass = stylex.defineVars({
  bg: 'rgba(255,255,255,.72)',
  bgStrong: 'rgba(255,255,255,.86)',
  blur: '12px',
  blurStrong: '16px',
  border: '1px solid rgba(15,23,42,.08)',
  highlight: 'inset 0 1px 0 rgba(255,255,255,.6)',
});

/** Durations collapse to 0 under prefers-reduced-motion; components should never hardcode a transition duration. */
export const motion = stylex.defineVars({
  durationFast: { default: '120ms', '@media (prefers-reduced-motion: reduce)': '0ms' },
  durationBase: { default: '200ms', '@media (prefers-reduced-motion: reduce)': '0ms' },
  durationSlow: { default: '320ms', '@media (prefers-reduced-motion: reduce)': '0ms' },
  easeStandard: 'cubic-bezier(.2,.8,.2,1)',
  easeEmphasized: 'cubic-bezier(.32,.72,0,1)',
});
