import { useState } from 'react';
import { Button, Card, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';
import { ConfirmDialog } from './confirmDialog.js';

/**
 * Integrations & API (ROADMAP M7's ERP reference-app initiative, Slice 12, Administration) — fills
 * NAV.Administration's own pre-existing 'Integrations' placeholder (M6). AdminOverview.tsx's own
 * static "Integration connected — Slack notifications · Yesterday" activity line is this screen's
 * real seeded Slack row and this exact `connectIntegration` action's own logged message — not
 * independent copy for the same fact, the same "the fact already exists elsewhere, connect to it"
 * discipline Slice 5's Dashboard used for revenue and Slice 11's Launcher used for recent activity.
 *
 * Connect/disconnect logs to the shared `state.activity`, so AuditLog.tsx and Launcher.tsx's
 * Recent activity (Slice 11) both see it live. No API-key/webhook form here — a disclosed
 * boundary, not an oversight: this reference app never calls a network, so a real secret field
 * would be theater, not a feature; the connect/disconnect lifecycle itself is the real, testable
 * part of "Integrations & API". Disconnect (not Connect — only the destructive direction) confirms
 * first via `ConfirmDialog` (Slice 15, `./confirmDialog.js`).
 */

const STATUS_TONE: Record<string, ChipTone> = { connected: 'strong', disconnected: 'neutral' };
const STATUS_LABEL: Record<string, string> = { connected: 'Connected', disconnected: 'Disconnected' };

export function Integrations() {
  const state = useStoreState(appStore, (s) => s);
  const integrationList = Object.values(state.integrations).sort((a, b) => (a.id < b.id ? -1 : 1));
  const [selectedId, setSelectedId] = useState(integrationList[0]?.id ?? '');
  const selected = state.integrations[selectedId];
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

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
        <Text variant="heading">Integrations &amp; API</Text>

        <div
          role="region"
          aria-label="Integrations table"
          tabIndex={0}
          style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
        >
          <div style={{ minWidth: 560 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Integration</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Connected</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {integrationList.map((integration) => (
                    <TableRow
                      key={integration.id}
                      onClick={() => setSelectedId(integration.id)}
                      style={{ cursor: 'pointer', backgroundColor: integration.id === selectedId ? '#eff6ff' : undefined }}
                    >
                      <TableCell>{integration.name}</TableCell>
                      <TableCell>{integration.category}</TableCell>
                      <TableCell>
                        <Chip variant="status" tone={STATUS_TONE[integration.status]}>
                          {STATUS_LABEL[integration.status]}
                        </Chip>
                      </TableCell>
                      <TableCell>{integration.connectedAt ?? '—'}</TableCell>
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
                <Text variant="caption">{selected.category}</Text>
              </div>

              <Text variant="body">{selected.status === 'connected' ? `Connected ${selected.connectedAt}` : 'Not connected.'}</Text>

              <Density value="compact">
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  {selected.status === 'connected' ? (
                    <Button type="button" variant="secondary" onClick={() => setConfirmingDisconnect(true)}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button type="button" variant="primary" onClick={() => appActions.connectIntegration(selected.id)}>
                      Connect
                    </Button>
                  )}
                </div>
              </Density>
            </div>
          </Card>
        )}
      </div>

      {selected && (
        <ConfirmDialog
          open={confirmingDisconnect}
          title={`Disconnect ${selected.name}?`}
          confirmLabel="Disconnect"
          onConfirm={() => {
            appActions.disconnectIntegration(selected.id);
            setConfirmingDisconnect(false);
          }}
          onCancel={() => setConfirmingDisconnect(false)}
        >
          Automations relying on this integration will stop running.
        </ConfirmDialog>
      )}
    </div>
  );
}
