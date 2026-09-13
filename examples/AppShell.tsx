import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Chip, Input, Text } from '../src/index.js';
import { Launcher, type LauncherDestination } from './Launcher.js';

/**
 * The persistent shell chrome — mirrors templates/erp-skeleton's "Shell
 * anatomy" screen and the real, reusable templates/erp-skeleton/Shell.dc.html
 * template (this ERP has no sidebar). Five real pieces, per that wireframe's
 * own annotations:
 *
 * 1. Command bar — ⌘K opens a full search/command palette (real overlay
 *    here): displays sample commands and records; execution is not wired.
 *    Also a global "+ New", notifications, and account.
 * 2. App strip — the CURRENT MODULE's sibling screens (e.g. for module
 *    "Sales": Customers · Sales order · Delivery · Invoice · Returns), not
 *    top-level app names. One click between them.
 * 3. Content — whatever page mounts below the shell (`children`).
 * 4. Dock — floating over content on every page: a Launcher tile, pinned
 *    apps with sample counts, and recent records.
 * 5. Launcher — clicking the dock's Launcher tile shows Home (the real
 *    `Launcher` composition): role-picked apps first, all apps below.
 */

export type AppShellModule = 'General' | 'Sales' | 'Purchase' | 'Finance' | 'BI' | 'Administration' | 'Builder' | 'Settings';

const NAV: Record<AppShellModule, string[]> = {
  General: ['Home', 'Role page', 'Inbox', 'Approvals', 'Notifications', 'Profile', 'Help'],
  Sales: ['Customers', 'Sales order', 'Delivery', 'Invoice', 'Returns'],
  Purchase: ['Purchase orders', 'Suppliers', 'Inventory', 'Approvals', 'Receiving'],
  Finance: ['Overview', 'Ledger', 'Receivables', 'Payables', 'Reports'],
  BI: ['Dashboards', 'Explore', 'Datasets', 'Schedules'],
  Administration: ['Overview', 'Users', 'Roles', 'Companies', 'Integrations', 'Audit log'],
  Builder: ['Pages', 'Forms', 'Workflows', 'Fields', 'Publish'],
  Settings: ['General', 'Organization', 'Numbering', 'Tax', 'Email', 'Security'],
};

const PINNED = [
  { label: 'My work', count: '12' },
  { label: 'Approvals', count: '7' },
  { label: 'Inbox', count: '4' },
  { label: 'Sales', count: null },
  { label: 'Purchasing', count: null },
  { label: 'Finance', count: null },
];

const PALETTE_CATEGORIES = ['All', 'Orders', 'Customers', 'Invoices', 'Actions', 'Pages'];
const PALETTE_ACTIONS = ['Create sales order', 'Approve pending items'];
const PALETTE_RECORDS = [
  { title: 'SO-1042 · Northwind Traders', type: 'Sales order' },
  { title: 'Acme Supply Co.', type: 'Customer' },
  { title: 'INV-2201', type: 'Invoice' },
];

function NavItem({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return <Button type="button" variant={active ? 'secondary' : 'ghost'} aria-current={active ? 'page' : undefined} disabled={disabled} onClick={onClick}>{children}</Button>;
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  return (
    <div
      onClick={onClose}
      data-testid="command-palette-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.32)',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 120,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
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
        }}
      >
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Search records, run actions, jump to pages…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
          </div>
          <span style={{ font: '11px ui-monospace, monospace', border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 5px', color: '#64748b' }}>
            esc
          </span>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Close command palette">
            Close
          </Button>
        </div>
        <div style={{ padding: '8px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PALETTE_CATEGORIES.map((cat) => (
            <Chip key={cat} variant="filter" selected={cat === category} onClick={() => setCategory(cat)}>
              {cat}
            </Chip>
          ))}
        </div>
        <div style={{ overflow: 'auto', flex: 1, paddingBottom: 8 }}>
          <div style={{ padding: '6px 20px' }}>
            <Text variant="overline">Actions</Text>
          </div>
          {PALETTE_ACTIONS.map((action, i) => (
            <div key={action} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px', background: i === 0 ? '#f8fafc' : undefined }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: '#e2e8f0', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Text variant="body">{action}</Text>
              </div>
              {i === 0 && <span style={{ font: '11px ui-monospace, monospace', color: '#64748b' }}>↵</span>}
            </div>
          ))}
          <div style={{ padding: '6px 20px' }}>
            <Text variant="overline">Records</Text>
          </div>
          {PALETTE_RECORDS.map((record) => (
            <div key={record.title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px' }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: '#e2e8f0', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Text variant="body">{record.title}</Text>
              </div>
              <Text variant="caption">{record.type}</Text>
            </div>
          ))}
        </div>
        <div style={{ height: 40, borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0 }}>
          <Text variant="caption">↑↓ navigate</Text>
          <Text variant="caption">↵ open</Text>
          <Text variant="caption">⌘↵ new tab</Text>
          <Text variant="caption">tab filter</Text>
        </div>
      </div>
    </div>
  );
}

export type AppShellProps = {
  module?: AppShellModule;
  active?: string;
  children?: ReactNode;
  /**
   * Preview-only, host-controlled navigation metadata. The host owns rendered
   * content and any state-retention policy through `children`.
   */
  navigation?: AppShellNavigation;
};

export type AppShellRoute = {
  id: string;
  module: AppShellModule;
  label: string;
};

export type AppShellNavigation = {
  routes: readonly AppShellRoute[];
  activeRouteId: string;
  onNavigate: (routeId: string) => void;
};

export const MAX_PREVIEW_ROUTES = 32;
export const MAX_PREVIEW_ROUTE_ID_LENGTH = 64;
export const MAX_PREVIEW_ROUTE_LABEL_LENGTH = 80;

const MODULE_NAMES: readonly AppShellModule[] = ['General', 'Sales', 'Purchase', 'Finance', 'BI', 'Administration', 'Builder', 'Settings'];

/** Pure validation for hosts that build preview route lists dynamically. */
export function validateAppShellNavigation({ routes, activeRouteId }: Pick<AppShellNavigation, 'routes' | 'activeRouteId'>): string[] {
  const errors: string[] = [];
  if (!Array.isArray(routes)) return ['Route registry must be an array.'];
  if (routes.length > MAX_PREVIEW_ROUTES) errors.push(`Route registry exceeds ${MAX_PREVIEW_ROUTES} entries.`);
  const ids = new Set<string>();
  const screens = new Set<string>();
  for (const route of routes) {
    if (typeof route.id !== 'string' || !route.id.trim()) errors.push('Route ids must not be empty.');
    else if (route.id.length > MAX_PREVIEW_ROUTE_ID_LENGTH) errors.push(`Route id exceeds ${MAX_PREVIEW_ROUTE_ID_LENGTH} characters: ${route.id}`);
    else if (ids.has(route.id)) errors.push(`Duplicate route id: ${route.id}`);
    if (typeof route.label !== 'string' || !route.label.trim()) errors.push('Route labels must not be empty.');
    else if (route.label.length > MAX_PREVIEW_ROUTE_LABEL_LENGTH) errors.push(`Route label exceeds ${MAX_PREVIEW_ROUTE_LABEL_LENGTH} characters: ${route.label}`);
    if (!MODULE_NAMES.includes(route.module)) errors.push(`Unsupported route module: ${String(route.module)}`);
    else if (typeof route.label === 'string' && screens.has(`${route.module}:${route.label}`)) errors.push(`Duplicate route screen: ${route.module}/${route.label}`);
    if (typeof route.id === 'string') ids.add(route.id);
    if (MODULE_NAMES.includes(route.module) && typeof route.label === 'string') screens.add(`${route.module}:${route.label}`);
  }
  if (!ids.has(activeRouteId)) errors.push(`Unknown active route id: ${activeRouteId}`);
  return errors;
}

const PINNED_MODULES: Record<string, AppShellModule | undefined> = {
  Sales: 'Sales',
  Purchasing: 'Purchase',
  Finance: 'Finance',
};

function canRestoreFocus(element: HTMLElement): boolean {
  if (!element.isConnected || element.matches(':disabled, [hidden], [inert], [aria-hidden="true"]')) return false;
  if (element.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
  const style = window.getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && element.getClientRects().length > 0;
}

export function AppShell({ module = 'General', active = 'Home', children, navigation }: AppShellProps) {
  const [currentModule] = useState(module);
  const [currentActive, setCurrentActive] = useState(active);
  const [showLauncher, setShowLauncher] = useState(!navigation && active === 'Home' && !children);
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

  const navigationErrors = navigation ? validateAppShellNavigation(navigation) : [];
  const previewNavigation = navigation && navigationErrors.length === 0 ? navigation : undefined;
  const invalidPreviewNavigation = Boolean(navigation && !previewNavigation);
  const activeRoute = previewNavigation?.routes.find((route) => route.id === previewNavigation.activeRouteId);
  const visibleModule = activeRoute?.module ?? currentModule;
  const visibleActive = activeRoute?.label ?? currentActive;
  const items = invalidPreviewNavigation ? [] : NAV[visibleModule];
  const launcherDestinations: LauncherDestination[] = previewNavigation?.routes.map(({ id, label }) => ({ id, label })) ?? [];
  const selectLauncherDestination = (routeId: string) => {
    previewNavigation?.onNavigate(routeId);
    setShowLauncher(false);
  };

  return (
    <div
      style={{
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '8px 20px' }}>
        <Text variant="caption">Preview — sample data; commands, counts and app destinations are not connected.</Text>
      </div>
      {/* 1. Command bar */}
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
        <div style={{ width: 26, height: 26, borderRadius: 7, background: '#0f172a', flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>Busy Office</span>
        <span style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>Acme Co ▾</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 420, maxWidth: '40vw' }}>
          <Button type="button" variant="secondary" onClick={(event) => openPalette(event.currentTarget)} aria-label="Open command palette" style={{ width: '100%', justifyContent: 'space-between' }}>
            Search commands
          </Button>
          <span
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              font: '11px ui-monospace, monospace',
              border: '1px solid #e2e8f0',
              borderRadius: 4,
              padding: '1px 5px',
              color: '#64748b',
              background: '#fff',
              pointerEvents: 'none',
            }}
          >
            ⌘K
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <Button variant="primary">+ New ▾</Button>
        <div style={{ position: 'relative' }}>
          <Button variant="ghost">🔔</Button>
          <div style={{ position: 'absolute', top: -6, right: -6 }}>
            <Chip variant="status" tone="accent">
              3
            </Chip>
          </div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: '#e2e8f0', flexShrink: 0 }} />
      </div>

      {/* 2. App strip */}
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
          <Text variant="overline">{invalidPreviewNavigation ? 'Preview unavailable' : visibleModule}</Text>
        </div>
        {items.map((item) => (
          <NavItem
            key={item}
            active={item === visibleActive && !showLauncher}
            disabled={Boolean(navigation && !previewNavigation?.routes.some((route) => route.module === visibleModule && route.label === item))}
            onClick={() => {
              const route = previewNavigation?.routes.find((candidate) => candidate.module === visibleModule && candidate.label === item);
              if (route) {
                previewNavigation?.onNavigate(route.id);
                setShowLauncher(false);
                return;
              }
              setCurrentActive(item);
              setShowLauncher(false);
            }}
          >
            {item}
          </NavItem>
        ))}
        <div style={{ flex: 1 }} />
        <Text variant="caption">☆ Pin to dock</Text>
      </div>

      {/* 3. Content */}
      <div style={{ flex: 1, paddingBottom: 96, position: 'relative' }}>
        {invalidPreviewNavigation ? (
          <div role="status" style={{ padding: 32 }}>
            <Text variant="heading">Preview navigation is unavailable</Text>
            <Text variant="body">The supplied route registry is invalid, so no preview page was selected.</Text>
          </div>
        ) : (
          <>
            <div hidden={showLauncher} aria-hidden={showLauncher} inert={showLauncher}>{children}</div>
            {showLauncher && <Launcher destinations={launcherDestinations} onNavigate={selectLauncherDestination} />}
          </>
        )}
      </div>

      {/* 4. Dock — floats over content on every page */}
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
            <Button type="button" variant="primary" disabled={invalidPreviewNavigation} onClick={() => setShowLauncher(true)} aria-label="Open launcher">Launcher</Button>
          </div>
          <div style={{ width: 1, height: 36, background: '#e2e8f0', flexShrink: 0 }} />
          {PINNED.map((app) => {
            const route = previewNavigation?.routes.find((candidate) => candidate.module === PINNED_MODULES[app.label]);
            return (
            <div key={app.label} style={{ position: 'relative', flexShrink: 0 }}>
              <Button type="button" variant="ghost" aria-label={app.label} title={app.label} disabled={Boolean(navigation && !route)} onClick={route ? () => {
                previewNavigation?.onNavigate(route.id);
                setShowLauncher(false);
              } : undefined}>{app.label}</Button>
              {app.count && (
                <div style={{ position: 'absolute', top: -6, right: -6 }}>
                  <Chip variant="status" tone="accent">
                    {app.count}
                  </Chip>
                </div>
              )}
            </div>
            );
          })}
          <div style={{ width: 1, height: 36, background: '#e2e8f0', flexShrink: 0 }} />
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', flexShrink: 0 }} />
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', flexShrink: 0 }} />
        </div>
      </div>

      {/* 1 (cont.) Command palette overlay, opened via the search bar or ⌘K */}
      {paletteOpen && <CommandPalette onClose={closePalette} />}
    </div>
  );
}
