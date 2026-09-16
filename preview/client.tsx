import { createRoot } from 'react-dom/client';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { AppShell, type AppShellRoute } from '../examples/AppShell.js';
import { ListReport } from '../examples/ListReport.js';
import { RecordDetail } from '../examples/RecordDetail.js';
import { Dashboard } from '../examples/Dashboard.js';
import { Profile } from '../examples/Profile.js';
import { AdminOverview } from '../examples/AdminOverview.js';
import { Settings } from '../examples/Settings.js';
import { Login } from '../examples/Login.js';
import { RolePage } from '../examples/RolePage.js';
import { Inbox } from '../examples/Inbox.js';
import { Notifications } from '../examples/Notifications.js';
import { Help } from '../examples/Help.js';
import { Customers } from '../examples/Customers.js';
import { SalesOrderList } from '../examples/SalesOrderList.js';
import { Delivery } from '../examples/Delivery.js';
import { Invoice } from '../examples/Invoice.js';
import { Approvals } from '../examples/Approvals.js';
import { UsersAndRoles } from '../examples/UsersAndRoles.js';
import { BuilderForms } from '../examples/BuilderForms.js';
import { BuilderWorkflow } from '../examples/BuilderWorkflow.js';
import { Quotations } from '../examples/Quotations.js';
import { Billing } from '../examples/Billing.js';
import { Requisitions } from '../examples/Requisitions.js';
import { Inventory } from '../examples/Inventory.js';
import { Planning } from '../examples/Planning.js';
import { ProductionOrders } from '../examples/ProductionOrders.js';
import { Users } from '../examples/Users.js';
import { Roles } from '../examples/Roles.js';
import { Companies } from '../examples/Companies.js';
import { Integrations } from '../examples/Integrations.js';
import { AuditLog } from '../examples/AuditLog.js';
import { Analytics } from '../examples/Analytics.js';
import { BuilderScreens } from '../examples/BuilderScreens.js';
import { BuilderReports } from '../examples/BuilderReports.js';
import { PasswordReset } from '../examples/PasswordReset.js';
import { AccountLocked } from '../examples/AccountLocked.js';
import { SessionExpired } from '../examples/SessionExpired.js';
import { AccessDenied } from '../examples/AccessDenied.js';
import { NotFound } from '../examples/NotFound.js';
import { DensityLab } from './DensityLab.js';
import '../fonts/ibm-plex-sans.css';

// ROADMAP M6 (issue #17): grows one route per landed item, not a bulk switch to AppShell's own
// `sampleRoutes()` (every NAV module/screen at once) — that would give Purchase/Sales/BI real
// app-strip siblings before M6 finishes populating them, changing the single-route-per-module
// premise test/browser/sample-pages-navigation.spec.ts documents and relies on today. Each
// module below gains real siblings only as its own screens actually land.
const routes = [
  { id: 'purchase-orders', module: 'Purchase', label: 'Purchase orders' },
  { id: 'sales-order-detail', module: 'Sales', label: 'Sales order' },
  { id: 'dashboard', module: 'BI', label: 'Dashboards' },
  { id: 'profile', module: 'General', label: 'Profile' },
  { id: 'admin-overview', module: 'Administration', label: 'Overview' },
  { id: 'settings', module: 'Settings', label: 'General' },
  // Batch 2: General's first real siblings — Profile now has company, so the app strip
  // finally has more than one item to cross between within a module (see
  // test/browser/sample-pages-navigation.spec.ts's comment on this being untested before).
  { id: 'role-page', module: 'General', label: 'Role page' },
  { id: 'inbox', module: 'General', label: 'Inbox' },
  { id: 'notifications', module: 'General', label: 'Notifications' },
  { id: 'help', module: 'General', label: 'Help' },
  // Batch 3: Sales' first real siblings alongside the existing detail route (label 'Sales
  // order', singular — RecordDetail.tsx, kept as-is). 'Sales orders' (plural) is a distinct
  // NAV entry for the list view — see examples/AppShell.tsx's NAV.Sales comment.
  { id: 'customers', module: 'Sales', label: 'Customers' },
  { id: 'sales-order-list', module: 'Sales', label: 'Sales orders' },
  { id: 'delivery', module: 'Sales', label: 'Delivery' },
  { id: 'invoice', module: 'Sales', label: 'Invoice' },
  // Batch 4 (final M6 page-building batch): Administration's first real sibling alongside
  // Overview; Builder's first two routes; Approvals joins General (now 6 routes).
  { id: 'approvals', module: 'General', label: 'Approvals' },
  { id: 'users-and-roles', module: 'Administration', label: 'Users and roles' },
  { id: 'builder-forms', module: 'Builder', label: 'Forms' },
  { id: 'builder-workflow', module: 'Builder', label: 'Workflows' },
  // M7, Slice 1 (Sales-to-billing, ERP reference-app initiative): Sales' first two screens
  // reading from the shared examples/data store instead of a page-local hardcoded array.
  { id: 'quotations', module: 'Sales', label: 'Quotations' },
  { id: 'billing', module: 'Sales', label: 'Billing' },
  // M7, Slice 2 (Procurement-to-stock).
  { id: 'requisitions', module: 'Purchase', label: 'Requisitions' },
  { id: 'inventory', module: 'Purchase', label: 'Inventory' },
  // M7, Slice 3 (Production planning) — Production's first two routes.
  { id: 'planning', module: 'Production', label: 'Planning' },
  { id: 'production-orders', module: 'Production', label: 'Production orders' },
  // M7, Slice 4 (Administration + role-based config) — labels 'Users' and 'Audit log' were
  // already unbuilt NAV.Administration placeholders (M6); no AppShell.tsx NAV change needed.
  { id: 'users', module: 'Administration', label: 'Users' },
  { id: 'audit-log', module: 'Administration', label: 'Audit log' },
  // M7, Slice 5 (Analytics) — BI's second route, alongside the existing Dashboard.
  { id: 'analytics', module: 'BI', label: 'Analytics' },
  // M7, Slice 6 (Builder) — fills the pre-existing NAV.Builder 'Pages' placeholder (M6).
  { id: 'builder-screens', module: 'Builder', label: 'Pages' },
  // M7, Slice 9 (Administration, role management) — fills the pre-existing NAV.Administration
  // 'Roles' placeholder (M6).
  { id: 'roles', module: 'Administration', label: 'Roles' },
  // M7, Slice 12 (Administration — companies & entities, integrations & API) — fills the last two
  // pre-existing NAV.Administration placeholders (M6): 'Companies' and 'Integrations'.
  { id: 'companies', module: 'Administration', label: 'Companies' },
  { id: 'integrations', module: 'Administration', label: 'Integrations' },
  // M7, Slice 13 (Builder — report/dashboard builder) — a NEW NAV.Builder entry, not a
  // pre-existing M6 placeholder (see AppShell.tsx's NAV.Builder comment and BuilderReports.tsx's
  // own header comment). This was the 32nd and, at the time, final entry — SHELL_MAX_ROUTES was a
  // hard cap at exactly 32, raised to 40 (owner-directed, 2026-09-16) for the Finance module and
  // BI explore, still-open issue #16 consumers.
  { id: 'builder-reports', module: 'Builder', label: 'Reports & dashboards' },
] as const satisfies readonly AppShellRoute[];

const panes: Record<(typeof routes)[number]['id'], ReactElement> = {
  'purchase-orders': <ListReport />,
  'sales-order-detail': <RecordDetail />,
  dashboard: <Dashboard />,
  profile: <Profile />,
  'admin-overview': <AdminOverview />,
  settings: <Settings />,
  'role-page': <RolePage />,
  inbox: <Inbox />,
  notifications: <Notifications />,
  help: <Help />,
  customers: <Customers />,
  'sales-order-list': <SalesOrderList />,
  delivery: <Delivery />,
  invoice: <Invoice />,
  approvals: <Approvals />,
  'users-and-roles': <UsersAndRoles />,
  'builder-forms': <BuilderForms />,
  'builder-workflow': <BuilderWorkflow />,
  quotations: <Quotations />,
  billing: <Billing />,
  requisitions: <Requisitions />,
  inventory: <Inventory />,
  planning: <Planning />,
  'production-orders': <ProductionOrders />,
  users: <Users />,
  'audit-log': <AuditLog />,
  analytics: <Analytics />,
  'builder-screens': <BuilderScreens />,
  roles: <Roles />,
  companies: <Companies />,
  integrations: <Integrations />,
  'builder-reports': <BuilderReports />,
};

/** A local sample host for the package's existing pure example compositions. */
function SamplePreview() {
  const [activeRouteId, setActiveRouteId] = useState<(typeof routes)[number]['id']>('purchase-orders');
  const [visitedRouteIds, setVisitedRouteIds] = useState<readonly (typeof routes)[number]['id'][]>(['purchase-orders']);
  const navigate = useCallback((routeId: string) => {
    if (!routes.some((route) => route.id === routeId)) return;
    const supportedRouteId = routeId as (typeof routes)[number]['id'];
    setActiveRouteId(supportedRouteId);
    setVisitedRouteIds((visited) => visited.includes(supportedRouteId) ? visited : [...visited, supportedRouteId]);
  }, []);

  return (
    <AppShell navigation={{ routes, activeRouteId, onNavigate: navigate }}>
      {visitedRouteIds.map((routeId) => (
        <div key={routeId} hidden={routeId !== activeRouteId} aria-hidden={routeId !== activeRouteId} inert={routeId !== activeRouteId}>
          {panes[routeId]}
        </div>
      ))}
    </AppShell>
  );
}

// `#density-lab` mounts a bare, isolated harness for test/browser/density.spec.ts (ROADMAP item
// 10) instead of the sample host — see DensityLab.tsx for why. `#login` mounts the pre-auth
// Login screen standalone (ROADMAP M6, issue #17) — it precedes the shell conceptually (a real
// host shows it before Shell ever mounts), so it isn't one of `routes` above. M7 Slice 8
// (Entry/nav) added the rest of this pre-shell family (password reset, account locked, session
// expired, access denied, 404) — same standalone-mount precedent.
//
// `App` (not a plain `currentView()` function) because these screens link to each other via real
// `<a href="#...">`/`window.location.hash =` navigation now (PasswordReset ↔ Login, etc.) — a
// hash change alone doesn't re-render a React tree with no listener, so this needs to actually
// watch `hashchange` and re-render, not just read `location.hash` once at module load.
function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (hash === '#density-lab') return <DensityLab />;
  if (hash === '#login') return <Login />;
  if (hash === '#password-reset') return <PasswordReset />;
  if (hash === '#account-locked') return <AccountLocked />;
  if (hash === '#session-expired') return <SessionExpired />;
  if (hash === '#access-denied') return <AccessDenied />;
  if (hash === '#404') return <NotFound />;
  return <SamplePreview />;
}

createRoot(document.getElementById('root')!).render(<App />);
