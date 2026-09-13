import { useState } from 'react';
import {
  Button,
  Chip,
  type ChipTone,
  Dropdown,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from '../src/index.js';

type Order = { po: string; vendor: string; status: string; tone: ChipTone; amount: string };

const ORDERS: Order[] = [
  { po: 'PO-1042', vendor: 'Alden Paper Co.', status: 'Awaiting approval', tone: 'accent', amount: '$1,240.00' },
  { po: 'PO-1041', vendor: 'Northgate Office Supply', status: 'Confirmed', tone: 'strong', amount: '$8,960.50' },
  { po: 'PO-1038', vendor: 'Redline Facilities Group', status: 'Overdue', tone: 'danger', amount: '$3,415.75' },
  { po: 'PO-1035', vendor: 'Summit Hardware & Tools', status: 'Confirmed', tone: 'strong', amount: '$620.00' },
  { po: 'PO-1029', vendor: 'Cascade IT Distribution', status: 'Awaiting approval', tone: 'accent', amount: '$14,802.20' },
  { po: 'PO-1021', vendor: 'Harborline Print & Signage', status: 'Overdue', tone: 'danger', amount: '$975.40' },
];

const STATUS_ITEMS = ['All statuses', 'Awaiting approval', 'Confirmed', 'Overdue'];

/**
 * A filterable purchase-order list: search, filter chips, a real Dropdown
 * (not usable in the Claude Design canvas format — its `items` prop is an
 * array, see conventions.md), and a real Table. Mirrors the "list-report"
 * Claude Design template, with real interactivity added where the static
 * canvas version couldn't have any.
 */
export function ListReport() {
  const [filter, setFilter] = useState<'all' | 'mine' | 'overdue'>('all');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [query, setQuery] = useState('');

  const rows = ORDERS.filter((order) => {
    if (filter === 'overdue' && order.status !== 'Overdue') return false;
    if (statusFilter !== 'All statuses' && order.status !== statusFilter) return false;
    if (query && !order.vendor.toLowerCase().includes(query.toLowerCase()) && !order.po.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 32,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <Text variant="heading">Purchase orders</Text>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary">Export</Button>
          <Button variant="primary">New purchase order</Button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip variant="filter" selected={filter === 'all'} onClick={() => setFilter('all')}>
            All open · {ORDERS.length}
          </Chip>
          <Chip variant="filter" selected={filter === 'mine'} onClick={() => setFilter('mine')}>
            Mine · 6
          </Chip>
          <Chip variant="filter" selected={filter === 'overdue'} onClick={() => setFilter('overdue')}>
            Overdue · {ORDERS.filter((o) => o.status === 'Overdue').length}
          </Chip>
          <Dropdown
            label={`Status · ${statusFilter}`}
            items={STATUS_ITEMS.map((label) => ({ label, selected: label === statusFilter }))}
            onSelect={setStatusFilter}
          />
        </div>
        <div style={{ minWidth: 280, flex: '0 1 320px' }}>
          <Input
            placeholder="Search vendor or PO number..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div role="region" aria-label="Purchase orders table" tabIndex={0} style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}>
        <div style={{ minWidth: 600 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Order</TableHeaderCell>
              <TableHeaderCell>Vendor</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell align="end">Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((order) => (
              <TableRow key={order.po}>
                <TableCell>{order.po}</TableCell>
                <TableCell>{order.vendor}</TableCell>
                <TableCell>
                  <Chip variant="status" tone={order.tone}>
                    {order.status}
                  </Chip>
                </TableCell>
                <TableCell align="end">{order.amount}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Text variant="caption">No purchase orders match these filters.</Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
