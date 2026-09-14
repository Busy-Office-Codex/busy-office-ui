import { Button, Card, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { FilterTabs } from './filterTabs.js';

/**
 * A role-scoped workspace: role identity header, a filter-Chip-as-tabs row, and — under the
 * active "My work" tab — a KPI tile row, a work queue, shortcuts, and a team/delegation panel.
 * Mirrors `templates/erp-skeleton`'s "03 Role page" screen. Meant to render as `AppShell`'s
 * content for module="General", route "Role page" (see AppShell.tsx's `NAV.General`, which
 * already lists "Role page" as a sibling of "Home"/"Profile").
 *
 * Same tab convention Profile.tsx established: this package has no `Tab` component, so
 * My work/Team/Targets/Permissions reuse filter `Chip` (`variant="filter"`). Only "My work" is
 * selected and has real content below it — the other three render as present-but-inactive chips
 * with no switching logic, per this milestone's structural-first-pass scope.
 *
 * "Switch role" is a plain, non-interactive pill — same judgment and reasoning as Login.tsx's
 * workspace-switcher span: a real `Dropdown` would need each role it lists to plausibly open a
 * genuinely different workspace (different KPIs, queue, team), which is well beyond this
 * structural pass's one-role sample data, so a static trigger reads more honestly here than a
 * `Dropdown` with items that select but change nothing.
 *
 * The work queue reuses "Northwind Traders" (RecordDetail.tsx's own sales-order account) and the
 * team panel reuses "Jordan Lee"/"Priya Shah" (ListReport.tsx's sample buyers) — the same shared
 * personas/accounts other example pages already established, rather than inventing new ones.
 */

const ROLE = {
  name: 'Sales Manager',
  assignedRoles: 3,
  scope: 'Region North',
};

const TABS = ['My work', 'Team', 'Targets', 'Permissions'];

type RoleKpi = { label: string; value: string; caption: string };

const ROLE_KPIS: RoleKpi[] = [
  { label: 'Quota attainment', value: '78%', caption: '$936K of $1.2M target' },
  { label: 'Pipeline value', value: '$612K', caption: '42 open opportunities' },
  { label: 'Deals closing this week', value: '6', caption: '$184K weighted value' },
];

type WorkQueueItem = { account: string; action: string; due: string; priority: string; tone: ChipTone };

const WORK_QUEUE: WorkQueueItem[] = [
  { account: 'Northwind Traders', action: 'Send renewal proposal', due: 'Due today', priority: 'High', tone: 'danger' },
  { account: 'Bluepeak Logistics', action: 'Confirm signed order', due: 'Overdue', priority: 'High', tone: 'danger' },
  { account: 'Solstice Home Goods', action: 'Follow up on trial feedback', due: 'Due tomorrow', priority: 'Medium', tone: 'accent' },
  { account: 'Ironclad Security Systems', action: 'Schedule quarterly business review', due: 'Due Fri', priority: 'Medium', tone: 'accent' },
  { account: 'Fenwick Retail Group', action: 'Send updated quote', due: 'Due next week', priority: 'Low', tone: 'neutral' },
];

const SHORTCUTS = ['Create sales order', 'View my accounts', 'Log a call', 'Start a new quote'];

type TeamMember = { name: string; relationship: string };

const TEAM: TeamMember[] = [
  { name: 'Jordan Lee', relationship: 'Reports to — VP of Sales' },
  { name: 'Priya Shah', relationship: 'Can delegate approvals to — Senior Account Executive' },
];

export function RolePage() {
  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // Matches ListReport.tsx/RecordDetail.tsx/Dashboard.tsx/AdminOverview.tsx/Settings.tsx's
        // shared 24px content padding / border-box frame (see RecordDetail.tsx for the full
        // box-sizing reasoning).
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* `margin: 0`, not `'0 auto'` — left-aligns, matching every other sample page's content
          frame. `maxWidth: 1120` matches Dashboard.tsx/AdminOverview.tsx — the other pages whose
          content is a KPI/card grid rather than a single form or record. */}
      <div style={{ maxWidth: 1120, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text variant="heading">{ROLE.name}</Text>
            <Text variant="caption">
              {ROLE.assignedRoles} roles assigned · scope: {ROLE.scope}
            </Text>
          </div>
          <div style={{ flex: 1 }} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
            }}
          >
            Switch role <span aria-hidden="true" style={{ color: '#94a3b8' }}>▾</span>
          </span>
        </div>

        <FilterTabs tabs={TABS} selected="My work" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {ROLE_KPIS.map((kpi) => (
            <Card key={kpi.label}>
              <Text variant="caption" as="span">
                {kpi.label}
              </Text>
              <Text variant="heading">{kpi.value}</Text>
              <Text variant="caption">{kpi.caption}</Text>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Text variant="title">My work queue</Text>
          <div
            role="region"
            aria-label="My work queue"
            tabIndex={0}
            style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
          >
            <div style={{ minWidth: 560 }}>
              <Density value="compact">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Account</TableHeaderCell>
                      <TableHeaderCell>Next action</TableHeaderCell>
                      <TableHeaderCell>Due</TableHeaderCell>
                      <TableHeaderCell>Priority</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {WORK_QUEUE.map((item) => (
                      <TableRow key={item.account}>
                        <TableCell>{item.account}</TableCell>
                        <TableCell>{item.action}</TableCell>
                        <TableCell>{item.due}</TableCell>
                        <TableCell>
                          <Chip variant="status" tone={item.tone}>
                            {item.priority}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Density>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <Card>
              <Text variant="title">Shortcuts</Text>
              <Density value="compact">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SHORTCUTS.map((label) => (
                    <Button key={label} type="button" variant="ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
                      {label}
                    </Button>
                  ))}
                </div>
              </Density>
            </Card>
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <Card>
              <Text variant="title">Team &amp; delegation</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {TEAM.map((person) => (
                  <div key={person.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Decorative placeholder avatar — same pattern as Profile.tsx's header avatar
                        div, sized down for a list row. */}
                    <div aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 999, background: '#e2e8f0', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Text variant="body">{person.name}</Text>
                      <Text variant="caption">{person.relationship}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card>
          <Text variant="title">Permissions</Text>
          <Text variant="body">
            The Permissions tab shows this role's full access matrix — the record types, fields, and actions it can
            view or edit. Not built in this structural pass; only "My work" has real content this milestone.
          </Text>
        </Card>
      </div>
    </div>
  );
}
