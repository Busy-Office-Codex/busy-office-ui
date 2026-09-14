import { createRoot } from 'react-dom/client';
import { useCallback, useState, type ReactElement } from 'react';
import { AppShell, type AppShellRoute } from '../examples/AppShell.js';
import { ListReport } from '../examples/ListReport.js';
import { RecordDetail } from '../examples/RecordDetail.js';
import { Dashboard } from '../examples/Dashboard.js';
import { DensityLab } from './DensityLab.js';
import '../fonts/ibm-plex-sans.css';

const routes = [
  { id: 'purchase-orders', module: 'Purchase', label: 'Purchase orders' },
  { id: 'sales-order-detail', module: 'Sales', label: 'Sales order' },
  { id: 'dashboard', module: 'BI', label: 'Dashboards' },
] as const satisfies readonly AppShellRoute[];

const panes: Record<(typeof routes)[number]['id'], ReactElement> = {
  'purchase-orders': <ListReport />,
  'sales-order-detail': <RecordDetail />,
  dashboard: <Dashboard />,
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
// 10) instead of the sample host — see DensityLab.tsx for why.
createRoot(document.getElementById('root')!).render(
  window.location.hash === '#density-lab' ? <DensityLab /> : <SamplePreview />,
);
