import * as stylex from '@stylexjs/stylex';

/**
 * Busy Office ERP foundation tokens — one neutral (cool slate) scale + one
 * accent, per the Claude Design handoff (templates/erp-foundation in the
 * synced project). Keep new tokens additive — components should never reach
 * for raw values.
 */
export const color = stylex.defineVars({
  bgCanvas: '#f8fafc',
  bgSurface: '#ffffff',
  bgSubtle: '#f1f5f9',
  border: '#e2e8f0',
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
});

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
  // `rem`, added for ROADMAP item 10 (density tiers): the literal per-instance override values
  // `size="compact"`/`density="compact"` force on controls (sizeControl), and a general
  // "compact ambient" UI text size for anything reading that isn't a control (sizeUi). Unlike
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
 * subtree, or a component's own literal per-instance override (`size="compact"` etc.).
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
