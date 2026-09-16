import type { ReactNode } from 'react';

export type IconName = 'sliders' | 'bell';

export type IconProps = {
  /** Which glyph to render, from this package's small, closed icon set (ROADMAP issue #18). */
  name: IconName;
  /**
   * Square pixel width/height the `viewBox` scales to fit. Defaults to 16 — the size both real
   * consumers (`ControlCenter.tsx`'s settings trigger, `AppShell.tsx`'s notification button) were
   * already sizing their hand-built stand-ins at.
   */
  size?: number;
  /**
   * CSS color value — typically one of this package's own `color.*` tokens (e.g.
   * `color.textPrimary`), the same "pass a token value as a prop" idiom `docs/design-
   * conventions.md` already documents for raw inline styles. Defaults to `currentColor`, so an
   * icon with no explicit color inherits whatever color its container already sets, same as any
   * other inline SVG glyph.
   */
  color?: string;
  /**
   * Accessible name for the icon itself. Set this only when the icon is the *sole* content of its
   * control — no visible label, and no `aria-label`/`title` already on the element that hosts it.
   * Doing so renders `role="img"` with a real `<title>`, so the icon is exposed to assistive tech.
   * Omit it (the default) for a decorative icon that sits inside or beside a control that already
   * carries its own accessible name elsewhere — every real consumer today (`ControlCenter.tsx`'s
   * `aria-label="Control center"` button, `AppShell.tsx`'s `aria-label="Notifications, 3 unread"`
   * button) already does this — the icon then renders `aria-hidden` and contributes nothing to the
   * accessibility tree, so the host control's own name is the only one a screen reader announces.
   */
  title?: string;
};

const VIEW_BOX = '0 0 16 16';

// Three horizontal tracks with a handle dot each, at staggered positions — the same silhouette
// `ControlCenter.tsx`'s hand-built `SlidersGlyph` used (see that file's own former header comment:
// "No Icon component exists in this package yet"), now real inline SVG instead of a stand-in.
function slidersGlyph(glyphColor: string): ReactNode {
  return (
    <>
      <line x1="1" y1="3" x2="15" y2="3" stroke={glyphColor} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="5" cy="3" r="1.75" fill={glyphColor} />
      <line x1="1" y1="8" x2="15" y2="8" stroke={glyphColor} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="11" cy="8" r="1.75" fill={glyphColor} />
      <line x1="1" y1="13" x2="15" y2="13" stroke={glyphColor} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="7" cy="13" r="1.75" fill={glyphColor} />
    </>
  );
}

// A domed bell body (rounded top, straight sides, a shallow flared base) plus a small crescent
// clapper below it — replaces `AppShell.tsx`'s plain filled square notification-bell stand-in.
function bellGlyph(glyphColor: string): ReactNode {
  return (
    <>
      <path
        d="M8 2a4 4 0 0 0-4 4v1.5c0 1.5-.6 2.94-1.67 4.01L2 12h12l-.33-.49A5.6 5.6 0 0 1 12 7.5V6a4 4 0 0 0-4-4z"
        fill={glyphColor}
      />
      <path d="M6.25 13a1.75 1.75 0 0 0 3.5 0h-3.5z" fill={glyphColor} />
    </>
  );
}

const GLYPHS: Record<IconName, (glyphColor: string) => ReactNode> = {
  sliders: slidersGlyph,
  bell: bellGlyph,
};

/**
 * A minimal Icon component (ROADMAP issue #18) rendering inline SVG paths from a small, closed
 * name set — `'sliders' | 'bell'` today, sized via `size` and colored via `color` (this package's
 * own token vocabulary, not a hand-authored class or hashed StyleX custom property — see
 * `docs/design-conventions.md`'s "props only" styling idiom). No icon font, no external icon
 * library import: matches this package's existing bundle-size discipline (ROADMAP item 34 found
 * and fixed the same discipline gap for tree-shaking).
 *
 * Named, closed set, not a general primitive (matching `Chart`'s own precedent of "smallest
 * addition, not a general primitive"): a new glyph needs its own real, named consumer the same way
 * `Chart`'s variants did, not a speculative "might need it later" addition. A QR-code stand-in
 * (`examples/Invoice.tsx`) was considered and declined for this set — see that file's own comment
 * for why a generated 2D barcode doesn't fit a *fixed-glyph* icon component.
 *
 * Accessibility is opt-in the other direction from most icon libraries: decorative by default
 * (`aria-hidden`, nothing added to the accessibility tree), because every real consumer today
 * already puts the accessible name on the control that hosts the icon (a button's own
 * `aria-label`), not the icon itself — see `title`'s own doc comment for the icon-only-button case
 * this still supports.
 */
export function Icon({ name, size = 16, color = 'currentColor', title }: IconProps) {
  const decorative = title === undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox={VIEW_BOX}
      focusable="false"
      aria-hidden={decorative ? 'true' : undefined}
      role={decorative ? undefined : 'img'}
    >
      {title ? <title>{title}</title> : null}
      {GLYPHS[name](color)}
    </svg>
  );
}
