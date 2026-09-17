import { useCallback, useEffect, useState } from 'react';

/**
 * Mirrors an active route id with `location.hash` — read as the initial value when present,
 * written back on navigate, and re-read on `hashchange` (browser back/forward included). Kept
 * unopinionated about route validity on purpose: it doesn't know a caller's real route list, so
 * a caller that cares whether the hash names a real route validates the returned id itself and
 * falls back to its own default (see `examples/AppShell.tsx`'s own uncontrolled fallback for the
 * pattern). Two real consumers today (ROADMAP item 54/issue #23): `AppShell.tsx`'s own
 * already-uncontrolled `navigation`-omitted mode, and `preview/client.tsx`'s `SamplePreview`
 * (which always supplies its own explicit `navigation`, so it needs this wired in directly rather
 * than inheriting `AppShell`'s fallback).
 *
 * Correction (found while wiring the second consumer, `preview/client.tsx`'s `SamplePreview`):
 * an earlier draft of this comment claimed real route ids always contain a `/`, so they'd never
 * collide with `preview/client.tsx`'s own outer router's reserved standalone hashes (`#login`,
 * `#density-lab`, etc.). That's true for `AppShell.tsx`'s own internal `sampleRoutes()` (module/
 * label slugs like `sales/customers`) but NOT for `preview/client.tsx`'s separate `routes` array,
 * whose ids are plain dashed strings (`purchase-orders`, `finance-overview`, …) with no `/` at
 * all. Checked directly: none of that file's 34 real route ids match any of its 11 reserved
 * hashes today, so there's no live collision — but the real invariant is "these two specific,
 * small, human-maintained lists don't overlap," not a structural `/` guarantee. A future route id
 * that happens to match a reserved hash would silently render the wrong screen (the outer router
 * checks its reserved hashes first); this hook does not defend against that itself.
 */
export function useHashRoute(defaultRouteId: string): [string, (routeId: string) => void] {
  // `docs-site`'s live `AppShell` demo (`/components/appshell`) prerenders this component
  // server-side (Astro SSG), where `window` doesn't exist — found live, not assumed: the build
  // crashed with `ReferenceError: window is not defined` before this guard. The effect body
  // below never runs during SSR either way (React doesn't run effects server-side), so only the
  // state initializer and `navigate` (defensively — a real click can't happen during SSR, but
  // guarding costs nothing) need the check.
  const [routeId, setRouteId] = useState(() => (typeof window === 'undefined' ? defaultRouteId : window.location.hash.slice(1) || defaultRouteId));

  useEffect(() => {
    const onHashChange = () => setRouteId(window.location.hash.slice(1) || defaultRouteId);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [defaultRouteId]);

  const navigate = useCallback((nextRouteId: string) => {
    setRouteId(nextRouteId);
    if (typeof window !== 'undefined' && window.location.hash.slice(1) !== nextRouteId) window.location.hash = nextRouteId;
  }, []);

  return [routeId, navigate];
}
