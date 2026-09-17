import { createRoot } from 'react-dom/client';
import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { AppShell, type AppShellRoute } from '../examples/AppShell.js';
import { useHashRoute } from '../examples/useHashRoute.js';
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
import { Finance } from '../examples/Finance.js';
import { BiExplore } from '../examples/BiExplore.js';
import { PasswordReset } from '../examples/PasswordReset.js';
import { AccountLocked } from '../examples/AccountLocked.js';
import { SessionExpired } from '../examples/SessionExpired.js';
import { AccessDenied } from '../examples/AccessDenied.js';
import { NotFound } from '../examples/NotFound.js';
import { DensityLab } from './DensityLab.js';
import { ShellBreadcrumbsLab } from './ShellBreadcrumbsLab.js';
import { ButtonGroupLab } from './ButtonGroupLab.js';
import { AppShellFallbackLab } from './AppShellFallbackLab.js';
import { ChartLab } from './ChartLab.js';
import '../fonts/ibm-plex-sans.css';

// ROADMAP M6 (issue #17): grows one route per landed item, not a bulk switch to AppShell's own
// `sampleRoutes()` (every NAV module/screen at once) — that would give Purchase/Sales/BI real
// app-strip siblings before M6 finishes populating them, changing the single-route-per-module
// premise test/browser/sample-pages-navigation.spec.ts documents and relies on today. Each
// module below gains real siblings only as its own screens actually land.
const SAMPLE_PREVIEW_HOME_ROUTE_ID = 'purchase-orders';
const routes = [
  { id: SAMPLE_PREVIEW_HOME_ROUTE_ID, module: 'Purchase', label: 'Purchase orders' },
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
  // BI explore, still-open issue #16 consumers — raised again to 64 in a later, unrelated batch
  // (docs-site work, issue #21); 40 is this comment's own historical record, not the current cap.
  { id: 'builder-reports', module: 'Builder', label: 'Reports & dashboards' },
  // ROADMAP item 34, "Finance" slice — the module's first real route, closing issue #16's own
  // "17 Finance — cash flow, 12 months" named consumer. Fills the pre-existing NAV.Finance
  // 'Overview' placeholder (M6) the same way Administration's own 'Overview' route did — no
  // AppShell.tsx NAV change needed, and this is what turns the dock's Finance tile from disabled
  // to real (examples/AppShell.tsx's PINNED entry finds this route by module alone).
  { id: 'finance-overview', module: 'Finance', label: 'Overview' },
  // ROADMAP item 34, "BI explore" slice — the last of item 34's 4 remaining consumer slices,
  // closing issue #16's own "20 BI explore" named consumer. Fills the pre-existing NAV.BI
  // 'Explore' placeholder (M6) alongside 'Dashboards'/'Analytics' — no AppShell.tsx NAV change
  // needed. Does NOT add issue #16's own "Pie" ask to Chart's public type union — see
  // BiExplore.tsx's own header comment for why (Objective 1/3, one named consumer only).
  { id: 'bi-explore', module: 'BI', label: 'Explore' },
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
  'finance-overview': <Finance />,
  'bi-explore': <BiExplore />,
};

/** A local sample host for the package's existing pure example compositions. */
function SamplePreview() {
  // ROADMAP item 54/issue #23: real deep-linking/back-forward for this preview host, the same
  // fix AppShell.tsx's own uncontrolled fallback gets — this host always supplies its own
  // explicit `navigation` below, so it needs the same hash-sync wired in directly rather than
  // inheriting AppShell's fallback (it never takes that code path).
  const [hashRouteId, navigateHash] = useHashRoute(SAMPLE_PREVIEW_HOME_ROUTE_ID);
  const activeRouteId = (routes.some((route) => route.id === hashRouteId) ? hashRouteId : SAMPLE_PREVIEW_HOME_ROUTE_ID) as (typeof routes)[number]['id'];
  // Lazy initializer (not a hardcoded `[SAMPLE_PREVIEW_HOME_ROUTE_ID]`) so a deep link straight to
  // a non-default route (`/#sales-order-detail`) has that route's pane mounted from first render.
  const [visitedRouteIds, setVisitedRouteIds] = useState<readonly (typeof routes)[number]['id'][]>(() => [activeRouteId]);
  const navigate = useCallback((routeId: string) => {
    if (!routes.some((route) => route.id === routeId)) return;
    const supportedRouteId = routeId as (typeof routes)[number]['id'];
    navigateHash(supportedRouteId);
    // Updated in the SAME callback as the hash change, not a reactive useEffect a render cycle
    // later — found live, not assumed: the effect version left the newly-active route's pane
    // (and therefore its actual content) missing from the DOM for one extra render, which
    // test/browser/inbox-workspace-layout.spec.ts's own scrollHeight measurement caught as a real
    // difference, not flakiness. `routeId` is already confirmed a real route id by the guard
    // above, so it's exactly what `activeRouteId` will resolve to once this render lands.
    setVisitedRouteIds((visited) => (visited.includes(supportedRouteId) ? visited : [...visited, supportedRouteId]));
  }, [navigateHash]);
  // Safety net for a route reached WITHOUT going through `navigate` above — browser back/forward
  // (fires `hashchange` directly) or a hand-edited URL. A no-op on the common click path (already
  // synchronously covered above), so this doesn't reintroduce the extra-render problem there.
  useEffect(() => {
    setVisitedRouteIds((visited) => (visited.includes(activeRouteId) ? visited : [...visited, activeRouteId]));
  }, [activeRouteId]);
  // Corrects a stale/invalid hash back to the resolved default — same fix and same reasoning as
  // AppShell.tsx's own fallback (found live during review): otherwise the address bar keeps
  // showing a hash that doesn't match what's actually on screen.
  useEffect(() => {
    if (activeRouteId !== hashRouteId) navigateHash(activeRouteId);
  }, [activeRouteId, hashRouteId, navigateHash]);

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
// 10) instead of the sample host — see DensityLab.tsx for why. `#shell-breadcrumbs-lab` is the
// same idea for test/browser/shell-breadcrumbs.spec.ts (ROADMAP item 37, issue #20) — see
// ShellBreadcrumbsLab.tsx for why it, not the sample host, is what exercises Shell's own
// `breadcrumbs` prop. `#button-group-lab` is the same idea again for test/browser/button-group.
// spec.ts's disabled-segment keyboard contract, once wiring real Theme to ControlCenter.tsx's
// Appearance control left that contract with no enabled/disabled ButtonGroup call site anywhere
// in `examples/` — see ButtonGroupLab.tsx. `#chart-lab` is the same idea again for
// test/browser/chart.spec.ts's ROADMAP item 51 (issue #22) coverage — see ChartLab.tsx. `#login`
// mounts the pre-auth
// Login screen standalone (ROADMAP M6, issue #17) — it precedes the shell conceptually (a real
// host shows it before Shell ever mounts), so it isn't one of `routes` above. M7 Slice 8
// (Entry/nav) added the rest of this pre-shell family (password reset, account locked, session
// expired, access denied, 404) — same standalone-mount precedent.
//
// `App` (not a plain `currentView()` function) because these screens link to each other via real
// `<a href="#...">`/`window.location.hash =` navigation now (PasswordReset ↔ Login, etc.) — a
// hash change alone doesn't re-render a React tree with no listener, so this needs to actually
// watch `hashchange` and re-render, not just read `location.hash` once at module load.
//
// ROADMAP item 54/issue #23: the empty-hash default changed from SamplePreview straight to Login
// — the preview previously skipped the one screen a real user actually lands on first, and
// Login's own "Continue" button had no handler at all (dead click) until this same change gave
// it one. Reaching SamplePreview now goes through Login's real navigation, same as any other
// pre-auth screen here.
//
// Disambiguating SamplePreview's own hash-synced routes (ROADMAP item 54) from
// AppShellFallbackLab's (both now write real route ids into `location.hash`, so neither can be
// matched by a fixed literal once you've navigated inside either) uses the one structural
// difference their two id schemes already have: SamplePreview's `routes` above are flat dashed
// strings (`purchase-orders`), AppShell.tsx's own `sampleRoutes()` are `module/label` slugs
// (`general/home`) — checked directly, every id in both real lists confirms this. Relying on an
// implicit shape rather than an explicit namespace prefix is a disclosed simplification for
// dev-only preview tooling, not something to assume holds if either id scheme changes.
function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  // `examples/NotFound.tsx`'s own "Back to workspace" button clears the hash entirely
  // (`location.hash = ''`) to mean "whatever the host's default view is" — host-agnostic on
  // purpose, the same reasoning Login.tsx's `onContinue` prop uses, so it's not preview-specific
  // route naming. Landing on Login only for a TRUE first visit (never showing it again just
  // because the hash happens to go back to empty later, e.g. from that same "Back to workspace"
  // button after a 404) needs distinguishing "empty hash at the very first mount" from "empty
  // hash after already having been somewhere non-empty" — a ref, not the `hash` state itself,
  // since it must survive the hash returning to empty without resetting.
  const hasLeftLandingRef = useRef(window.location.hash !== '');
  useEffect(() => {
    const onHashChange = () => {
      const newHash = window.location.hash;
      if (newHash !== '') hasLeftLandingRef.current = true;
      setHash(newHash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const enterSamplePreview = useCallback(() => {
    window.location.hash = SAMPLE_PREVIEW_HOME_ROUTE_ID;
  }, []);

  if (hash === '') return hasLeftLandingRef.current ? <SamplePreview /> : <Login onContinue={enterSamplePreview} />;
  if (hash === '#login') return <Login onContinue={enterSamplePreview} />;
  if (hash === '#density-lab') return <DensityLab />;
  if (hash === '#shell-breadcrumbs-lab') return <ShellBreadcrumbsLab />;
  if (hash === '#button-group-lab') return <ButtonGroupLab />;
  if (hash === '#app-shell-fallback-lab') return <AppShellFallbackLab />;
  if (hash === '#chart-lab') return <ChartLab />;
  if (hash === '#password-reset') return <PasswordReset />;
  if (hash === '#account-locked') return <AccountLocked />;
  if (hash === '#session-expired') return <SessionExpired />;
  if (hash === '#access-denied') return <AccessDenied />;
  if (hash === '#404') return <NotFound />;
  // Every reserved literal is already handled above, so reaching here means this is either
  // SamplePreview's or AppShellFallbackLab's own internal navigation (see the disambiguation
  // comment above).
  if (hash.slice(1).includes('/')) return <AppShellFallbackLab />;
  return <SamplePreview />;
}

createRoot(document.getElementById('root')!).render(<App />);
