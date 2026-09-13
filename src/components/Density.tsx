import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { compactDensity, spaciousDensity } from '../tokens.stylex.js';

export type DensityTier = 'compact' | 'comfortable' | 'spacious';

export type DensityProps = {
  value: DensityTier;
  children: ReactNode;
};

/**
 * Applies a density tier (ROADMAP item 10) to its subtree. Components read the `density`
 * alias group (`controlHeight`, `rowHeight`, `cellPaddingX`, `cellPaddingY`, `fieldGap`,
 * `fontSize` — see `tokens.stylex.ts`) ambiently; wrapping them in `<Density value="compact">`
 * (or `"spacious"`) swaps every one of those values at once via a `stylex.createTheme` theme,
 * which works by overriding the underlying CSS custom properties on a real DOM element — so
 * this renders a wrapping `<div>` (a `Fragment` can't carry a className/the theme's custom
 * properties). `value="comfortable"` applies no theme at all: it *is* the `density` var
 * group's own default, so nothing needs overriding for it.
 *
 * Because the override is a real CSS custom property on an ancestor element, tiers nest via
 * ordinary cascading: a `Density`-wrapped region inside another `Density`-wrapped region always
 * reads its own (nearer) tier, not the outer one. The one case that does *not* "reset" is
 * nesting a `value="comfortable"` region inside an active compact/spacious ancestor — since
 * comfortable applies no override, it inherits whatever the ancestor set, the same as any
 * other undeclared CSS custom property. That's an accepted consequence of comfortable being
 * the var group's own default rather than a theme (see `test/browser/density.spec.ts`, which
 * nests two *themed* tiers — spacious around compact — to prove inner-wins nesting, rather
 * than a comfortable-in-compact case that provably can't reset).
 */
export function Density({ value, children }: DensityProps) {
  return (
    <div {...stylex.props(value === 'compact' && compactDensity, value === 'spacious' && spaciousDensity)}>
      {children}
    </div>
  );
}
