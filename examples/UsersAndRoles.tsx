import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { Button, Card, Chip, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
// ROADMAP M6 (issue #17): examples/checkboxStyles.ts's shared native-checkbox styling — see that
// file for the full history/rationale. Third consumer alongside ListReport.tsx's row-selection
// checkboxes and Settings.tsx's Modules toggle rows; this page's permissions-matrix cells are the
// same "real native checkbox, same visual treatment" case, not a reason to invent a fourth look.
import { checkboxStyles } from './checkboxStyles.js';

/**
 * A two-pane role editor: a role list on the left, and — for the selected role — a header,
 * Duplicate/Assign users/Save actions, a filter-Chip-as-tabs row, and a real permissions matrix
 * table on the right. Mirrors `templates/erp-skeleton`'s "22 · Users and roles" screen (Claude
 * Design project "Busy Office Design System"). Meant to render as `AppShell`'s content for
 * module="Administration", route "Users and roles" (see AppShell.tsx's `NAV.Administration`,
 * which already lists it as a sibling of "Overview"/"Users"/"Roles").
 *
 * The reference's single screen unifies "Users" and "Roles" into one role-scoped editor rather
 * than two separate list pages, which is why this file — not two new ones — covers item 22.
 *
 * Role selection is a single static pairing (`SELECTED_ROLE` rendered with `Card`'s `selected`
 * prop, no `onClick`) rather than a full click-to-switch editor — same judgment and precedent as
 * Inbox.tsx's thread-list/detail-pane pairing: making every role genuinely clickable would need
 * per-role permission data for all eleven sample roles, well beyond this structural pass's one
 * fully-worked example. The Permissions/Data scope/Members/Landing page row follows this
 * milestone's established filter-Chip-as-tabs convention (Profile.tsx, RolePage.tsx) — only
 * "Permissions" is selected and has real content below it.
 *
 * The permissions matrix checkboxes ARE real and interactive (`useState`, like Settings.tsx's
 * toggle rows) — that's a plain, natural consequence of using a controlled `<input>`, not an
 * attempt to wire role-to-role switching.
 */

type Role = { name: string; users: number };

const SYSTEM_ROLES: Role[] = [
  { name: 'Administrator', users: 4 },
  { name: 'Finance manager', users: 8 },
  { name: 'Sales manager', users: 23 },
  { name: 'Sales rep', users: 41 },
  { name: 'Warehouse', users: 15 },
  { name: 'Purchasing', users: 9 },
  { name: 'Viewer', users: 12 },
];

const CUSTOM_ROLES: Role[] = [
  { name: 'Regional sales lead', users: 6 },
  { name: 'AP clerk', users: 3 },
  { name: 'Inventory auditor', users: 2 },
  { name: 'Read-only finance', users: 5 },
];

const SELECTED_ROLE: Role = SYSTEM_ROLES[2]!; // Sales manager

const TABS = ['Permissions', 'Data scope', 'Members', 'Landing page'];

const PERMISSION_COLUMNS = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'] as const;
type PermissionColumn = (typeof PERMISSION_COLUMNS)[number];

type PermissionRow = { module: string; grants: Record<PermissionColumn, boolean> };

// Sample data for the selected role (Sales manager): broad access to Sales/Sales order, limited
// read/export on Invoice and BI, a read-only line into Finance, and no Purchase access at all —
// a plausible mixed grant pattern, not a uniform all-true/all-false matrix.
const PERMISSION_MATRIX: PermissionRow[] = [
  { module: 'Sales', grants: { View: true, Create: true, Edit: true, Delete: false, Approve: true, Export: true } },
  { module: 'Sales order', grants: { View: true, Create: true, Edit: true, Delete: false, Approve: true, Export: true } },
  { module: 'Invoice', grants: { View: true, Create: false, Edit: false, Delete: false, Approve: false, Export: true } },
  { module: 'Purchase', grants: { View: false, Create: false, Edit: false, Delete: false, Approve: false, Export: false } },
  { module: 'Finance', grants: { View: true, Create: false, Edit: false, Delete: false, Approve: false, Export: false } },
  { module: 'BI', grants: { View: true, Create: false, Edit: false, Delete: false, Approve: false, Export: true } },
];

const permissionKey = (module: string, column: PermissionColumn) => `${module}:${column}`;

function RoleListItem({ role, selected }: { role: Role; selected: boolean }) {
  return (
    <Card selected={selected}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <Text variant="body">{role.name}</Text>
        <Text variant="caption">{role.users} users</Text>
      </div>
    </Card>
  );
}

export function UsersAndRoles() {
  const [grants, setGrants] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      PERMISSION_MATRIX.flatMap((row) =>
        PERMISSION_COLUMNS.map((column) => [permissionKey(row.module, column), row.grants[column]]),
      ),
    ),
  );

  const toggleGrant = (key: string) => {
    setGrants((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // Matches ListReport.tsx/RecordDetail.tsx/Dashboard.tsx/Settings.tsx/RolePage.tsx's shared
        // 24px content padding / border-box frame.
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* `margin: 0`, not `'0 auto'` — left-aligns, matching every other sample page's content
          frame. `maxWidth: 1200` is slightly wider than RolePage.tsx/Dashboard.tsx's 1120 — this
          page's right pane holds a 7-column matrix table, needing a bit more room. */}
      <div style={{ maxWidth: 1200, margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Text variant="heading">Users and roles</Text>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 260px', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button type="button" variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
              + New
            </Button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SYSTEM_ROLES.map((role) => (
                <RoleListItem key={role.name} role={role} selected={role.name === SELECTED_ROLE.name} />
              ))}
            </div>

            <div style={{ marginTop: 8 }}>
              <Text variant="overline">Custom roles ({CUSTOM_ROLES.length})</Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CUSTOM_ROLES.map((role) => (
                <RoleListItem key={role.name} role={role} selected={false} />
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 480px', minWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Density value="compact">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text variant="title">
                    {SELECTED_ROLE.name} · {SELECTED_ROLE.users} users
                  </Text>
                </div>
                <div style={{ flex: 1 }} />
                <Button type="button" variant="secondary">
                  Duplicate
                </Button>
                <Button type="button" variant="secondary">
                  Assign users
                </Button>
                <Button type="button" variant="primary">
                  Save
                </Button>
              </div>
            </Density>

            <Density value="compact">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TABS.map((tab) => (
                  <Chip key={tab} variant="filter" selected={tab === 'Permissions'}>
                    {tab}
                  </Chip>
                ))}
              </div>
            </Density>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Text variant="title">Permissions</Text>
              <div
                role="region"
                aria-label={`${SELECTED_ROLE.name} permissions matrix`}
                tabIndex={0}
                style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
              >
                <div style={{ minWidth: 640 }}>
                  <Density value="compact">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeaderCell>Module</TableHeaderCell>
                          {PERMISSION_COLUMNS.map((column) => (
                            <TableHeaderCell key={column}>{column}</TableHeaderCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {PERMISSION_MATRIX.map((row) => (
                          <TableRow key={row.module}>
                            <TableCell>{row.module}</TableCell>
                            {PERMISSION_COLUMNS.map((column) => {
                              const key = permissionKey(row.module, column);
                              return (
                                <TableCell key={column}>
                                  <input
                                    type="checkbox"
                                    aria-label={`${row.module} · ${column}`}
                                    checked={grants[key] ?? false}
                                    onChange={() => toggleGrant(key)}
                                    {...stylex.props(checkboxStyles.checkbox)}
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Density>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
