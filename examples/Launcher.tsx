import { Button, Card, Chip, Text } from '../src/index.js';

/**
 * The "Home" screen — the app launcher. Mirrors templates/erp-skeleton's
 * "Home (launcher)" screen: a role-picked "For you" row, then an "All apps"
 * grid grouped loosely by department (Finance/BI/Administration render as
 * folder-style icons in the real wireframe). Meant to render as the content
 * inside `AppShell` (module="General" active="Home") — see AppShell.tsx.
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

function AppTile({ label, folder, muted, destination, onNavigate }: { label: string; folder?: boolean; muted?: boolean; destination?: LauncherDestination; onNavigate?: (routeId: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Button type="button" variant="ghost" disabled={muted || Boolean(onNavigate && !destination)} onClick={destination ? () => onNavigate?.(destination.id) : undefined}>{label}</Button>
      {folder && <Text variant="caption">App group</Text>}
    </div>
  );
}

export function Launcher({ destinations, onNavigate }: { destinations?: readonly LauncherDestination[]; onNavigate?: (routeId: string) => void }) {
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

      <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Text variant="overline">All apps</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: '18px 12px' }}>
          {ALL_APPS.map((app) => (
            <AppTile key={app.label} label={app.label} folder={app.folder} muted={app.muted} destination={destinations?.find((route) => route.label === app.label)} onNavigate={onNavigate} />
          ))}
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
