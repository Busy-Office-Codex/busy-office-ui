import { useState } from 'react';
import { Button, Card, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';

/**
 * Companies & entities (ROADMAP M7's ERP reference-app initiative, Slice 12, Administration) —
 * fills NAV.Administration's own pre-existing 'Companies' placeholder (M6). AdminOverview.tsx's
 * own card names this area "Manage legal entities, business units, and company settings"; this
 * screen is the entity-lifecycle half of that (activate/deactivate a legal entity). Settings.tsx
 * already owns the single org-settings form for the ONE entity a host itself is (legal name, tax
 * ID, address) — this screen doesn't duplicate that editor per entity, it lists and toggles many.
 * Northwind Traders, LLC here reuses Settings.tsx's exact legal name/tax ID/address (the same
 * entity, viewed from a different admin screen) instead of inventing a second, contradicting
 * identity for it.
 *
 * Deactivating a company is a real mutation logged to the shared `state.activity` — AuditLog.tsx
 * and Launcher.tsx's Recent activity (Slice 11) both pick it up live, the same cross-screen
 * connectedness every other slice in this initiative has used.
 */

const STATUS_TONE: Record<string, ChipTone> = { active: 'strong', inactive: 'neutral' };
const STATUS_LABEL: Record<string, string> = { active: 'Active', inactive: 'Inactive' };

export function Companies() {
  const state = useStoreState(appStore, (s) => s);
  const companyList = Object.values(state.companies).sort((a, b) => (a.id < b.id ? -1 : 1));
  const [selectedId, setSelectedId] = useState(companyList[0]?.id ?? '');
  const selected = state.companies[selectedId];

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
        <Text variant="heading">Companies &amp; entities</Text>

        <div
          role="region"
          aria-label="Companies table"
          tabIndex={0}
          style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
        >
          <div style={{ minWidth: 560 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Legal name</TableHeaderCell>
                    <TableHeaderCell>Business unit</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companyList.map((company) => (
                    <TableRow
                      key={company.id}
                      onClick={() => setSelectedId(company.id)}
                      style={{ cursor: 'pointer', backgroundColor: company.id === selectedId ? '#eff6ff' : undefined }}
                    >
                      <TableCell>{company.legalName}</TableCell>
                      <TableCell>{company.businessUnit}</TableCell>
                      <TableCell>
                        <Chip variant="status" tone={STATUS_TONE[company.status]}>
                          {STATUS_LABEL[company.status]}
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
                <Text variant="title">{selected.legalName}</Text>
                <Chip variant="status" tone={STATUS_TONE[selected.status]}>
                  {STATUS_LABEL[selected.status]}
                </Chip>
                <div style={{ flex: 1 }} />
                <Text variant="caption">{selected.businessUnit}</Text>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 220px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text variant="caption" as="span">
                    Tax ID
                  </Text>
                  <Text variant="body">{selected.taxId}</Text>
                </div>
                <div style={{ flex: '1 1 220px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text variant="caption" as="span">
                    Address
                  </Text>
                  <Text variant="body">
                    {selected.address.line1}, {selected.address.cityStateZip}
                  </Text>
                </div>
              </div>

              <Density value="compact">
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant={selected.status === 'active' ? 'secondary' : 'primary'}
                    onClick={() => appActions.toggleCompanyStatus(selected.id)}
                  >
                    {selected.status === 'active' ? 'Deactivate' : 'Activate'}
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
