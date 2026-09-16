import * as stylex from '@stylexjs/stylex';
import { useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Button, ButtonGroup, Icon, Text } from '../src/index.js';
import { color, font, glass, radius, shadow, space } from '../src/tokens.stylex.js';

/**
 * A quick-settings popover for `AppShell`'s top bar (owner-directed, 2026-09-15, following the
 * "+ New" removal: a real, well-scoped need for a settings entry point, once the confusing
 * global-create button was gone). Structural first pass, same standard as M6's sample pages:
 * real components, real interaction where the underlying capability genuinely exists, disclosed
 * placeholders where it doesn't — not a decorative mockup pretending to be finished.
 *
 * **Density** is real and functional: this package already ships a working `Density` tier system
 * (`compact`/`comfortable`/`spacious`), so selecting a tier here actually re-themes every
 * density-aware control across the whole app (`AppShell.tsx` wraps its `Shell` children in
 * `<Density value={density}>`, driven by this component's own selection) — a genuine feature,
 * not a mockup.
 *
 * **Appearance** (Light/Dark/System) is now real too — closing ROADMAP item 36's own disclosed
 * gap ("`Theme` ships with no real named consumer yet... `ControlCenter.tsx`'s disabled Dark/
 * System `Appearance` toggle is the obvious first candidate"). Selecting a segment here actually
 * forces that color mode across the whole app's content (`AppShell.tsx` wraps its `home`/
 * `children` in `<Theme value={appearance}>` when `appearance` is `'light'` or `'dark'`, driven
 * by this component's own selection, the same lifted-controlled-prop shape `density`/
 * `onDensityChange` already used) — a genuine feature, not a mockup. `'system'` renders no
 * `Theme` wrapper at all rather than a third `Theme` value: `Theme.tsx`'s own doc comment already
 * explains why — every `color.*` token's own `@media (prefers-color-scheme: dark)` default
 * already follows the OS/browser setting with zero host code, so a `value="system"` would be an
 * inert no-op wrapper, exactly what this framework's Objective 1 refuses.
 *
 * The panel is rendered through a `createPortal` into `document.body`, positioned with
 * `position: 'fixed'` at coordinates computed from the trigger's own `getBoundingClientRect()` —
 * not a plain child of the trigger's wrapper the way `Dropdown.tsx`'s menu is. Found live, not
 * assumed necessary up front: the trigger lives inside `Shell`'s top bar, which sets
 * `overflowX: 'auto', overflowY: 'hidden'` (see Shell.tsx) so its own content can scroll
 * horizontally on narrow screens without a vertical scrollbar — but `overflow: hidden` clips
 * ANY descendant that visually extends past its box, including a `position: absolute` popover,
 * regardless of z-index (verified directly: bumping the panel's z-index to 99999, then the top
 * bar's own z-index to 99999, changed nothing — `getBoundingClientRect()` reported a perfectly
 * correct on-screen box the whole time, because that call doesn't know about ancestor clipping;
 * only `elementFromPoint` and an actual screenshot revealed the panel was invisible). A portal is
 * the standard fix for a popover trigger that lives inside a clipping/scrolling ancestor. Visual
 * styling (the `glass`/`shadow.md`/`radius.md` treatment) still mirrors `Dropdown.tsx`'s own menu
 * popover — the closest existing precedent for "a lightweight, non-modal popover anchored to a
 * trigger", not `Modal`'s heavier full-viewport glass overlay (this never blocks the rest of the
 * page, and doesn't need `Modal`'s full Tab-trap: Escape closes it and returns focus to the
 * trigger, a click outside closes it, and on open focus moves to the panel's first control — the
 * same "focus moves in on open" contract `Modal`/the command palette both already establish — but
 * Tab is allowed to move focus back out to the rest of the page rather than wrapping, since
 * nothing behind this popover is blocked or inert).
 *
 * The trigger's glyph is a real `Icon` (`name="sliders"`, ROADMAP issue #18) — this file's own
 * former hand-built `SlidersGlyph` stand-in is what that issue named as its first migration
 * target; `docs/Shell.md` still discloses the same gap for the palette trigger and dock tiles,
 * which stay out of this issue's scope (no named consumer there yet).
 *
 * Density and Appearance render as `ButtonGroup` (owner-directed, 2026-09-15: "pls use group
 * button" — a joined single-select pill, not a row of separately-spaced filter `Chip`s). This
 * was the first real call site for that component — it did not exist before this request; see
 * `docs/ButtonGroup.md`. Appearance's own selection now lives in `AppShell.tsx` as a controlled
 * prop (this component owns no appearance state of its own, same as `density`) — Dark/System are
 * ordinary enabled segments now, not the `disabled` + `ariaLabel` placeholder pair they carried
 * before real theming was wired up here (that pairing's only real `ButtonGroup` exerciser now
 * lives in `preview/ButtonGroupLab.tsx`, see `test/browser/button-group.spec.ts`).
 */

export type ControlCenterDensity = 'compact' | 'comfortable' | 'spacious';

const DENSITY_OPTIONS: { value: ControlCenterDensity; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

export type Appearance = 'light' | 'dark' | 'system';

const APPEARANCE_OPTIONS: { value: Appearance; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const styles = stylex.create({
  trigger: {
    position: 'relative',
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 8,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: {
      default: color.border,
      ':active': color.borderStrong,
    },
    backgroundColor: {
      default: color.bgSurface,
      ':hover': color.bgSubtle,
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    // Same shared focus-ring treatment as every other focusable control in this repo.
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
  panel: {
    // `position`/`top`/`right` are NOT here — they're computed per-open from the trigger's own
    // `getBoundingClientRect()` and applied as a plain inline `style` alongside this stylex
    // block (see the component body) rather than being static, since the panel is portaled to
    // `document.body` and needs real viewport coordinates, not a CSS value relative to a parent
    // it's no longer a DOM descendant of.
    // 320px, not the original 280px (owner-flagged, 2026-09-15: "needs bigger space for control
    // center?"): with `ButtonGroup`'s segments now equal-width (see ButtonGroup.tsx), the widest
    // label in this panel — "Comfortable" — needs roughly 113px on its own at this padding/font
    // size (measured live), so a 3-segment row needs ~339px before border/padding; 280px was
    // already tight for the OLD unequal-width layout and would force real crowding once every
    // segment has to match the widest one's share.
    width: '320px',
    borderRadius: radius.md,
    padding: space.space4,
    backgroundColor: glass.bg,
    backdropFilter: `blur(${glass.blur})`,
    border: glass.border,
    boxShadow: `${shadow.md}, ${glass.highlight}`,
    display: 'flex',
    flexDirection: 'column',
    gap: space.space4,
    fontFamily: font.family,
    zIndex: 100,
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

function focusableWithin(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export function ControlCenterButton({
  density,
  onDensityChange,
  appearance,
  onAppearanceChange,
  onOpenSettings,
}: {
  density: ControlCenterDensity;
  onDensityChange: (value: ControlCenterDensity) => void;
  appearance: Appearance;
  onAppearanceChange: (value: Appearance) => void;
  onOpenSettings?: () => void;
}) {
  const [open, setOpen] = useState(false);
  // Viewport coordinates for the portaled panel — `null` until computed on open, matching the
  // trigger's own `getBoundingClientRect()` (bottom edge + 8px gap, right edge aligned).
  const [panelPosition, setPanelPosition] = useState<{ top: number; right: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const positionPanel = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Found live (owner-flagged, 2026-09-15, widening the panel from 280px to 320px to fit
      // ButtonGroup's now-equal-width segments): a pure right-edge-aligned `right` value pushed
      // the panel's LEFT edge to x:-56 at a 390px viewport — the top bar's own narrow-viewport
      // retraction (Shell.tsx's `chromeIsNarrow`) sits the trigger close enough to the left edge
      // that a 320px-plus-padding panel no longer fits between the trigger and the screen's left
      // side. `panelRef.current` already exists in the DOM at this point (React commits `open`'s
      // new DOM before this layout effect runs), so its real rendered width — fixed by the
      // `panel` style's own `width`, independent of position — can be measured directly instead
      // of duplicating that value as a second hardcoded constant here.
      const panelWidth = panelRef.current?.getBoundingClientRect().width;
      let right = window.innerWidth - rect.right;
      if (panelWidth) {
        const viewportMargin = 12; // matches Shell's own narrow-viewport horizontal padding
        const maxRight = window.innerWidth - panelWidth - viewportMargin;
        right = Math.min(right, Math.max(maxRight, viewportMargin));
      }
      setPanelPosition({ top: rect.bottom + 8, right });
    };
    positionPanel();
    // The trigger lives inside Shell's `position: fixed` top bar, so its viewport position never
    // changes on page scroll — only a viewport resize can move it.
    window.addEventListener('resize', positionPanel);

    // Matches Modal's own "on open, focus the first focusable child (or the panel)" contract —
    // `{ preventScroll: true }` is load-bearing, not defensive: found live, not assumed. Before
    // this became a portal, the trigger's un-portaled panel sat inside Shell's top bar, which
    // sets `overflowY: 'hidden'` (see Shell.tsx) — a plain `.focus()` on a newly-focused element
    // outside that ancestor's visible 52px area triggered the browser's default scroll-into-view,
    // which set a real `scrollTop` on the top bar EVEN THOUGH `overflow: hidden` blocks
    // scrollbars/user-drag scrolling (it does not block a programmatic scrollTop change) —
    // visibly throwing every one of the bar's children ~115px upward. The portal below removes
    // the CLIPPING problem this caused; `preventScroll` is kept regardless, since focusing
    // anything can still trigger an ancestor scroll in principle and there's no reason to allow it.
    const first = panelRef.current ? focusableWithin(panelRef.current)[0] : undefined;
    (first ?? panelRef.current)?.focus({ preventScroll: true });

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const insideTrigger = containerRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('resize', positionPanel);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    }
  };

  const panelStylexProps = stylex.props(styles.panel);

  const panel = open && (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Control center"
      tabIndex={-1}
      onKeyDown={handlePanelKeyDown}
      {...panelStylexProps}
      style={{
        ...panelStylexProps.style,
        position: 'fixed',
        top: panelPosition?.top ?? 0,
        right: panelPosition?.right ?? 0,
      }}
    >
      <Text variant="title" as="h2">
        Control center
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
        <Text variant="caption" as="h3">
          Appearance
        </Text>
        <ButtonGroup
          aria-label="Appearance"
          value={appearance}
          onChange={(value) => onAppearanceChange(value as Appearance)}
          options={APPEARANCE_OPTIONS}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
        <Text variant="caption" as="h3">
          Density
        </Text>
        <ButtonGroup
          aria-label="Density"
          value={density}
          onChange={(value) => onDensityChange(value as ControlCenterDensity)}
          options={DENSITY_OPTIONS}
        />
      </div>

      {onOpenSettings && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            onOpenSettings();
          }}
        >
          Open Settings ↗
        </Button>
      )}
    </div>
  );

  return (
    <div ref={containerRef} style={{ flexShrink: 0 }}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Control center"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        {...stylex.props(styles.trigger)}
      >
        {/* Decorative: the button's own `aria-label` above already carries the accessible name. */}
        <Icon name="sliders" color={color.textPrimary} />
      </button>
      {panel && createPortal(panel, document.body)}
    </div>
  );
}
