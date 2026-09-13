import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { Button } from '../components/Button.js';
import { Chip } from '../components/Chip.js';
import { Input } from '../components/Input.js';
import { Text } from '../components/Text.js';

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

const kbd = { font: '11px ui-monospace, monospace', border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 5px', color: '#64748b' } as const;

function CommandPalette({ commands, onClose }: { commands: readonly ShellCommand[]; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const panelRef = useRef<HTMLDivElement | null>(null);

  const groups = Array.from(new Set(commands.map((command) => command.group).filter((group): group is string => Boolean(group))));
  const categories = ['All', ...groups];
  const needle = query.trim().toLowerCase();
  const visible = commands.filter((command) => {
    if (category !== 'All' && command.group !== category) return false;
    return !needle || command.label.toLowerCase().includes(needle);
  });
  const sections: (string | undefined)[] = groups.filter((group) => category === 'All' || group === category);
  if (category === 'All' && commands.some((command) => !command.group)) sections.push(undefined);

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
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Input placeholder="Search records, run actions, jump to pages…" value={query} onChange={(event) => setQuery(event.target.value)} autoFocus />
          </div>
          <span style={kbd}>esc</span>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Close command palette">
            Close
          </Button>
        </div>
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
                    <Text variant="overline">{group}</Text>
                  </div>
                )}
                {items.map((command) => (
                  <button
                    key={command.id}
                    type="button"
                    onClick={() => {
                      command.onRun();
                      onClose();
                    }}
                    style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '8px 20px', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: '#e2e8f0', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <Text variant="body">{command.label}</Text>
                    </div>
                    {command.hint && <Text variant="caption">{command.hint}</Text>}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ height: 40, borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0 }}>
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
    <div style={{ fontFamily: FONT_STACK, minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
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
        {brand ?? (
          <>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: '#0f172a', flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>Busy Office</span>
          </>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 520, maxWidth: '40vw' }}>
          <button
            type="button"
            onClick={(event) => openPalette(event.currentTarget)}
            aria-label="Open command palette"
            style={{
              width: '100%',
              height: 36,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#64748b',
              fontFamily: 'inherit',
              fontSize: 14,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span aria-hidden="true" style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid #64748b', flexShrink: 0 }} />
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Type a command, a record, or an app…</span>
          </button>
          <span style={{ ...kbd, position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: '#fff', pointerEvents: 'none' }}>⌘K</span>
        </div>
        <div style={{ flex: 1 }} />
        {account}
      </div>

      <div
        style={{
          height: 44,
          flex: 'none',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 16px',
          overflowX: 'auto',
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: 6, background: '#0f172a', flexShrink: 0, marginRight: 6 }} />
        <div style={{ marginRight: 10 }}>
          <Text variant="overline">{valid ? (activeRoute?.module ?? '') : 'Navigation unavailable'}</Text>
        </div>
        {stripRoutes.map((route) => {
          const active = route.id === activeRoute?.id && !showLauncher;
          return (
            <button
              key={route.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              disabled={route.disabled}
              onClick={() => navigate(route.id)}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: 999,
                border: 0,
                background: active ? 'rgba(15, 23, 42, 0.08)' : 'transparent',
                color: '#0f172a',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                cursor: route.disabled ? 'not-allowed' : 'pointer',
                opacity: route.disabled ? 0.4 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {route.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, paddingBottom: 96, position: 'relative' }}>
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
            pointerEvents: 'auto',
            flex: '0 1 auto',
            minWidth: 0,
            maxWidth: '100%',
            overflowX: 'auto',
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
                background: '#0f172a',
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
                <span key={dot} aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
              ))}
            </button>
          </div>
          {pinned.length > 0 && <div style={{ width: 1, height: 36, background: '#e2e8f0', flexShrink: 0 }} />}
          {pinned.map((app) => {
            const route = app.routeId ? navigation.routes.find((candidate) => candidate.id === app.routeId) : undefined;
            const disabled = !route || route.disabled;
            return (
              <div key={app.id} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  type="button"
                  aria-label={app.label}
                  title={app.label}
                  disabled={disabled}
                  onClick={route ? () => navigate(route.id) : undefined}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#0f172a',
                    fontFamily: 'inherit',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  {[...app.label][0]?.toUpperCase()}
                </button>
                {app.count !== undefined && (
                  <div style={{ position: 'absolute', top: -6, right: -6 }}>
                    <Chip variant="status" tone="accent">
                      {app.count}
                    </Chip>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {paletteOpen && <CommandPalette commands={commands} onClose={closePalette} />}
    </div>
  );
}
