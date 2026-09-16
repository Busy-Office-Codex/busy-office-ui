import * as stylex from '@stylexjs/stylex';
import { useState, type ReactNode } from 'react';
import { Density, Icon, Theme } from '../src/index.js';
import { Shell, validateShellNavigation, SHELL_MAX_ROUTES, SHELL_MAX_ROUTE_ID_LENGTH, SHELL_MAX_ROUTE_LABEL_LENGTH, type ShellCommand, type ShellPinnedApp, type ShellRoute } from '../src/shell/index.js';
import { color } from '../src/tokens.stylex.js';
import { ControlCenterButton, type Appearance, type ControlCenterDensity } from './ControlCenter.js';
import { Launcher } from './Launcher.js';

// Only interactive element in this file that needs hover/active/focus-visible pseudo-classes —
// everything else here is plain inline styles (no other element in this preview host needs a
// CSS state a plain `style` object can't express). A single small `stylex.create` block, scoped
// to just this button, is simpler and lower-risk than reinventing pseudo-class support with
// manual mouse/focus event handlers + local state.
const notificationButtonStyles = stylex.create({
  button: {
    position: 'relative',
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 8,
    borderStyle: 'solid',
    borderWidth: '1px',
    // Confirmed finding: this button had identical rest/hover/active styling (no feedback) next
    // to "+ New", which does. `:hover` background and `:active` border per the finding's minimum;
    // `borderColor`'s resting value was the raw literal '#e2e8f0', which is `color.border`'s exact
    // value (ROADMAP item 13's raw-values audit) — using the token here instead since this block
    // is already being authored fresh.
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
    // Same shared focus-ring treatment as every other focusable control in this repo (see
    // Button/Input/Dropdown/Chip in src/components/): 2px color.focusRing outline, 2px offset,
    // only on :focus-visible.
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

/**
 * Preview composition of the reusable `Shell` (`@busyoffice/design-system/shell`)
 * with sample modules, pinned apps, commands and the example `Launcher` as the
 * home slot. Mirrors templates/erp-skeleton's "Shell anatomy": command bar,
 * app strip, content, dock, launcher — no sidebar. Commands and counts are
 * sample data; a host supplies real ones through `Shell`'s props.
 */

export type AppShellModule = 'General' | 'Sales' | 'Purchase' | 'Production' | 'Finance' | 'BI' | 'Administration' | 'Builder' | 'Settings';

const NAV: Record<AppShellModule, string[]> = {
  General: ['Home', 'Role page', 'Inbox', 'Approvals', 'Notifications', 'Profile', 'Help'],
  // ROADMAP M6 (issue #17, batch 3): 'Sales order' (singular) was already the detail-view route
  // (RecordDetail.tsx) before this milestone touched Sales — kept exactly as-is (test/browser/
  // sample-pages-navigation.spec.ts and others target it by exact label). The list-view screen
  // (item 24) needed its own distinct label rather than overloading the same one; 'Sales orders'
  // (plural) added as a new sibling entry, not a rename.
  // 'Quotations'/'Billing' added M7, Slice 1 (Sales-to-billing) — purely additive, same as every
  // earlier NAV.Sales expansion this file's own comments already document.
  Sales: ['Customers', 'Quotations', 'Sales orders', 'Sales order', 'Delivery', 'Billing', 'Invoice', 'Returns'],
  // 'Requisitions' added M7, Slice 2 (Procurement-to-stock) — purely additive. 'Inventory' was
  // already an unbuilt placeholder entry here (M6); its route now exists.
  Purchase: ['Requisitions', 'Purchase orders', 'Suppliers', 'Inventory', 'Approvals', 'Receiving'],
  // M7, Slice 3 (Production planning) — this ERP reference-app's 3rd transaction family and
  // first new top-level module since M6. 'Planning' covers demand + recommendations
  // (Planning.tsx); 'Production orders' covers the planned-order → production-order →
  // schedule chain (ProductionOrders.tsx). Kept as its own module rather than folded under
  // Purchase (which already covers procurement's own separate demand signal, requisitions)
  // since production planning is materials/manufacturing, a distinct ERP transaction family
  // per the brief's own list (Procurement, Inventory, Sales, Distribution, Billing,
  // Production planning).
  Production: ['Planning', 'Production orders'],
  Finance: ['Overview', 'Ledger', 'Receivables', 'Payables', 'Reports'],
  // 'Analytics' added M7, Slice 5 — purely additive alongside the existing 'Dashboards' (M6,
  // the company-wide Dashboard.tsx). 'Explore'/'Datasets'/'Schedules' stay unbuilt placeholders.
  BI: ['Dashboards', 'Analytics', 'Explore', 'Datasets', 'Schedules'],
  // ROADMAP M6 (issue #17, batch 4): the reference's "22 · Users and roles" screen is one
  // unified two-pane role editor covering both concepts together, not two separate screens —
  // rather than force it onto just 'Users' or just 'Roles' (leaving the other stranded, or
  // pretending they're independent when the reference treats them as one), added as its own
  // distinct entry. 'Users' and 'Audit log' gained their own real routes in M7 Slice 4
  // (Administration + role-based config); 'Roles' gained its own in Slice 9; 'Companies' and
  // 'Integrations' gained theirs in Slice 12 — the last of this module's M6-era placeholders.
  Administration: ['Overview', 'Users and roles', 'Users', 'Roles', 'Companies', 'Integrations', 'Audit log'],
  // 'Reports & dashboards' added M7, Slice 13 — a NEW entry, not a pre-existing M6 placeholder:
  // neither 'Fields' nor 'Publish' fits a report/dashboard designer (see BuilderReports.tsx's own
  // header comment). This was preview/client.tsx's 32nd and, at the time, final route —
  // SHELL_MAX_ROUTES was a hard cap at exactly 32; raised to 40 (owner-directed, 2026-09-16) to
  // make room for the Finance module and BI explore, still-open issue #16 consumers.
  Builder: ['Pages', 'Forms', 'Workflows', 'Fields', 'Publish', 'Reports & dashboards'],
  Settings: ['General', 'Organization', 'Numbering', 'Tax', 'Email', 'Security'],
};

const MODULE_NAMES: readonly AppShellModule[] = ['General', 'Sales', 'Purchase', 'Production', 'Finance', 'BI', 'Administration', 'Builder', 'Settings'];

const PINNED: readonly { label: string; module: AppShellModule; screen?: string; count?: number }[] = [
  { label: 'My work', module: 'General', screen: 'Role page', count: 12 },
  { label: 'Approvals', module: 'General', screen: 'Approvals', count: 7 },
  { label: 'Inbox', module: 'General', screen: 'Inbox', count: 4 },
  { label: 'Sales', module: 'Sales' },
  { label: 'Purchasing', module: 'Purchase' },
  { label: 'Finance', module: 'Finance' },
  // `screen` deliberately doesn't exist in `NAV.General` — this pinned app's `routeId` resolves
  // to `undefined` below, so its dock tile renders `disabled` (same mechanism as any host's
  // stale/permission-revoked pinned app). A disabled-tile-with-a-count case already existed in
  // this sample data (the `My work`/`Approvals`/`Inbox` tiles above are disabled too, since
  // `preview/client.tsx`'s 3-route registry has no `General`-module routes for any of them) —
  // this entry exists to give ROADMAP item 13's badge-dims-with-disabled-tile browser test a
  // dedicated, self-explanatory target instead of relying on that incidental side effect.
  { label: 'Archived', module: 'General', screen: 'Archived reports', count: 3 },
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
  // Control center (owner-directed, 2026-09-15): drives the whole app's ambient Density tier —
  // see examples/ControlCenter.tsx's file header for the full rationale.
  const [density, setDensity] = useState<ControlCenterDensity>('comfortable');
  // Appearance (ROADMAP item 36's own disclosed follow-up, issue #19): drives the real `Theme`
  // component the same way `density` drives `Density` above — see examples/ControlCenter.tsx's
  // file header. `'system'` is not a `Theme` value (Theme.tsx's own doc comment explains why:
  // omitting the wrapper already is "system", since every `color.*` token's own `@media
  // (prefers-color-scheme: dark)` default already follows the OS/browser setting for free), so
  // `themed()` below renders no `Theme` wrapper at all for that case rather than passing it through.
  const [appearance, setAppearance] = useState<Appearance>('light');
  const themed = (node: ReactNode): ReactNode => (appearance === 'system' ? node : <Theme value={appearance}>{node}</Theme>);
  const settingsRoute = routes.find((route) => route.module === 'Settings');

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
    <Shell
      navigation={{ routes, activeRouteId, onNavigate }}
      pinned={pinned}
      commands={commands}
      brand={
        <>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: color.textPrimary, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>Busy Office</span>
          <span style={{ fontSize: 12, color: color.textTertiary, whiteSpace: 'nowrap' }}>Acme Co ▾</span>
        </>
      }
      // Owner-directed removal (2026-09-15): a global "+ New" sitting next to Notifications
      // read as confusing, not convenient, once weighed against how many modules this ERP
      // actually has — "new WHAT?" has no good context-free answer here, and this design
      // system already has two better-scoped ways to create a record: the command palette's
      // own "Actions" category (`commands`, e.g. "Create sales order" — see docs/Shell.md's
      // own example) for cross-module quick-create, and every list page's own contextual
      // "+ New PO"/"+ New SO" button (ListReport.tsx etc.) for the common case of creating
      // the thing you're already looking at. A third, global, unscoped "+ New" duplicated both
      // without being as good as either — removed rather than kept as a decorative redundancy.
      account={
        <>
          <ControlCenterButton
            density={density}
            onDensityChange={setDensity}
            appearance={appearance}
            onAppearanceChange={setAppearance}
            onOpenSettings={settingsRoute ? () => onNavigate(settingsRoute.id) : undefined}
          />
          <button
            type="button"
            aria-label="Notifications, 3 unread"
            title="Notifications"
            {...stylex.props(notificationButtonStyles.button)}
          >
            {/* Real `Icon` (ROADMAP issue #18) — was a plain filled square stand-in; decorative
                here since this button's own `aria-label`/`title` already carry the accessible
                name. */}
            <Icon name="bell" color={color.textPrimary} />
            <span aria-hidden="true" style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: color.accent, border: `1.5px solid ${color.bgSurface}` }} />
          </button>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: color.border, flexShrink: 0 }} />
        </>
      }
      // `Shell` renders `home` separately from `children` (only one of the two is ever visible
      // at once, but both need their own `Density`/`Theme` wrap — `Shell` doesn't merge them into
      // one subtree), so the Control Center's Density and Appearance selections both reach the
      // launcher/home view too, not just whichever page `children` currently holds.
      home={themed(
        <Density value={density}>
          <Launcher destinations={routes.map(({ id, label }) => ({ id, label }))} onNavigate={onNavigate} />
        </Density>,
      )}
    >
      {themed(<Density value={density}>{children ?? <Launcher destinations={routes.map(({ id, label }) => ({ id, label }))} onNavigate={onNavigate} />}</Density>)}
    </Shell>
  );
}
