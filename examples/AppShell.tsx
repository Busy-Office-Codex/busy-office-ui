import { useState, type ReactNode } from 'react';
import { Button, Chip, Text } from '../src/index.js';
import { Shell, validateShellNavigation, SHELL_MAX_ROUTES, SHELL_MAX_ROUTE_ID_LENGTH, SHELL_MAX_ROUTE_LABEL_LENGTH, type ShellCommand, type ShellPinnedApp, type ShellRoute } from '../src/shell/index.js';
import { Launcher } from './Launcher.js';

/**
 * Preview composition of the reusable `Shell` (`@busyoffice/design-system/shell`)
 * with sample modules, pinned apps, commands and the example `Launcher` as the
 * home slot. Mirrors templates/erp-skeleton's "Shell anatomy": command bar,
 * app strip, content, dock, launcher — no sidebar. Commands and counts are
 * sample data; a host supplies real ones through `Shell`'s props.
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

const MODULE_NAMES: readonly AppShellModule[] = ['General', 'Sales', 'Purchase', 'Finance', 'BI', 'Administration', 'Builder', 'Settings'];

const PINNED: readonly { label: string; module: AppShellModule; screen?: string; count?: number }[] = [
  { label: 'My work', module: 'General', screen: 'Role page', count: 12 },
  { label: 'Approvals', module: 'General', screen: 'Approvals', count: 7 },
  { label: 'Inbox', module: 'General', screen: 'Inbox', count: 4 },
  { label: 'Sales', module: 'Sales' },
  { label: 'Purchasing', module: 'Purchase' },
  { label: 'Finance', module: 'Finance' },
];

const SAMPLE_COMMANDS: readonly Omit<ShellCommand, 'onRun'>[] = [
  { id: 'create-sales-order', label: 'Create sales order', group: 'Actions' },
  { id: 'approve-pending', label: 'Approve pending items', group: 'Actions' },
  { id: 'so-1042', label: 'SO-1042 · Northwind Traders', group: 'Records', hint: 'Sales order' },
  { id: 'acme', label: 'Acme Supply Co.', group: 'Records', hint: 'Customer' },
  { id: 'inv-2201', label: 'INV-2201', group: 'Records', hint: 'Invoice' },
];

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

export type AppShellProps = {
  module?: AppShellModule;
  active?: string;
  children?: ReactNode;
  /**
   * Host-controlled navigation. The host owns rendered content and any
   * state-retention policy through `children`; omit it for a self-contained
   * sample built from the module map above.
   */
  navigation?: AppShellNavigation;
};

export const MAX_PREVIEW_ROUTES = SHELL_MAX_ROUTES;
export const MAX_PREVIEW_ROUTE_ID_LENGTH = SHELL_MAX_ROUTE_ID_LENGTH;
export const MAX_PREVIEW_ROUTE_LABEL_LENGTH = SHELL_MAX_ROUTE_LABEL_LENGTH;

/** Shell validation plus the preview's fixed module set. */
export function validateAppShellNavigation({ routes, activeRouteId }: Pick<AppShellNavigation, 'routes' | 'activeRouteId'>): string[] {
  if (!Array.isArray(routes)) return ['Route registry must be an array.'];
  const errors = validateShellNavigation({ routes, activeRouteId });
  for (const route of routes) {
    if (!MODULE_NAMES.includes(route.module)) errors.push(`Unsupported route module: ${String(route.module)}`);
  }
  return errors;
}

function sampleRoutes(): ShellRoute[] {
  return MODULE_NAMES.flatMap((module) => NAV[module].map((label) => ({ id: `${module.toLowerCase()}/${label.toLowerCase().replace(/\s+/g, '-')}`, module, label })));
}

export function AppShell({ module = 'General', active = 'Home', children, navigation }: AppShellProps) {
  const [sampleActiveId, setSampleActiveId] = useState(() => `${module.toLowerCase()}/${active.toLowerCase().replace(/\s+/g, '-')}`);
  const hostErrors = navigation ? validateAppShellNavigation(navigation) : [];
  const routes: readonly ShellRoute[] = navigation ? (hostErrors.length === 0 ? navigation.routes : []) : sampleRoutes();
  const activeRouteId = navigation ? (hostErrors.length === 0 ? navigation.activeRouteId : '') : sampleActiveId;
  const onNavigate = navigation ? navigation.onNavigate : setSampleActiveId;

  const pinned: ShellPinnedApp[] = PINNED.map((app) => ({
    id: app.label,
    label: app.label,
    count: app.count,
    routeId: routes.find((route) => route.module === app.module && (!app.screen || route.label === app.screen))?.id,
  }));

  const commands: ShellCommand[] = [
    ...SAMPLE_COMMANDS.map((command) => ({ ...command, onRun: () => {} })),
    ...routes.map((route) => ({ id: `page:${route.id}`, label: route.label, group: 'Pages', hint: route.module, onRun: () => onNavigate(route.id) })),
  ];

  return (
    <>
      <div style={{ padding: '8px 20px', background: '#f8fafc' }}>
        <Text variant="caption">Preview — sample data; commands, counts and app destinations are not connected.</Text>
      </div>
      <Shell
        navigation={{ routes, activeRouteId, onNavigate }}
        pinned={pinned}
        commands={commands}
        account={
          <>
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
          </>
        }
        home={<Launcher destinations={routes.map(({ id, label }) => ({ id, label }))} onNavigate={onNavigate} />}
      >
        {children ?? <Launcher destinations={routes.map(({ id, label }) => ({ id, label }))} onNavigate={onNavigate} />}
      </Shell>
    </>
  );
}
