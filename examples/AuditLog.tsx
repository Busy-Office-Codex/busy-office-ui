import { useState } from 'react';
import { Card, Chip, type ChipTone, Density, Dropdown, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';

/**
 * A real, cross-domain audit trail (ROADMAP M7's ERP reference-app initiative, Slice 4,
 * Administration + role-based config) — the last hop of the brief's own named journey ("create
 * user → assign role → preview access → inspect audit history"). Reads the exact same shared
 * `activity` array every other screen since Slice 1 already appends to (quotations, sales
 * orders, deliveries, invoices, requisitions, purchase orders, goods receipts, planning
 * recommendations, planned/production orders, users) — this is genuinely the whole app's history
 * in one place, not a users-only log invented fresh for this screen.
 */

const RECORD_TYPE_TONE: Record<string, ChipTone> = {
  quotation: 'accent',
  salesOrder: 'accent',
  delivery: 'accent',
  invoice: 'accent',
  requisition: 'strong',
  purchaseOrder: 'strong',
  goodsReceipt: 'strong',
  planningRecommendation: 'neutral',
  plannedOrder: 'neutral',
  productionOrder: 'neutral',
  user: 'danger',
  role: 'danger',
};

const RECORD_TYPE_LABEL: Record<string, string> = {
  quotation: 'Quotation',
  salesOrder: 'Sales order',
  delivery: 'Delivery',
  invoice: 'Invoice',
  requisition: 'Requisition',
  purchaseOrder: 'Purchase order',
  goodsReceipt: 'Goods receipt',
  planningRecommendation: 'Recommendation',
  plannedOrder: 'Planned order',
  productionOrder: 'Production order',
  user: 'User',
  role: 'Role',
};

const FILTER_ITEMS = ['All types', ...Object.keys(RECORD_TYPE_LABEL).map((key) => RECORD_TYPE_LABEL[key]!)];

export function AuditLog() {
  const state = useStoreState(appStore, (s) => s);
  const [typeFilter, setTypeFilter] = useState('All types');

  const entries = state.activity
    .filter((entry) => typeFilter === 'All types' || RECORD_TYPE_LABEL[entry.recordType] === typeFilter)
    .slice()
    .reverse();

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
        <Text variant="heading">Audit log</Text>

        <Density value="compact">
          <Dropdown
            label={`Type · ${typeFilter}`}
            items={FILTER_ITEMS.map((label) => ({ label, selected: label === typeFilter }))}
            onSelect={setTypeFilter}
            active={typeFilter !== 'All types'}
          />
        </Density>

        {entries.length === 0 ? (
          <Card role="status">
            <Text variant="body">No activity matches this filter.</Text>
          </Card>
        ) : (
          <div
            role="region"
            aria-label="Audit log table"
            tabIndex={0}
            style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
          >
            <div style={{ minWidth: 640 }}>
              <Density value="compact">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Date</TableHeaderCell>
                      <TableHeaderCell>Type</TableHeaderCell>
                      <TableHeaderCell>Record</TableHeaderCell>
                      <TableHeaderCell>Event</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.at}</TableCell>
                        <TableCell>
                          <Chip variant="status" tone={RECORD_TYPE_TONE[entry.recordType]}>
                            {RECORD_TYPE_LABEL[entry.recordType]}
                          </Chip>
                        </TableCell>
                        <TableCell>{entry.recordId}</TableCell>
                        <TableCell>{entry.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Density>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
