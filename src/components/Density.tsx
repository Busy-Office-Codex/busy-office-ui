import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { comfortableDensity, compactDensity, spaciousDensity } from '../tokens.stylex.js';

export type DensityTier = 'compact' | 'comfortable' | 'spacious';

const THEMES = {
  compact: compactDensity,
  comfortable: comfortableDensity,
  spacious: spaciousDensity,
};

export type DensityProps = {
  value: DensityTier;
  children: ReactNode;
};

/**
 * Applies a density tier (ROADMAP item 10) to its subtree. Components read the `density`
 * alias group (`controlHeight`, `rowHeight`, `cellPaddingX`, `cellPaddingY`, `fieldGap`,
 * `fontSize` — see `tokens.stylex.ts`) ambiently; wrapping them in `<Density value="...">`
 * swaps every one of those values at once via a `stylex.createTheme` theme, which works by
 * overriding the underlying CSS custom properties on a real DOM element — so this renders a
 * wrapping `<div>` (a `Fragment` can't carry a className/the theme's custom properties).
 * `value="comfortable"` applies `comfortableDensity`, a theme with the same values as the
 * `density` group's own defaults — not a no-op — specifically so it can reset an ambient
 * compact/spacious ancestor back to comfortable; without a real theme object there, comfortable
 * would just inherit whatever the ancestor set, since there'd be nothing to override it with.
 *
 * Because every tier is a real CSS custom property override on an ancestor element, tiers nest
 * via ordinary cascading: a `Density`-wrapped region inside another `Density`-wrapped region
 * always reads its own (nearer) tier, regardless of which tier the outer one set or which tier
 * this one requests — including resetting back to comfortable (see `test/browser/density.spec.ts`).
 */
export function Density({ value, children }: DensityProps) {
  return <div {...stylex.props(THEMES[value])}>{children}</div>;
}
