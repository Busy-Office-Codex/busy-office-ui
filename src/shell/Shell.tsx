import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { Button } from '../components/Button.js';
import { Chip } from '../components/Chip.js';
import { Density } from '../components/Density.js';
import { Input } from '../components/Input.js';
import { Text } from '../components/Text.js';
import { color, density, font, motion, radius } from '../tokens.stylex.js';

export type ShellRoute = {
  id: string;
  /** Host-defined module name; sibling routes share it in the app strip. */
  module: string;
  label: string;
  disabled?: boolean;
};

export type ShellNavigation = {
  routes: readonly ShellRoute[];
  activeRouteId: string;
  onNavigate: (routeId: string) => void;
};

export type ShellPinnedApp = {
  id: string;
  label: string;
  routeId?: string;
  count?: number;
};

export type ShellCommand = {
  id: string;
  label: string;
  group?: string;
  hint?: string;
  onRun: () => void;
};

export type ShellProps = {
  navigation: ShellNavigation;
  pinned?: readonly ShellPinnedApp[];
  commands?: readonly ShellCommand[];
  brand?: ReactNode;
  account?: ReactNode;
  home?: ReactNode;
  children?: ReactNode;
};

export const SHELL_MAX_ROUTES = 32;
export const SHELL_MAX_ROUTE_ID_LENGTH = 64;
export const SHELL_MAX_ROUTE_LABEL_LENGTH = 80;

const FONT_STACK = '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Pure validation for hosts that build route registries dynamically. */
export function validateShellNavigation({ routes, activeRouteId }: Pick<ShellNavigation, 'routes' | 'activeRouteId'>): string[] {
  const errors: string[] = [];
  if (!Array.isArray(routes)) return ['Route registry must be an array.'];
  if (routes.length > SHELL_MAX_ROUTES) errors.push(`Route registry exceeds ${SHELL_MAX_ROUTES} entries.`);
  const ids = new Set<string>();
  const screens = new Set<string>();
  for (const route of routes) {
    if (typeof route.id !== 'string' || !route.id.trim()) errors.push('Route ids must not be empty.');
    else if (route.id.length > SHELL_MAX_ROUTE_ID_LENGTH) errors.push(`Route id exceeds ${SHELL_MAX_ROUTE_ID_LENGTH} characters: ${route.id}`);
    else if (ids.has(route.id)) errors.push(`Duplicate route id: ${route.id}`);
    if (typeof route.label !== 'string' || !route.label.trim()) errors.push('Route labels must not be empty.');
    else if (route.label.length > SHELL_MAX_ROUTE_LABEL_LENGTH) errors.push(`Route label exceeds ${SHELL_MAX_ROUTE_LABEL_LENGTH} characters: ${route.label}`);
    const validModule = typeof route.module === 'string' && route.module.trim().length > 0;
    if (!validModule) errors.push(`Route module must not be empty: ${String(route.id)}`);
    else if (typeof route.label === 'string' && screens.has(`${route.module}:${route.label}`)) errors.push(`Duplicate route screen: ${route.module}/${route.label}`);
    if (typeof route.id === 'string') ids.add(route.id);
    if (validModule && typeof route.label === 'string') screens.add(`${route.module}:${route.label}`);
  }
  if (!ids.has(activeRouteId)) errors.push(`Unknown active route id: ${activeRouteId}`);
  return errors;
}

function canRestoreFocus(element: HTMLElement): boolean {
  if (!element.isConnected || element.matches(':disabled, [hidden], [inert], [aria-hidden="true"]')) return false;
  if (element.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
  const style = window.getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && element.getClientRects().length > 0;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Contrast fix (2026-09-14 design review, confirmed): was `color.textTertiary` (#64748b),
// which measures ~4.32:1 against the glass panel's actual rendered background (backdrop-filter
// blur over a translucent fill, not the nominal rgba alone) — under WCAG AA's 4.5:1 body-text
// threshold. `color.textSecondary` (#475569) clears it. Shared by both the palette's own "esc"
// hint and the command-bar trigger's "⌘K" hint (the latter sits on a solid white background,
// so it already passed — reusing the token here keeps one shared constant instead of forking it).
const kbd = { font: '11px ui-monospace, monospace', border: `1px solid ${color.border}`, borderRadius: 4, padding: '1px 5px', color: color.textSecondary } as const;

function CommandPalette({ commands, onClose }: { commands: readonly ShellCommand[]; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  // Roving highlight (confirmed finding: typing a query down to one match, then pressing Enter,
  // ran nothing). Mirrors Dropdown's `highlighted` index + `aria-activedescendant` pattern
  // (src/components/Dropdown.tsx's `openMenu`/`handleMenuKeyDown`), adapted for a palette whose
  // rows stay real, individually-focusable `<button>`s (Tab already moves through them, and
  // several browser tests already target them by role="button" — see
  // test/browser/shell-focus.spec.ts, test/browser/design-fidelity-fixes.spec.ts), so unlike
  // Dropdown's `role="option"` items, the highlight lives beside native focus rather than
  // replacing it: the search Input owns `aria-activedescendant` (a combobox-style textbox
  // pattern), ArrowUp/ArrowDown move it among the CURRENTLY VISIBLE (filtered) commands without
  // moving focus off the Input, and Enter runs the highlighted command the same way a click does.
  const [highlighted, setHighlighted] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();

  const groups = Array.from(new Set(commands.map((command) => command.group).filter((group): group is string => Boolean(group))));
  const categories = ['All', ...groups];
  const needle = query.trim().toLowerCase();
  const visible = commands.filter((command) => {
    if (category !== 'All' && command.group !== category) return false;
    return !needle || command.label.toLowerCase().includes(needle);
  });
  const sections: (string | undefined)[] = groups.filter((group) => category === 'All' || group === category);
  if (category === 'All' && commands.some((command) => !command.group)) sections.push(undefined);
  // Same order the rows below actually render in (grouped by section, ungrouped last) — the
  // flat index keyboard nav and `aria-activedescendant` both need.
  const orderedVisible = sections.flatMap((group) => visible.filter((command) => command.group === group));
  const highlightedCommand = orderedVisible[highlighted];

  // Defaults the highlight back to the first visible command whenever the query or category
  // narrows (or widens) the result set, same as Dropdown's `openMenu` picking a fresh index.
  useEffect(() => {
    setHighlighted(0);
  }, [query, category]);

  const optionId = (commandId: string) => `${baseId}-command-${commandId}`;

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (orderedVisible.length > 0) setHighlighted((index) => (index + 1) % orderedVisible.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (orderedVisible.length > 0) setHighlighted((index) => (index - 1 + orderedVisible.length) % orderedVisible.length);
    } else if (event.key === 'Enter') {
      if (highlightedCommand) {
        event.preventDefault();
        highlightedCommand.onRun();
        onClose();
      }
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      onClick={onClose}
      data-testid="command-palette-backdrop"
      style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.32)', display: 'flex', justifyContent: 'center', paddingTop: 120, zIndex: 1000 }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          width: 680,
          maxWidth: '90vw',
          maxHeight: 460,
          background: 'rgba(255, 255, 255, 0.86)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: 14,
          boxShadow: '0 16px 40px -8px rgba(15,23,42,.18), 0 4px 10px rgba(15,23,42,.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: FONT_STACK,
        }}
      >
        <Density value="compact">
          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Search records, run actions, jump to pages…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                // `aria-activedescendant` is valid directly on a plain textbox as of ARIA 1.2 —
                // exactly this "search box with a live, keyboard-navigable results list" pattern —
                // so no `role="combobox"`/`aria-controls` scaffolding is added here: the command
                // rows stay real, individually tabbable `<button>`s (existing browser tests already
                // target them by role="button" — see test/browser/shell-focus.spec.ts), not
                // `role="option"` children of a `role="listbox"`, so this deliberately doesn't
                // replicate Dropdown's full listbox structure.
                aria-activedescendant={highlightedCommand ? optionId(highlightedCommand.id) : undefined}
                size="search"
                autoFocus
              />
            </div>
            <span style={kbd}>esc</span>
            <Button type="button" variant="ghost" onClick={onClose} aria-label="Close command palette">
              Close
            </Button>
          </div>
        </Density>
        {groups.length > 0 && (
          <div style={{ padding: '8px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <Chip key={cat} variant="filter" selected={cat === category} onClick={() => setCategory(cat)}>
                {cat}
              </Chip>
            ))}
          </div>
        )}
        <div style={{ overflow: 'auto', flex: 1, paddingBottom: 8 }}>
          {visible.length === 0 && (
            <div style={{ padding: '16px 20px' }}>
              <Text variant="caption">{commands.length === 0 ? 'No commands are registered.' : 'No commands match.'}</Text>
            </div>
          )}
          {sections.map((group) => {
            const items = visible.filter((command) => command.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group ?? 'ungrouped'}>
                {group && (
                  <div style={{ padding: '6px 20px' }}>
                    {/* Not `<Text variant="overline">`: that variant bakes in `color.textTertiary`
                        globally (src/components/Text.tsx), which is correct everywhere else but
                        fails 4.5:1 here against the glass panel's actual rendered background
                        (confirmed finding, ~4.32:1) — this mirrors Text's overline typographic
                        spec exactly, just with `color.textSecondary` instead, scoped to this one
                        glass-panel context instead of changing every overline in the system. */}
                    <span
                      style={{
                        fontSize: font.sizeOverline,
                        fontWeight: font.weightSemibold,
                        lineHeight: font.lineHeightCaption,
                        letterSpacing: font.letterSpacingOverline,
                        textTransform: 'uppercase',
                        color: color.textSecondary,
                      }}
                    >
                      {group}
                    </span>
                  </div>
                )}
                {items.map((command) => {
                  const rowIndex = orderedVisible.findIndex((candidate) => candidate.id === command.id);
                  const isHighlighted = rowIndex === highlighted;
                  return (
                    <button
                      key={command.id}
                      id={optionId(command.id)}
                      type="button"
                      onMouseEnter={() => setHighlighted(rowIndex)}
                      onClick={() => {
                        command.onRun();
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 20px',
                        background: isHighlighted ? 'rgba(15, 23, 42, 0.06)' : 'transparent',
                        border: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                        font: 'inherit',
                      }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: color.border, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <Text variant="body">{command.label}</Text>
                      </div>
                      {command.hint && <Text variant="caption">{command.hint}</Text>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ height: 40, borderTop: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0 }}>
          <Text variant="caption">tab move</Text>
          <Text variant="caption">↵ run</Text>
          <Text variant="caption">esc close</Text>
        </div>
      </div>
    </div>
  );
}

function DefaultHome({ routes, onNavigate }: { routes: readonly ShellRoute[]; onNavigate: (routeId: string) => void }) {
  const modules = Array.from(new Set(routes.map((route) => route.module)));
  return (
    <div style={{ padding: '28px 48px 100px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto' }}>
      {modules.length === 0 && <Text variant="caption">No pages are registered.</Text>}
      {modules.map((module) => (
        <div key={module} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Text variant="overline">{module}</Text>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {routes
              .filter((route) => route.module === module)
              .map((route) => (
                <Button key={route.id} type="button" variant="secondary" disabled={route.disabled} onClick={() => onNavigate(route.id)}>
                  {route.label}
                </Button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Shell({ navigation, pinned = [], commands = [], brand, account, home, children }: ShellProps) {
  const [showLauncher, setShowLauncher] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteOpenRef = useRef(false);
  const paletteOpenerRef = useRef<HTMLElement | null>(null);
  const mountedRef = useRef(true);
  // Owner-directed (2026-09-15): the brand block, the app-strip row and the dock collapse/hide
  // together while scrolling down into a page's content (freeing vertical space), and return the
  // moment the user scrolls back up or reaches the top — leaving only the search trigger and the
  // `account` slot always visible in the top bar. One shared boolean drives all three surfaces
  // since they always move in lockstep; a scroll-position ref (not state) tracks direction
  // without re-rendering on every scroll event.
  const [chromeExpanded, setChromeExpanded] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    // A small dead zone (8px) absorbs trackpad/rubber-band jitter that would otherwise flip
    // direction on every frame; "at the top" always wins regardless of direction, so the chrome
    // is never stuck collapsed when there's nothing left to scroll past.
    const SCROLL_DEAD_ZONE = 8;
    const AT_TOP_THRESHOLD = 4;
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;
      if (currentY <= AT_TOP_THRESHOLD) setChromeExpanded(true);
      else if (delta > SCROLL_DEAD_ZONE) setChromeExpanded(false);
      else if (delta < -SCROLL_DEAD_ZONE) setChromeExpanded(true);
      lastScrollYRef.current = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openPalette = (opener?: HTMLElement) => {
    if (paletteOpenRef.current) return;
    const activeElement = opener ?? document.activeElement;
    paletteOpenerRef.current = activeElement instanceof HTMLElement ? activeElement : null;
    paletteOpenRef.current = true;
    setPaletteOpen(true);
  };

  const closePalette = () => {
    if (!paletteOpenRef.current) return;
    const opener = paletteOpenerRef.current;
    paletteOpenerRef.current = null;
    paletteOpenRef.current = false;
    setPaletteOpen(false);
    window.requestAnimationFrame(() => {
      if (mountedRef.current && !paletteOpenRef.current && opener && canRestoreFocus(opener)) opener.focus();
    });
  };

  useEffect(() => {
    mountedRef.current = true;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openPalette();
      }
      if (event.key === 'Escape') closePalette();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const errors = validateShellNavigation(navigation);
  const valid = errors.length === 0;
  const activeRoute = valid ? navigation.routes.find((route) => route.id === navigation.activeRouteId) : undefined;
  const stripRoutes = activeRoute ? navigation.routes.filter((route) => route.module === activeRoute.module) : [];
  const navigate = (routeId: string) => {
    navigation.onNavigate(routeId);
    setShowLauncher(false);
  };

  return (
    <div style={{ fontFamily: FONT_STACK, minHeight: '100vh', background: color.bgCanvas, color: color.textPrimary, display: 'flex', flexDirection: 'column' }}>
      {/* `position: fixed`, not an in-flow sibling (owner-directed scroll-collapse, 2026-09-15):
          an in-flow header whose own height/width animates on scroll changes the document's total
          scroll height, which the browser then clamps the scroll position against — firing more
          'scroll' events that re-trigger this same collapse logic, an infinite feedback loop. A
          fixed header never affects document height regardless of its own size, so it can't create
          that loop (same reason the dock below is already `position: fixed`). The content area
          reserves the FULL expanded height (52 + 44) as a constant `paddingTop` so nothing shifts
          at the default (top-of-page) state — see below. */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          height: 52,
          flex: 'none',
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 20px',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <div
          aria-hidden={!chromeExpanded}
          inert={!chromeExpanded}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
            overflow: 'hidden',
            maxWidth: chromeExpanded ? 240 : 0,
            marginRight: chromeExpanded ? 0 : -12,
            opacity: chromeExpanded ? 1 : 0,
            transitionProperty: 'max-width, margin-right, opacity',
            transitionDuration: motion.durationBase,
            transitionTimingFunction: motion.easeStandard,
          }}
        >
          {brand ?? (
            <>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: color.textPrimary, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>Busy Office</span>
            </>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 520, maxWidth: '40vw' }}>
          <button
            type="button"
            onClick={(event) => openPalette(event.currentTarget)}
            aria-label="Open command palette"
            // Density-aware (ROADMAP item 10: "Shell's command-bar ... controls"), same
            // `controlHeight`/`fontSize` aliases Button/Dropdown/filter-Chip read — this plain
            // element isn't a `Button` (docs/Shell.md: its search-bar shape isn't one a pill can
            // produce), but it's still a command-bar control, so it takes its sizing from the
            // same place. `stylex`'s var-group values are plain `var(...)` strings, valid
            // directly in a React inline `style` object (Shell already does this for `radius.sm`
            // on the app-strip highlight below) — no need for a `stylex.create` block just for
            // this. `min-height`, not a fixed `height` (see Button/Input/Table for why).
            style={{
              width: '100%',
              minHeight: density.controlHeight,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 12px',
              borderRadius: 10,
              border: `1px solid ${color.border}`,
              background: color.bgSurface,
              color: color.textTertiary,
              fontFamily: 'inherit',
              fontSize: density.fontSize,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span aria-hidden="true" style={{ width: 13, height: 13, borderRadius: '50%', border: `1.5px solid ${color.textTertiary}`, flexShrink: 0 }} />
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Type a command, a record, or an app…</span>
          </button>
          <span style={{ ...kbd, position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: color.bgSurface, pointerEvents: 'none' }}>⌘K</span>
        </div>
        <div style={{ flex: 1 }} />
        {account}
      </div>

      <Density value="compact">
        <div
          aria-hidden={!chromeExpanded}
          inert={!chromeExpanded}
          style={{
            position: 'fixed',
            top: 52,
            left: 0,
            right: 0,
            zIndex: 10,
            height: chromeExpanded ? 44 : 0,
            flex: 'none',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid rgba(15, 23, 42, ${chromeExpanded ? 0.06 : 0})`,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '0 16px',
            overflowX: 'auto',
            overflowY: 'hidden',
            opacity: chromeExpanded ? 1 : 0,
            transitionProperty: 'height, opacity, border-color',
            transitionDuration: motion.durationBase,
            transitionTimingFunction: motion.easeStandard,
          }}
        >
          <div style={{ width: 22, height: 22, borderRadius: 6, background: color.textPrimary, flexShrink: 0, marginRight: 6 }} />
          <div style={{ marginRight: 10 }}>
            <Text variant="overline">{valid ? (activeRoute?.module ?? '') : 'Navigation unavailable'}</Text>
          </div>
          {stripRoutes.map((route) => {
            const active = route.id === activeRoute?.id && !showLauncher;
            return (
              <Button
                key={route.id}
                type="button"
                variant={active ? 'secondary' : 'ghost'}
                aria-current={active ? 'page' : undefined}
                disabled={route.disabled}
                onClick={() => navigate(route.id)}
                // A capsule reads as "a discrete action" (see docs/design-conventions.md's
                // capsule-vs-rectangle rule); this is a highlight behind existing nav content,
                // not a new action, so it gets radius.sm like Dropdown's own highlighted menu
                // item does — not Button's default pill. Applied to both states: 'ghost's own
                // :hover background would otherwise show a pill-shaped highlight on an inactive
                // tab, inconsistent with the active tab's rounded-rect.
                //
                // `color`: only set on the inactive branch. The active tab is `variant="secondary"`,
                // whose own `color: color.textPrimary` (Button.tsx) is already correct and shouldn't
                // be overridden; `ghost` (inactive) also resolves to `color.textPrimary` by default,
                // but the reference wants inactive strip items specifically at `color.textSecondary`
                // (Shell.dc.html: "inactive item color #475569, no bg") — an inline `style` color
                // wins over `ghost`'s class-based color by CSS specificity (inline > class).
                style={{ flexShrink: 0, fontWeight: active ? 600 : undefined, borderRadius: radius.sm, color: active ? undefined : color.textSecondary }}
              >
                {route.label}
              </Button>
            );
          })}
        </div>
      </Density>

      {/* `paddingTop: 96` is a CONSTANT, not tied to `chromeExpanded` — it reserves exactly the
          fixed header's full expanded height (52 + 44) so nothing shifts when the page first
          loads (matching the pre-scroll-collapse layout exactly). It deliberately does NOT shrink
          when the header collapses: an animated padding here would reintroduce the same
          document-height feedback loop the header's own `position: fixed` above was just made to
          avoid. The visible effect when collapsed is a fixed, floating header over already-
          scrolled content — the standard collapsing-header pattern (Gmail/X mobile web), not
          content sliding up to reclaim the space. */}
      {/* `minHeight: 0` overrides the flex default (`auto`, effectively "never shrink below my
          content's size") — needed so a page that wants to cap itself to the available height and
          scroll its OWN content internally (Inbox.tsx's wide-viewport layout) actually can; without
          it, this container would grow to fit that page's full content regardless, defeating the
          page's own `overflow: hidden`. Harmless for every other page: none of them set a height
          on themselves, so they still just grow to their natural content height exactly as before —
          removing an unused floor changes nothing for content that was never being floored.
          `boxSizing: 'border-box'` is the fix a `height: '100%'` page (Inbox.tsx) actually depends
          on: without it, this div's default `content-box` sizing means `flex: 1`'s computed
          content height plus this element's OWN 192px of padding exceeds the space the flex column
          actually has, pushing the whole page 192px taller than the viewport — the exact bug
          `RecordDetail.tsx` was fixed for (ROADMAP item 14: "RecordDetail's root missing
          `box-sizing: border-box`"), just not one this div needed until a page could size itself
          against it. */}
      <div style={{ flex: 1, minHeight: 0, boxSizing: 'border-box', paddingTop: 96, paddingBottom: 96, position: 'relative' }}>
        {!valid ? (
          <div role="status" style={{ padding: 32 }}>
            <Text variant="heading">Navigation is unavailable</Text>
            <Text variant="body">The supplied route registry is invalid, so no page was selected.</Text>
          </div>
        ) : (
          <>
            <div hidden={showLauncher} aria-hidden={showLauncher} inert={showLauncher}>{children}</div>
            {showLauncher && (home ?? <DefaultHome routes={navigation.routes} onNavigate={navigate} />)}
          </>
        )}
      </div>

      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', padding: '0 12px 12px', pointerEvents: 'none' }}>
        <div
          role="region"
          aria-label="App dock"
          aria-hidden={!chromeExpanded}
          inert={!chromeExpanded}
          tabIndex={0}
          style={{
            height: 60,
            padding: '0 12px',
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 6px 16px -4px rgba(15,23,42,.12), 0 2px 4px rgba(15,23,42,.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            pointerEvents: chromeExpanded ? 'auto' : 'none',
            flex: '0 1 auto',
            minWidth: 0,
            maxWidth: '100%',
            overflowX: 'auto',
            transform: chromeExpanded ? 'translateY(0)' : 'translateY(140%)',
            opacity: chromeExpanded ? 1 : 0,
            transitionProperty: 'transform, opacity',
            transitionDuration: motion.durationBase,
            transitionTimingFunction: motion.easeStandard,
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <button
              type="button"
              disabled={!valid}
              onClick={() => setShowLauncher(true)}
              aria-label="Open launcher"
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 12,
                border: 0,
                background: color.action,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: 3,
                placeItems: 'center',
                padding: 12,
                cursor: valid ? 'pointer' : 'not-allowed',
                opacity: valid ? 1 : 0.4,
              }}
            >
              {[0, 1, 2, 3].map((dot) => (
                <span key={dot} aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: color.textOnInk }} />
              ))}
            </button>
          </div>
          {pinned.length > 0 && <div style={{ width: 1, height: 36, background: color.border, flexShrink: 0 }} />}
          {pinned.map((app) => {
            const route = app.routeId ? navigation.routes.find((candidate) => candidate.id === app.routeId) : undefined;
            const disabled = !route || route.disabled;
            return (
              <button
                key={app.id}
                type="button"
                aria-label={app.count !== undefined ? `${app.label}, ${app.count} unread` : app.label}
                title={app.label}
                disabled={disabled}
                onClick={route ? () => navigate(route.id) : undefined}
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: `1px solid ${color.border}`,
                  background: color.bgSurface,
                  color: color.textPrimary,
                  fontFamily: 'inherit',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                {[...app.label][0]?.toUpperCase()}
                {app.count !== undefined && (
                  // Bespoke, not `Chip` (docs/Shell.md's disclosed pattern for the palette
                  // trigger/dock tiles): reference size is ~10px/600 text, padding 1px 6px,
                  // radius 980, offset -6/-6 (Shell.dc.html dock anatomy) — `Chip`'s smallest
                  // (`status`) variant is a fixed 24px tall, 60-70% larger than that. A child of
                  // the tile `<button>` (not a sibling), so it's part of the button's box and
                  // dims with it for free: `opacity` isn't inherited by the CSS cascade, but an
                  // ancestor's `opacity < 1` still visually composites every descendant at that
                  // same reduced opacity (a genuine stacking-context effect, not inheritance) —
                  // so this span deliberately sets no `opacity` of its own, letting the button's
                  // `disabled` dimming above apply for free instead of fighting it with an
                  // explicit `opacity: 1`. `aria-hidden` because the count is already part of the
                  // button's own `aria-label` above; exposing it again here would double-announce.
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      // -7, not -6: an absolutely positioned child's top/right are measured from
                      // its containing block's PADDING box, not its border box (CSS spec) — the
                      // tile button's 1px border eats exactly 1px off a literal -6, rendering at
                      // -5 relative to the tile's visible (border-box) edge. -7 compensates so
                      // the RENDERED offset matches the reference's -6/-6 exactly (verified: the
                      // failing test measured -5, confirming the 1px border was the cause).
                      top: -7,
                      right: -7,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1px 6px',
                      borderRadius: radius.pill,
                      backgroundColor: color.accent,
                      color: color.textOnInk,
                      fontSize: font.sizeOverline,
                      fontWeight: font.weightSemibold,
                      lineHeight: '1.2',
                    }}
                  >
                    {app.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {paletteOpen && <CommandPalette commands={commands} onClose={closePalette} />}
    </div>
  );
}
