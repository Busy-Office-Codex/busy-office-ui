import { Button, Card, Chip, Text } from '../src/index.js';
import { appActions, appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';

/**
 * The "Home" screen — the app launcher. Mirrors templates/erp-skeleton's
 * "Home (launcher)" screen: a role-picked "For you" row, then an "All apps"
 * grid grouped loosely by department (Finance/BI/Administration render as
 * folder-style icons in the real wireframe). Meant to render as the content
 * inside `AppShell` (module="General" active="Home") — see AppShell.tsx.
 *
 * "Recent activity" (ROADMAP M7's ERP reference-app initiative, Slice 11, Entry/nav) is this
 * file's first connection to the shared `examples/data` store — genuine, not a same-named
 * coincidence: it reads the exact `state.activity` log every slice since Slice 1 already writes
 * to (the same one AuditLog.tsx reads), rather than a separate "recently viewed" log this app
 * would need to newly instrument on every single screen's row-click just to populate. "For you"/
 * "All apps" above stay the static M6 sample they already were — a role-scoped landing view isn't
 * something a single seeded "Sales manager" persona can honestly demonstrate live.
 *
 * "Favorites" (Slice 14) is a genuinely different kind of connection from "Recent": there is no
 * existing fact anywhere in this store meaning "the user already starred this" the way `activity`
 * already existed for "recent" — `state.favoriteRouteIds` starts empty and this screen is the
 * only reader/writer today (`appActions.toggleFavorite`, wired to each "All apps" tile that has a
 * real, individually-navigable destination — folder tiles like Finance/BI/Administration and
 * muted placeholders aren't favoritable, since neither is a single real destination worth
 * pinning). It still lives in the shared store rather than local state: `Shell.tsx` genuinely
 * unmounts this component every time the user navigates away from Home (a real conditional, not
 * `hidden`/`inert`), so page-local state would lose every starred app on the next navigation — see
 * `appActions.toggleFavorite`'s own comment. A first-time visitor sees this section's own honest
 * empty state, not a silently-hidden feature or an invented pre-favorited entry.
 */

const FOR_YOU = [
  { label: 'My work', detail: '12 items · 2 overdue', count: '12' },
  { label: 'Approvals', detail: '7 waiting on you', count: '7' },
  { label: 'Inbox', detail: '4 unread', count: '4' },
  { label: 'Sales dashboard', detail: 'Revenue MTD · target', count: null },
];

const ALL_APPS = [
  { label: 'Customers' },
  { label: 'Sales orders' },
  { label: 'Deliveries' },
  { label: 'Invoices' },
  { label: 'Purchase orders' },
  { label: 'Inventory' },
  { label: 'Suppliers' },
  { label: 'Finance', folder: true },
  { label: 'Reports' },
  { label: 'BI', folder: true },
  { label: 'Notifications' },
  { label: 'Help' },
  { label: 'Administration', folder: true, muted: true },
  { label: 'Builder', muted: true },
  { label: 'Settings', muted: true },
];

export type LauncherDestination = { id: string; label: string };

function AppTile({
  label,
  folder,
  muted,
  destination,
  onNavigate,
  favorited,
  onToggleFavorite,
}: {
  label: string;
  folder?: boolean;
  muted?: boolean;
  destination?: LauncherDestination;
  onNavigate?: (routeId: string) => void;
  favorited?: boolean;
  onToggleFavorite?: () => void;
}) {
  // Only a real, individually-navigable destination is favoritable — a folder tile (Finance/BI/
  // Administration) represents a whole module, not one destination to pin, and a muted/unbuilt
  // placeholder has nothing real to navigate to yet.
  const canFavorite = Boolean(destination) && !folder && !muted;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {canFavorite && (
          <button
            type="button"
            aria-pressed={favorited}
            aria-label={`${favorited ? 'Remove' : 'Add'} ${label} ${favorited ? 'from' : 'to'} Favorites`}
            onClick={onToggleFavorite}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, fontSize: 16, lineHeight: 1, color: favorited ? '#f59e0b' : '#94a3b8' }}
          >
            {favorited ? '★' : '☆'}
          </button>
        )}
        <Button type="button" variant="ghost" disabled={muted || Boolean(onNavigate && !destination)} onClick={destination ? () => onNavigate?.(destination.id) : undefined}>
          {label}
        </Button>
      </div>
      {folder && <Text variant="caption">App group</Text>}
    </div>
  );
}

export function Launcher({ destinations, onNavigate }: { destinations?: readonly LauncherDestination[]; onNavigate?: (routeId: string) => void }) {
  const activity = useStoreState(appStore, (state) => state.activity);
  const recentActivity = activity.slice(-5).reverse();

  const favoriteRouteIds = useStoreState(appStore, (state) => state.favoriteRouteIds);
  const favoriteDestinations = destinations?.filter((destination) => favoriteRouteIds.includes(destination.id)) ?? [];

  return (
    <div
      style={{
        background: '#f8fafc',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 48px 100px',
        gap: 24,
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Text variant="overline">For you · Sales manager</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {FOR_YOU.map((tile) => (
            <Card key={tile.label}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: '#0f172a' }} />
                <Text variant="title">{tile.label}</Text>
                <Text variant="caption">{tile.detail}</Text>
                {tile.count && (
                  <div style={{ position: 'absolute', top: -4, right: -4 }}>
                    <Chip variant="status" tone="accent">
                      {tile.count}
                    </Chip>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div role="region" aria-label="Favorites" style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Text variant="overline">Favorites</Text>
        {favoriteDestinations.length === 0 ? (
          <Card>
            <Text variant="caption">Star an app below to pin it here.</Text>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: '18px 12px' }}>
            {favoriteDestinations.map((destination) => (
              <AppTile
                key={destination.id}
                label={destination.label}
                destination={destination}
                onNavigate={onNavigate}
                favorited
                onToggleFavorite={() => appActions.toggleFavorite(destination.id)}
              />
            ))}
          </div>
        )}
      </div>

      {recentActivity.length > 0 && (
        <div role="region" aria-label="Recent activity" style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Text variant="overline">Recent activity</Text>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentActivity.map((entry) => (
                <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <Text variant="body">{entry.message}</Text>
                  <Text variant="caption">{entry.at}</Text>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div role="region" aria-label="All apps" style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Text variant="overline">All apps</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: '18px 12px' }}>
          {ALL_APPS.map((app) => {
            const destination = destinations?.find((route) => route.label === app.label);
            return (
              <AppTile
                key={app.label}
                label={app.label}
                folder={app.folder}
                muted={app.muted}
                destination={destination}
                onNavigate={onNavigate}
                favorited={destination ? favoriteRouteIds.includes(destination.id) : false}
                onToggleFavorite={destination ? () => appActions.toggleFavorite(destination.id) : undefined}
              />
            );
          })}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                border: '1px dashed #94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}
            >
              +
            </div>
            Add app
          </div>
        </div>
      </div>
    </div>
  );
}
