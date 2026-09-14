import { createRoot } from 'react-dom/client';
import { useCallback, useState, type ReactElement } from 'react';
import { AppShell, type AppShellRoute } from '../examples/AppShell.js';
import { ListReport } from '../examples/ListReport.js';
import { RecordDetail } from '../examples/RecordDetail.js';
import { Dashboard } from '../examples/Dashboard.js';
import { Profile } from '../examples/Profile.js';
import { AdminOverview } from '../examples/AdminOverview.js';
import { Settings } from '../examples/Settings.js';
import { Login } from '../examples/Login.js';
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
] as const satisfies readonly AppShellRoute[];

const panes: Record<(typeof routes)[number]['id'], ReactElement> = {
  'purchase-orders': <ListReport />,
  'sales-order-detail': <RecordDetail />,
  dashboard: <Dashboard />,
  profile: <Profile />,
  'admin-overview': <AdminOverview />,
  settings: <Settings />,
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
// host shows it before Shell ever mounts), so it isn't one of `routes` above.
function currentView() {
  if (window.location.hash === '#density-lab') return <DensityLab />;
  if (window.location.hash === '#login') return <Login />;
  return <SamplePreview />;
}

createRoot(document.getElementById('root')!).render(currentView());
