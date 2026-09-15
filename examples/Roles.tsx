import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { Button, Card, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';
import { ALL_MODULES } from './data/types.js';
import { checkboxStyles } from './checkboxStyles.js';

/**
 * Role management (ROADMAP M7's ERP reference-app initiative, Slice 9, Administration +
 * role-based config) — fills NAV.Administration's own pre-existing 'Roles' placeholder (M6). The
 * brief's own named Administration journey ("Role create/edit/clone") on top of Slice 4's data
 * model: `Role.moduleAccess` was write-only before this (Users.tsx could assign a role, but
 * nothing could see or change what a role itself grants beyond the seed data).
 *
 * Toggling a module here is a real mutation, not a page-local draft: Users.tsx's own "Preview
 * access" chips (Slice 4) read the exact same `state.roles` this screen edits, so unchecking
 * Finance manager's Finance grant genuinely changes what every Finance manager sees the next
 * time they're looked up — the same cross-screen connectedness this whole reference app has been
 * built on, not a settings page nobody else reads.
 *
 * "Clone" is a real create, not a placeholder button — it copies the source role's current
 * grants under a new name (`appActions.cloneRole`), the same reuse of Requisitions.tsx's own
 * "reuse a proven action, log it, move on" shape.
 */

const permissionKey = (roleId: string, module: string) => `${roleId}:${module}`;

let nextRoleSeq = 1;

export function Roles() {
  const state = useStoreState(appStore, (s) => s);
  const roleList = Object.values(state.roles).sort((a, b) => (a.id < b.id ? -1 : 1));
  const [selectedId, setSelectedId] = useState(roleList[0]?.id ?? '');
  const selected = state.roles[selectedId];
  const userCount = selected ? Object.values(state.users).filter((user) => user.roleId === selected.id).length : 0;

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
        <Text variant="heading">Roles</Text>

        <div
          role="region"
          aria-label="Roles table"
          tabIndex={0}
          style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
        >
          <div style={{ minWidth: 480 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell align="end">Users</TableHeaderCell>
                    <TableHeaderCell align="end">Modules granted</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roleList.map((role) => (
                    <TableRow
                      key={role.id}
                      onClick={() => setSelectedId(role.id)}
                      style={{ cursor: 'pointer', backgroundColor: role.id === selectedId ? '#eff6ff' : undefined }}
                    >
                      <TableCell>{role.name}</TableCell>
                      <TableCell align="end">{Object.values(state.users).filter((user) => user.roleId === role.id).length}</TableCell>
                      <TableCell align="end">{role.moduleAccess.length}</TableCell>
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
                <div style={{ flex: 1 }} />
                <Text variant="caption">
                  {userCount} user{userCount === 1 ? '' : 's'} assigned
                </Text>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="caption" as="span">
                  Module access
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
                  {ALL_MODULES.map((module) => {
                    const key = permissionKey(selected.id, module);
                    const granted = selected.moduleAccess.includes(module);
                    return (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          aria-label={`${selected.name} · ${module}`}
                          checked={granted}
                          onChange={() => appActions.toggleRoleModuleAccess(selected.id, module)}
                          {...stylex.props(checkboxStyles.checkbox)}
                        />
                        <Text variant="body" as="span">
                          {module}
                        </Text>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Density value="compact">
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const newId = `role-clone-${nextRoleSeq}`;
                      nextRoleSeq += 1;
                      appActions.cloneRole(selected.id, newId);
                      setSelectedId(newId);
                    }}
                  >
                    Clone role
                  </Button>
                </div>
              </Density>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
