import { useState } from 'react';
import {
  Button,
  Chip,
  type ChipTone,
  Density,
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

/**
 * A filterable customer list, mirroring `templates/erp-skeleton`'s "09 Customers" screen: a
 * header with a live-ish record count plus Import/+ New customer actions, a toolbar of search
 * plus four real `Dropdown` filters (Segment, Region, Owner, Status), a second row of static
 * table-utility buttons (Columns, Saved views, Export), a real `Table`, and a static pagination
 * caption. Meant to render as `AppShell`'s content for module="Sales", route "Customers" (see
 * AppShell.tsx's `NAV.Sales`, which already lists "Customers" as its first sibling screen).
 *
 * Filtering/search follow ListReport.tsx's exact controlled-`Dropdown` + haystack-`includes`
 * pattern (its toolbar is this file's closest precedent). Owner reuses ListReport.tsx's own
 * sample buyers (Jordan Lee, Priya Shah, Marcus Webb) as account owners, per this batch's brief;
 * the 10 customer accounts themselves are new sample data — reusing ListReport's *supplier* names
 * for *customers* would conflate two different real-world parties in this sample ERP.
 *
 * Region is a filter dimension only, not a table column — the content spec's column list
 * (Customer, Segment, Owner, Open orders, Balance, Status) doesn't include it, but a Region
 * filter with no matching column is already an accepted shape here (ListReport.tsx's own
 * "Expected" filter is the only one of its four that isn't just narrowing on a value duplicated
 * elsewhere in the row for filtering purposes — this is the same idea one level further).
 *
 * "Showing 1–10 of 1,284" and the header's "1,284" are both static text per the content spec, not
 * derived from `rows.length` — this sample page has exactly 10 customer records, not 1,284, and
 * (like ListReport's stat tiles) doesn't pretend otherwise; only the *visible-rows* count reacts
 * to the toolbar filters, same as ListReport.tsx.
 */

type CustomerSegment = 'Enterprise' | 'Mid-market' | 'SMB';
type CustomerStatus = 'Active' | 'At risk' | 'Churned';

type Customer = {
  name: string;
  segment: CustomerSegment;
  owner: string;
  region: string;
  openOrders: number;
  balance: number;
  status: CustomerStatus;
  tone: ChipTone;
};

const CUSTOMERS: Customer[] = [
  { name: 'Northwind Traders', segment: 'Enterprise', owner: 'Jordan Lee', region: 'West', openOrders: 4, balance: 84200.0, status: 'Active', tone: 'strong' },
  { name: 'Solace Health Partners', segment: 'Enterprise', owner: 'Priya Shah', region: 'East', openOrders: 2, balance: 142950.0, status: 'Active', tone: 'strong' },
  { name: 'Cascade Retail Group', segment: 'Mid-market', owner: 'Marcus Webb', region: 'West', openOrders: 3, balance: 28400.0, status: 'At risk', tone: 'accent' },
  { name: 'Brightline Logistics', segment: 'Mid-market', owner: 'Jordan Lee', region: 'Central', openOrders: 1, balance: 9150.0, status: 'Active', tone: 'strong' },
  { name: 'Fenwick & Hale LLP', segment: 'SMB', owner: 'Priya Shah', region: 'East', openOrders: 0, balance: 0.0, status: 'Churned', tone: 'danger' },
  { name: 'Aurora Biotech', segment: 'Enterprise', owner: 'Marcus Webb', region: 'West', openOrders: 5, balance: 211600.0, status: 'Active', tone: 'strong' },
  { name: 'Junction Hardware Co-op', segment: 'SMB', owner: 'Jordan Lee', region: 'Central', openOrders: 1, balance: 3220.0, status: 'At risk', tone: 'accent' },
  { name: 'Pinegrove Financial', segment: 'Mid-market', owner: 'Priya Shah', region: 'East', openOrders: 2, balance: 46800.0, status: 'Active', tone: 'strong' },
  { name: 'Wavecrest Media Group', segment: 'SMB', owner: 'Marcus Webb', region: 'International', openOrders: 0, balance: 1050.0, status: 'Churned', tone: 'danger' },
  { name: 'Delta Manufacturing', segment: 'Enterprise', owner: 'Jordan Lee', region: 'Central', openOrders: 6, balance: 305750.0, status: 'Active', tone: 'strong' },
];

const TOTAL_CUSTOMERS = '1,284';

const SEGMENT_ITEMS: string[] = ['All segments', 'Enterprise', 'Mid-market', 'SMB'];
const REGION_ITEMS = ['All regions', ...Array.from(new Set(CUSTOMERS.map((customer) => customer.region)))];
const OWNER_ITEMS = ['All owners', ...Array.from(new Set(CUSTOMERS.map((customer) => customer.owner)))];
const STATUS_ITEMS: string[] = ['All statuses', 'Active', 'At risk', 'Churned'];

const TABLE_UTILITIES = ['Columns', 'Saved views', 'Export'];

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function Customers() {
  const [segmentFilter, setSegmentFilter] = useState('All segments');
  const [regionFilter, setRegionFilter] = useState('All regions');
  const [ownerFilter, setOwnerFilter] = useState('All owners');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [query, setQuery] = useState('');

  const rows = CUSTOMERS.filter((customer) => {
    if (segmentFilter !== SEGMENT_ITEMS[0] && customer.segment !== segmentFilter) return false;
    if (regionFilter !== REGION_ITEMS[0] && customer.region !== regionFilter) return false;
    if (ownerFilter !== OWNER_ITEMS[0] && customer.owner !== ownerFilter) return false;
    if (statusFilter !== STATUS_ITEMS[0] && customer.status !== statusFilter) return false;
    if (query) {
      const haystack = `${customer.name} ${customer.owner}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 24,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <Density value="compact">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Text variant="heading">Customers · {TOTAL_CUSTOMERS}</Text>
          <div style={{ flex: 1 }} />
          <Button type="button" variant="secondary">
            Import
          </Button>
          <Button type="button" variant="primary">
            + New customer
          </Button>
        </div>
      </Density>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 280 }}>
          <Input placeholder="Search customers…" value={query} onChange={(event) => setQuery(event.target.value)} size="search" />
        </div>
        <Dropdown
          label={`Segment · ${segmentFilter}`}
          items={SEGMENT_ITEMS.map((label) => ({ label, selected: label === segmentFilter }))}
          onSelect={setSegmentFilter}
          active={segmentFilter !== SEGMENT_ITEMS[0]}
        />
        <Dropdown
          label={`Region · ${regionFilter}`}
          items={REGION_ITEMS.map((label) => ({ label, selected: label === regionFilter }))}
          onSelect={setRegionFilter}
          active={regionFilter !== REGION_ITEMS[0]}
        />
        <Dropdown
          label={`Owner · ${ownerFilter}`}
          items={OWNER_ITEMS.map((label) => ({ label, selected: label === ownerFilter }))}
          onSelect={setOwnerFilter}
          active={ownerFilter !== OWNER_ITEMS[0]}
        />
        <Dropdown
          label={`Status · ${statusFilter}`}
          items={STATUS_ITEMS.map((label) => ({ label, selected: label === statusFilter }))}
          onSelect={setStatusFilter}
          active={statusFilter !== STATUS_ITEMS[0]}
        />
      </div>

      <Density value="compact">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABLE_UTILITIES.map((label) => (
            <Button key={label} type="button" variant="ghost">
              {label}
            </Button>
          ))}
        </div>
      </Density>

      <div
        role="region"
        aria-label="Customers table"
        tabIndex={0}
        style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
      >
        <div style={{ minWidth: 720 }}>
          <Density value="compact">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Segment</TableHeaderCell>
                  <TableHeaderCell>Owner</TableHeaderCell>
                  <TableHeaderCell align="end">Open orders</TableHeaderCell>
                  <TableHeaderCell align="end">Balance</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((customer) => (
                  <TableRow key={customer.name}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.segment}</TableCell>
                    <TableCell>{customer.owner}</TableCell>
                    <TableCell align="end">{customer.openOrders}</TableCell>
                    <TableCell align="end">{formatCurrency(customer.balance)}</TableCell>
                    <TableCell>
                      <Chip variant="status" tone={customer.tone}>
                        {customer.status}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Text variant="caption">No customers match these filters.</Text>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Density>
        </div>
      </div>

      <Text variant="caption">Showing 1–10 of {TOTAL_CUSTOMERS}</Text>
    </div>
  );
}
