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
