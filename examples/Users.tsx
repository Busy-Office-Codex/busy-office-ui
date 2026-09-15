import { useState } from 'react';
import { Button, Card, Chip, type ChipTone, Density, Dropdown, Input, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';
import { ALL_MODULES } from './data/types.js';

/**
 * Users + role assignment + access preview + audit history (ROADMAP M7's ERP reference-app
 * initiative, Slice 4, Administration + role-based config) — the brief's own named journey:
 * "create user → assign role → preview access → inspect audit history" in one screen, same
 * one-screen-per-chain judgment as Requisitions.tsx/Planning.tsx before it.
 *
 * "Preview access" here means: which of this app's real modules the user's assigned role can
 * open (Role.moduleAccess, seed.ts) — a genuine derived read from role data, not a simulated
 * app-wide role switch (that would mean re-rendering Shell's whole nav as a different identity,
 * a materially bigger change than this slice's own scope). "Audit history" reads this user's
 * slice of the same shared `activity` log every other screen already writes to — not a separate,
 * parallel log.
 *
 * Roles themselves (UsersAndRoles.tsx's per-action permissions matrix) stay that screen's own
 * static sample — this file only reads role NAMES and `moduleAccess` from the shared store to
 * drive real assignment, matching Slice 3's precedent of extending the store rather than
 * reworking an existing M6 page out of scope.
 */

const STATUS_TONE: Record<string, ChipTone> = { invited: 'accent', active: 'strong', deactivated: 'neutral' };
const STATUS_LABEL: Record<string, string> = { invited: 'Invited', active: 'Active', deactivated: 'Deactivated' };

let nextUserSeq = 1;

export function Users() {
  const state = useStoreState(appStore, (s) => s);
  const userList = Object.values(state.users).sort((a, b) => (a.id < b.id ? -1 : 1));
  const [selectedId, setSelectedId] = useState(userList[0]?.id ?? '');
  const selected = state.users[selectedId];
  const selectedRole = selected?.roleId ? state.roles[selected.roleId] : undefined;
  const userActivity = state.activity.filter((entry) => entry.recordType === 'user' && entry.recordId === selectedId).slice().reverse();

  const [showNewUser, setShowNewUser] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');

  const roleList = Object.values(state.roles);

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Text variant="heading">Users</Text>
          <div style={{ flex: 1 }} />
          <Button type="button" variant="primary" onClick={() => setShowNewUser((v) => !v)}>
            {showNewUser ? 'Cancel' : '+ New user'}
          </Button>
        </div>

        {showNewUser && (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Text variant="title">Invite a new user</Text>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />
                </div>
                <div style={{ flex: '1 1 240px' }}>
                  <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex.rivera@busyoffice.example" />
                </div>
                <div style={{ flex: '1 1 180px' }}>
                  <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Sales" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="primary"
                  disabled={!name.trim() || !email.trim() || !department.trim()}
                  onClick={() => {
                    const newId = `usr-new-${nextUserSeq}`;
                    nextUserSeq += 1;
                    appActions.createUser(newId, name.trim(), email.trim(), department.trim());
                    setSelectedId(newId);
                    setName('');
                    setEmail('');
                    setDepartment('');
                    setShowNewUser(false);
                  }}
                >
                  Invite
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div
          role="region"
          aria-label="Users table"
          tabIndex={0}
          style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
        >
          <div style={{ minWidth: 640 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Department</TableHeaderCell>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userList.map((user) => (
                    <TableRow
                      key={user.id}
                      onClick={() => setSelectedId(user.id)}
                      style={{ cursor: 'pointer', backgroundColor: user.id === selectedId ? '#eff6ff' : undefined }}
                    >
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.roleId ? state.roles[user.roleId]?.name : '—'}</TableCell>
                      <TableCell>
                        <Chip variant="status" tone={STATUS_TONE[user.status]}>
                          {STATUS_LABEL[user.status]}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Density>
          </div>
        </div>

        {selected && (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Text variant="title">{selected.name}</Text>
                <Chip variant="status" tone={STATUS_TONE[selected.status]}>
                  {STATUS_LABEL[selected.status]}
                </Chip>
                <div style={{ flex: 1 }} />
                <Text variant="caption">
                  {selected.email} · {selected.department}
                </Text>
              </div>

              <Density value="compact">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <Dropdown
                    label={`Role · ${selectedRole?.name ?? 'Unassigned'}`}
                    items={roleList.map((role) => ({ label: role.name, selected: role.id === selected.roleId }))}
                    onSelect={(label) => {
                      const role = roleList.find((r) => r.name === label);
                      if (role) appActions.assignRole(selected.id, role.id);
                    }}
                    active={Boolean(selected.roleId)}
                  />
                </div>
              </Density>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="title">Preview access</Text>
                {selectedRole ? (
                  <div role="group" aria-label="Module access preview" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ALL_MODULES.map((module) => {
                      const granted = selectedRole.moduleAccess.includes(module);
                      return (
                        <Chip key={module} variant="status" tone={granted ? 'strong' : 'neutral'}>
                          {module}
                          {granted ? '' : ' (no access)'}
                        </Chip>
                      );
                    })}
                  </div>
                ) : (
                  <Text variant="caption">No role assigned yet — assign one above to preview module access.</Text>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="title">Audit history</Text>
                {userActivity.length === 0 ? (
                  <Text variant="caption">No activity recorded for this user yet.</Text>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {userActivity.map((entry) => (
                      <Text key={entry.id} variant="body">
                        {entry.at} — {entry.message}
                      </Text>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
