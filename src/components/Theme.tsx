import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { darkColor, lightColor } from '../tokens.stylex.js';

export type ThemeMode = 'light' | 'dark';

const THEMES = {
  light: lightColor,
  dark: darkColor,
};

export type ThemeProps = {
  value: ThemeMode;
  children: ReactNode;
};

/**
 * Forces a color mode (ROADMAP item 19) on its subtree, regardless of the viewer's OS
 * `prefers-color-scheme`. Components read the `color` alias group (`bgCanvas`, `bgSurface`,
 * `textPrimary`, `accent`, … — see `tokens.stylex.ts`) ambiently; every one of those vars already
 * carries a light default and a `@media (prefers-color-scheme: dark)` override, so a host that
 * does nothing at all already gets correct light/dark behavior for free, following the system
 * setting. `Theme` exists only for the host that wants to override that — pin one screen to
 * `dark` inside an otherwise-light app, or vice versa — via a `stylex.createTheme` theme, which
 * works by overriding the underlying CSS custom properties on a real DOM element, so this renders
 * a wrapping `<div>` (a `Fragment` can't carry a className/the theme's custom properties) — the
 * same mechanism and the same reason `Density` (`src/components/Density.tsx`) renders one.
 *
 * There is no `value="system"`: that would just be an inert wrapper doing nothing a plain
 * `<div>` (or omitting `Theme` entirely) doesn't already do, since "follow the system" is what
 * every `color.*` var's own `@media` default already does with no wrapper at all — a third value
 * that renders no real theme would be exactly the kind of single-purpose no-op this framework's
 * Objective tests refuse. Not wrapping content in `Theme` *is* "system"; wrapping it in
 * `value="light"` or `value="dark"` is the only thing this component does.
 *
 * Because this is a real CSS custom property override on an ancestor element, a `Theme`-wrapped
 * region nests via ordinary cascading the same way `Density` regions do: the nearest `Theme`
 * ancestor wins, so a `dark`-forced region can still contain a `light`-forced region inside it
 * (see `test/browser/theme-contrast.spec.ts`).
 */
export function Theme({ value, children }: ThemeProps) {
  return <div {...stylex.props(THEMES[value])}>{children}</div>;
}
