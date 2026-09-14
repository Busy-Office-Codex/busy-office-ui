import { Card, Chip, Text } from '../src/index.js';

/**
 * The Administration "Overview" screen — a card-grid settings hub. Mirrors
 * `templates/erp-skeleton`'s "21 · Administration — overview" screen: a
 * plan/account summary line, a grid of named admin-area cards, and a
 * system-health / recent-activity panel below it. Meant to render as
 * `AppShell`'s content when module="Administration" route="Overview" is
 * active (see AppShell.tsx's `NAV.Administration`).
 */

type AdminArea = { label: string; description: string };

// The reference doesn't spell out every card's description in full — these are
// concise, factual one-liners in this repo's voice (no marketing tone), one
// per named admin area from the reference's own card list.
const ADMIN_AREAS: AdminArea[] = [
  { label: 'Users', description: 'Invite, deactivate, and manage accounts across all companies.' },
  { label: 'Roles & permissions', description: 'Define roles and the record and action scopes each one grants.' },
  { label: 'Companies & entities', description: 'Manage legal entities, business units, and company settings.' },
  { label: 'Approval policies', description: 'Set approval thresholds and routing rules by document type.' },
  { label: 'Integrations & API', description: 'Connect external systems and manage API keys and webhooks.' },
  { label: 'Audit log', description: 'Review who changed what, and when, across the system.' },
  { label: 'Data', description: 'Import, export, and manage retention for system records.' },
  { label: 'Security', description: 'Configure authentication, session, and access policies.' },
  { label: 'Billing & licenses', description: 'Manage plan, seats, and invoices for this account.' },
];

const RECENT_ACTIVITY = [
  'New user invited — Elena Cho (Finance) · 2h ago',
  'Role updated — Purchasing Approver scope changed · 5h ago',
  'Integration connected — Slack notifications · Yesterday',
  'Security policy updated — MFA required for all admins · 2 days ago',
];

export function AdminOverview() {
  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // Matches the 24px content padding / border-box sizing shared by ListReport.tsx,
        // RecordDetail.tsx and Dashboard.tsx — one content frame across all sample pages.
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* `margin: 0`, not `'0 auto'` — left-aligned, matching the other sample pages'
          content frame rather than centering. */}
      <div style={{ maxWidth: 1120, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text variant="heading">Administration</Text>
          <Text variant="body">Plan: Enterprise · 148 seats · 3 companies</Text>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {ADMIN_AREAS.map((area) => (
            <Card key={area.label}>
              <Text variant="title">{area.label}</Text>
              <Text variant="caption">{area.description}</Text>
            </Card>
          ))}
        </div>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text variant="title">Recent activity</Text>
            <Chip variant="status" tone="accent">
              All systems operational
            </Chip>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RECENT_ACTIVITY.map((event) => (
              <Text key={event} variant="body">
                {event}
              </Text>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
