import { useState } from 'react';
import { Shell, type ShellRoute } from '../src/shell/index.js';

const routes: ShellRoute[] = [{ id: 'home', module: 'General', label: 'Home' }];

/**
 * A dedicated preview route (`/#shell-breadcrumbs-lab`, see client.tsx) for
 * `test/browser/shell-breadcrumbs.spec.ts` (ROADMAP item 37, issue #20 — agreed, project owner,
 * 2026-09-16). Same reasoning as `DensityLab.tsx`'s own header comment: this is the one place in
 * the preview app that actually passes a real `breadcrumbs` prop into a real `<Shell>` — neither
 * `AppShell.tsx` nor either of the feature's two named example consumers (`RecordDetail.tsx`,
 * `Requisitions.tsx`) do, since neither owns a `Shell` instance of its own (see
 * `examples/breadcrumbTrail.tsx`'s header comment for why) — so this harness is what actually
 * exercises `Shell.tsx`'s own `ShellBreadcrumbTrail` render path end to end in a real browser.
 * Not part of the package's public example set (`examples/`) and not wired into `package.json`'s
 * `exports`, same as `DensityLab.tsx`.
 */
export function ShellBreadcrumbsLab() {
  const [activeRouteId, setActiveRouteId] = useState('home');
  const [clicks, setClicks] = useState(0);

  return (
    <Shell
      navigation={{ routes, activeRouteId, onNavigate: setActiveRouteId }}
      breadcrumbs={[
        { label: 'Sales orders', onClick: () => setClicks((count) => count + 1) },
        { label: 'SO-1042' },
      ]}
    >
      <div style={{ padding: 24 }}>
        <p>Clicks: {clicks}</p>
      </div>
    </Shell>
  );
}
