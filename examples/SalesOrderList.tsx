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
import { FilterTabs } from './filterTabs.js';

type SalesOrder = {
  orderNumber: string;
  customer: string;
  orderDate: string;
  deliveryDate: string;
  warehouse: string;
  dateBucket: string;
  total: number;
  status: string;
  tone: ChipTone;
};

// Sample entities line up with the other example pages' sample data (SO-1042/Northwind Traders
// is RecordDetail.tsx's own sales order, same $24,300 total; SO-1038/SO-1035 are the sales
// orders Notifications.tsx's feed already references) — one shared sample world across the
// examples, not a fresh unrelated one for this page (see Notifications.tsx for the same note).
const SALES_ORDERS: SalesOrder[] = [
  {
    orderNumber: 'SO-1046',
    customer: 'Brightline Retail Group',
    orderDate: 'Sep 14',
    deliveryDate: '—',
    warehouse: 'Main DC',
    dateBucket: 'This week',
    total: 3180.0,
    status: 'Draft',
    tone: 'neutral',
  },
  {
    orderNumber: 'SO-1044',
    customer: 'Cascadia Outfitters',
    orderDate: 'Sep 12',
    deliveryDate: '—',
    warehouse: 'East Coast Hub',
    dateBucket: 'This week',
    total: 940.5,
    status: 'Draft',
    tone: 'neutral',
  },
  {
    orderNumber: 'SO-1042',
    customer: 'Northwind Traders',
    orderDate: 'Sep 10',
    deliveryDate: 'Sep 19',
    warehouse: 'Main DC',
    dateBucket: 'This week',
    total: 24300.0,
    status: 'Awaiting approval',
    tone: 'accent',
  },
  {
    orderNumber: 'SO-1041',
    customer: 'Acme Supply Co.',
    orderDate: 'Sep 09',
    deliveryDate: 'Sep 20',
    warehouse: 'West Coast Hub',
    dateBucket: 'This week',
    total: 5620.75,
    status: 'Awaiting approval',
    tone: 'accent',
  },
  {
    orderNumber: 'SO-1038',
    customer: 'Union Square Cafe Co.',
    orderDate: 'Sep 05',
    deliveryDate: 'Sep 12',
    warehouse: 'Main DC',
    dateBucket: 'This month',
    total: 2145.0,
    status: 'Confirmed',
    tone: 'strong',
  },
  {
    orderNumber: 'SO-1037',
    customer: 'Harbor & Vine Imports',
    orderDate: 'Sep 03',
    deliveryDate: 'Sep 11',
    warehouse: 'East Coast Hub',
    dateBucket: 'This month',
    total: 11760.4,
    status: 'Confirmed',
    tone: 'strong',
  },
  {
    orderNumber: 'SO-1035',
    customer: 'Northwind Traders',
    orderDate: 'Aug 28',
    deliveryDate: 'Sep 08',
    warehouse: 'Main DC',
    dateBucket: 'Last 30 days',
    total: 8410.0,
    status: 'Partially delivered',
    tone: 'danger',
  },
  {
    orderNumber: 'SO-1029',
    customer: 'Meridian Fitness Clubs',
    orderDate: 'Aug 20',
    deliveryDate: 'Aug 30',
    warehouse: 'West Coast Hub',
    dateBucket: 'Last 30 days',
    total: 1275.6,
    status: 'Closed',
    tone: 'neutral',
  },
  {
    orderNumber: 'SO-1024',
    customer: 'Solstice Home Goods',
    orderDate: 'Aug 12',
    deliveryDate: 'Aug 22',
    warehouse: 'East Coast Hub',
    dateBucket: 'Last 30 days',
    total: 6930.25,
    status: 'Closed',
    tone: 'neutral',
  },
];

// The status tabs (All/Draft/Awaiting approval/Confirmed/Partially delivered/Closed) are the
// reference's own tab set, not the smaller STATUS_ITEMS list the Status dropdown-equivalent
// would use — kept as a separate, ordered constant instead of deriving it from SALES_ORDERS so
// "All" reliably sorts first and every tab shows even a status with zero current rows.
const STATUS_TABS = ['All', 'Draft', 'Awaiting approval', 'Confirmed', 'Partially delivered', 'Closed'];

const CUSTOMER_ITEMS = ['All customers', ...Array.from(new Set(SALES_ORDERS.map((order) => order.customer)))];
const DATE_RANGE_ITEMS = ['Any time', ...Array.from(new Set(SALES_ORDERS.map((order) => order.dateBucket)))];
const WAREHOUSE_ITEMS = ['All warehouses', ...Array.from(new Set(SALES_ORDERS.map((order) => order.warehouse)))];

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * A sales-order list page, mirroring `templates/erp-skeleton`'s "10 · Sales order — list"
 * business mockup (Claude Design project "Busy Office Design System"): header actions, a
 * filter-Chip-as-tabs status row, a search field plus three real `Dropdown` filters (Customer,
 * Date range, Warehouse), a bulk-actions control, and a real `Table` of sales orders with a
 * status `Chip` column. Structural first pass (ROADMAP M6, issue #17, batch 3) — composition and
 * content match the reference, not an independently pixel-measured/contrast-audited pass. Meant
 * to render as the content inside `AppShell` (module="Sales", route label "Sales orders" — the
 * plural list view, distinct from `AppShell.tsx`'s existing singular "Sales order" route, which
 * is RecordDetail.tsx's detail view) — see AppShell.tsx's `NAV.Sales` and `preview/client.tsx`'s
 * routing for the wiring.
 *
 * Only the search field and the Customer/Date range/Warehouse `Dropdown`s are wired to real
 * `useState` filtering, the same pattern `ListReport.tsx` (this batch's reference) uses for its
 * own toolbar. The status tabs are deliberately NOT wired to filtering — matching Notifications.tsx
 * and RolePage.tsx's own filter-Chip-as-tabs precedent for this milestone's structural-first-pass
 * scope, only "All" renders selected and the rest are present-but-inactive. "Bulk actions" renders
 * as a static secondary `Button` with no selection mechanism behind it (no row-selection checkbox
 * column here, unlike `ListReport.tsx`) — the spec for this page asks for the control's presence,
 * not real multi-select wiring, for this pass.
 */
export function SalesOrderList() {
  const [query, setQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState(CUSTOMER_ITEMS[0]);
  const [dateRangeFilter, setDateRangeFilter] = useState(DATE_RANGE_ITEMS[0]);
  const [warehouseFilter, setWarehouseFilter] = useState(WAREHOUSE_ITEMS[0]);

  const rows = SALES_ORDERS.filter((order) => {
    if (customerFilter !== CUSTOMER_ITEMS[0] && order.customer !== customerFilter) return false;
    if (dateRangeFilter !== DATE_RANGE_ITEMS[0] && order.dateBucket !== dateRangeFilter) return false;
    if (warehouseFilter !== WAREHOUSE_ITEMS[0] && order.warehouse !== warehouseFilter) return false;
    if (query) {
      const haystack = `${order.orderNumber} ${order.customer}`.toLowerCase();
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
          <Text variant="heading">Sales orders</Text>
          <div style={{ flex: 1 }} />
          <Button type="button" variant="secondary">
            Export
          </Button>
          <Button type="button" variant="primary">
            + New order
          </Button>
        </div>
      </Density>

      <FilterTabs tabs={STATUS_TABS} selected="All" />

      <Density value="compact">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 240 }}>
            <Input
              aria-label="Search sales orders"
              placeholder="Search sales orders…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              size="search"
            />
          </div>
          <Dropdown
            label={`Customer · ${customerFilter}`}
            items={CUSTOMER_ITEMS.map((label) => ({ label, selected: label === customerFilter }))}
            onSelect={setCustomerFilter}
            active={customerFilter !== CUSTOMER_ITEMS[0]}
          />
          <Dropdown
            label={`Date range · ${dateRangeFilter}`}
            items={DATE_RANGE_ITEMS.map((label) => ({ label, selected: label === dateRangeFilter }))}
            onSelect={setDateRangeFilter}
            active={dateRangeFilter !== DATE_RANGE_ITEMS[0]}
          />
          <Dropdown
            label={`Warehouse · ${warehouseFilter}`}
            items={WAREHOUSE_ITEMS.map((label) => ({ label, selected: label === warehouseFilter }))}
            onSelect={setWarehouseFilter}
            active={warehouseFilter !== WAREHOUSE_ITEMS[0]}
          />
          <div style={{ flex: 1 }} />
          <Button type="button" variant="secondary">
            Bulk actions
          </Button>
        </div>
      </Density>

      <div
        role="region"
        aria-label="Sales orders table"
        tabIndex={0}
        style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
      >
        <div style={{ minWidth: 760 }}>
          <Density value="compact">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Order #</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Order date</TableHeaderCell>
                  <TableHeaderCell>Delivery date</TableHeaderCell>
                  <TableHeaderCell align="end">Total</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((order) => (
                  <TableRow key={order.orderNumber}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>{order.deliveryDate}</TableCell>
                    <TableCell align="end">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Chip variant="status" tone={order.tone}>
                        {order.status}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Text variant="caption">No sales orders match these filters.</Text>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Density>
        </div>
      </div>
    </div>
  );
}
