import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import {
  Button,
  Card,
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
import { color } from '../src/tokens.stylex.js';

// ROADMAP item 12 (2026-09-14 design review, confirmed LOW finding): the row-selection
// checkboxes were bare native `<input type="checkbox">` — unstyled, browser-default appearance
// (13x13px, square corners, UA accent color). The reference (`templates/erp-skeleton/
// Table.dc.html`) draws them at 16x16, radius 4, `border #cbd5e1`. Scoped to this file
// deliberately, not a new `Checkbox` export — this repo's Objective 2 "Proven Reuse" test wants
// two named consumers before a shared component earns its keep, and this file is currently the
// only one. `:focus-visible` is a CSS pseudo-class a plain React `style` object can't express, so
// — same precedent as examples/AppShell.tsx's notification button — a small scoped
// `stylex.create` block handles just these two checkboxes; the outline treatment matches the
// shared focus ring every other focusable control in this repo uses (Button/Input/Dropdown/Chip/
// AppShell's notification button): 2px `color.focusRing` outline, 2px offset, `:focus-visible`
// only.
const checkboxStyles = stylex.create({
  checkbox: {
    width: '16px',
    height: '16px',
    // A browser's native checkbox widget (appearance: auto, the default) honors width/height but
    // silently ignores border-radius/border-color/background-color — verified directly: without
    // `appearance: 'none'` this rendered a real 16x16 box (that assertion passed) but a flat 0px
    // border-radius (that assertion failed) regardless of the declared 4px. `appearance: none`
    // fixes that, at the cost of also discarding the native checked-state tick — replaced below
    // with a solid-fill `:checked` treatment (same visual language as filter `Chip`'s
    // selected-fills-solid pattern elsewhere in this design system), not a redrawn glyph; the
    // element is still a real `<input type="checkbox">`, so `:checked`/keyboard/form semantics
    // and screen-reader announcement are unaffected — only the paint changes.
    appearance: 'none',
    margin: 0,
    cursor: 'pointer',
    // Off this package's 4px+ radius scale on the low end (`radius.sm` is 6px, no 4px token) —
    // a literal matching the reference exactly, same category as other hand-measured literals
    // already in this codebase (e.g. the badge's `1px 6px` padding from ROADMAP item 13).
    borderRadius: '4px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: {
      default: color.borderStrong,
      ':checked': color.action,
    },
    backgroundColor: {
      default: color.bgSurface,
      ':checked': color.action,
    },
    outlineStyle: 'solid',
    outlineOffset: '2px',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.focusRing,
    },
    outlineWidth: {
      default: 0,
      ':focus-visible': '2px',
    },
  },
});

type Order = {
  po: string;
  supplier: string;
  buyer: string;
  expected: string;
  receivedLabel: string;
  fullyReceived: boolean;
  dueThisWeek: boolean;
  total: number;
  status: string;
  tone: ChipTone;
};

const ORDERS: Order[] = [
  {
    po: 'PO-1042',
    supplier: 'Alden Paper Co.',
    buyer: 'Jordan Lee',
    expected: 'Sep 18',
    receivedLabel: '—',
    fullyReceived: false,
    dueThisWeek: true,
    total: 1240.0,
    status: 'Awaiting approval',
    tone: 'accent',
  },
  {
    po: 'PO-1041',
    supplier: 'Northgate Office Supply',
    buyer: 'Priya Shah',
    expected: 'Sep 10',
    receivedLabel: 'Sep 09',
    fullyReceived: true,
    dueThisWeek: false,
    total: 8960.5,
    status: 'Confirmed',
    tone: 'strong',
  },
  {
    po: 'PO-1038',
    supplier: 'Redline Facilities Group',
    buyer: 'Marcus Webb',
    expected: 'Sep 05',
    receivedLabel: '—',
    fullyReceived: false,
    dueThisWeek: false,
    total: 3415.75,
    status: 'Overdue',
    tone: 'danger',
  },
  {
    po: 'PO-1035',
    supplier: 'Summit Hardware & Tools',
    buyer: 'Priya Shah',
    expected: 'Sep 16',
    receivedLabel: 'Partial',
    fullyReceived: false,
    dueThisWeek: true,
    total: 620.0,
    status: 'Confirmed',
    tone: 'strong',
  },
  {
    po: 'PO-1029',
    supplier: 'Cascade IT Distribution',
    buyer: 'Jordan Lee',
    expected: 'Sep 24',
    receivedLabel: '—',
    fullyReceived: false,
    dueThisWeek: false,
    total: 14802.2,
    status: 'Awaiting approval',
    tone: 'accent',
  },
  {
    po: 'PO-1021',
    supplier: 'Harborline Print & Signage',
    buyer: 'Marcus Webb',
    expected: 'Sep 02',
    receivedLabel: '—',
    fullyReceived: false,
    dueThisWeek: false,
    total: 975.4,
    status: 'Overdue',
    tone: 'danger',
  },
  {
    po: 'PO-1018',
    supplier: 'Meridian Cleaning Supply',
    buyer: 'Priya Shah',
    expected: 'Sep 30',
    receivedLabel: '—',
    fullyReceived: false,
    dueThisWeek: false,
    total: 2150.0,
    status: 'Sent to supplier',
    tone: 'neutral',
  },
  {
    po: 'PO-1012',
    supplier: 'Vantage Electrical Co.',
    buyer: 'Jordan Lee',
    expected: 'Sep 15',
    receivedLabel: '—',
    fullyReceived: false,
    dueThisWeek: true,
    total: 6340.9,
    status: 'Sent to supplier',
    tone: 'neutral',
  },
];

const STATUS_ITEMS = ['All statuses', 'Awaiting approval', 'Confirmed', 'Overdue', 'Sent to supplier'];
const SUPPLIER_ITEMS = ['All suppliers', ...Array.from(new Set(ORDERS.map((order) => order.supplier)))];
const BUYER_ITEMS = ['All buyers', ...Array.from(new Set(ORDERS.map((order) => order.buyer)))];
const EXPECTED_ITEMS = ['Any time', ...Array.from(new Set(ORDERS.map((order) => order.expected)))];

const AWAITING_APPROVAL_COUNT = ORDERS.filter((order) => order.status === 'Awaiting approval').length;
const SENT_TO_SUPPLIER_COUNT = ORDERS.filter((order) => order.status === 'Sent to supplier').length;
const DUE_THIS_WEEK_COUNT = ORDERS.filter((order) => order.dueThisWeek).length;
const OPEN_COMMITMENTS_TOTAL = ORDERS.filter((order) => !order.fullyReceived).reduce((sum, order) => sum + order.total, 0);

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// The loading skeleton's row/header grid mirrors the real Table's column order — a checkbox
// column plus the 7 `dc-import name="Table" heads="PO #,Supplier,Buyer,Expected,Received,Total,
// Status"` columns — so the shimmer state and the real table line up visually.
const SKELETON_GRID_COLUMNS = '44px minmax(80px,1fr) minmax(150px,1.6fr) minmax(110px,1.1fr) 92px 92px 108px 132px';

const skeletonHeaderLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: '#64748b',
};

/**
 * A gray shimmer placeholder bar, standing in for a value that hasn't loaded yet. Values match
 * the owner's loading screenshot: stat tiles are `height:24px;border-radius:6px`, table cells are
 * shorter/less-rounded (a pill radius for the Status column, to echo its Chip shape).
 */
function ShimmerBar({
  width,
  height = 14,
  radius = 4,
  testId = 'cell-shimmer',
}: {
  width: string;
  height?: number;
  radius?: number;
  testId?: string;
}) {
  return <div data-testid={testId} style={{ height, borderRadius: radius, background: '#e2e8f0', width }} />;
}

// ROADMAP item 14 (2026-09-14 design review, confirmed LOW finding): this stat tile used to be a
// hand-rolled `<div>` (padding 14, transparent background, no shadow) while RecordDetail's summary
// cards and Dashboard's KPI tiles both already used the real `Card` component (padding 16, white
// background, shadow) — one tile implementation across all three sample pages now. No `onClick`,
// so `Card` renders as a static, non-interactive tile (its own behavior, not a new prop here).
// `Card`'s 16px padding vs. the reference's measured 14px is an accepted, disclosed deviation
// (see docs/ListReport.md) — not worth a new `Card` padding variant/prop for a 2px difference.
function StatTile({
  label,
  value,
  shimmerWidth,
  loading,
}: {
  label: string;
  value: string;
  shimmerWidth: string;
  loading: boolean;
}) {
  return (
    <Card>
      <Text variant="caption" as="span">
        {label}
      </Text>
      {loading ? (
        <ShimmerBar width={shimmerWidth} height={24} radius={6} testId="stat-shimmer" />
      ) : (
        <Text variant="heading">{value}</Text>
      )}
    </Card>
  );
}

/**
 * `'ready'` (default) shows the table — including the zero-filtered-rows
 * caption ("empty" is a reachable case of `'ready'`, not a separate literal,
 * since it only ever happens as a consequence of the toolbar's own filters).
 * `'loading'` replaces the table region with an announced, non-table shimmer
 * skeleton (stat tiles and every data cell render as gray placeholder bars;
 * the checkbox column stays real, since which rows exist isn't in question,
 * only their content — matching the owner's loading screenshot for this
 * page). `'error'` / `'forbidden'` replace the table region with a
 * state-specific message, the way a real ERP list page degrades while the
 * header/toolbar chrome stays put.
 */
export type ListReportState = 'ready' | 'loading' | 'error' | 'forbidden';

/**
 * A filterable purchase-order list, rebuilt against `templates/erp-skeleton`'s
 * "14 · Purchase order" business mockup (Claude Design project "Busy Office
 * Design System") rather than the generic "list-report" template: a stat-tile
 * strip, a search field plus four real `Dropdown` filters (Supplier, Status,
 * Buyer, Expected — not usable in the Claude Design canvas format, since its
 * `items` prop is an array, see conventions.md), and a real `Table` with a
 * row-selection checkbox column.
 */
export function ListReport({ state = 'ready' }: { state?: ListReportState }) {
  const [supplierFilter, setSupplierFilter] = useState('All suppliers');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [buyerFilter, setBuyerFilter] = useState('All buyers');
  const [expectedFilter, setExpectedFilter] = useState('Any time');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = ORDERS.filter((order) => {
    if (supplierFilter !== 'All suppliers' && order.supplier !== supplierFilter) return false;
    if (statusFilter !== 'All statuses' && order.status !== statusFilter) return false;
    if (buyerFilter !== 'All buyers' && order.buyer !== buyerFilter) return false;
    if (expectedFilter !== 'Any time' && order.expected !== expectedFilter) return false;
    if (query) {
      const haystack = `${order.po} ${order.supplier} ${order.buyer}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const allVisibleSelected = rows.length > 0 && rows.every((order) => selected.has(order.po));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        rows.forEach((order) => next.delete(order.po));
      } else {
        rows.forEach((order) => next.add(order.po));
      }
      return next;
    });
  };

  const toggleOne = (po: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(po)) next.delete(po);
      else next.add(po);
      return next;
    });
  };

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // ROADMAP item 14 (2026-09-14 design review, confirmed MEDIUM finding): the reference
        // (`templates/erp-skeleton/ErpSkeleton.dc.html`, "14 · Purchase order") uses 24px content
        // padding, not this page's old 32px — one shared content frame across all three sample
        // pages (see RecordDetail.tsx/Dashboard.tsx for the matching change).
        padding: 24,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <Density value="compact">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Text variant="heading">Purchase orders</Text>
          <div style={{ flex: 1 }} />
          <Button variant="secondary">From requisition</Button>
          <Button variant="primary">+ New PO</Button>
        </div>
      </Density>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatTile label="Awaiting approval" value={String(AWAITING_APPROVAL_COUNT)} shimmerWidth="40%" loading={state === 'loading'} />
        <StatTile label="Sent to supplier" value={String(SENT_TO_SUPPLIER_COUNT)} shimmerWidth="35%" loading={state === 'loading'} />
        <StatTile label="Due to receive this week" value={String(DUE_THIS_WEEK_COUNT)} shimmerWidth="45%" loading={state === 'loading'} />
        <StatTile label="Open commitments" value={formatCurrency(OPEN_COMMITMENTS_TOTAL)} shimmerWidth="60%" loading={state === 'loading'} />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 280 }}>
          <Input
            placeholder="Search POs…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            size="search"
          />
        </div>
        <Dropdown
          label={`Supplier · ${supplierFilter}`}
          items={SUPPLIER_ITEMS.map((label) => ({ label, selected: label === supplierFilter }))}
          onSelect={setSupplierFilter}
          active={supplierFilter !== SUPPLIER_ITEMS[0]}
        />
        <Dropdown
          label={`Status · ${statusFilter}`}
          items={STATUS_ITEMS.map((label) => ({ label, selected: label === statusFilter }))}
          onSelect={setStatusFilter}
          active={statusFilter !== STATUS_ITEMS[0]}
        />
        <Dropdown
          label={`Buyer · ${buyerFilter}`}
          items={BUYER_ITEMS.map((label) => ({ label, selected: label === buyerFilter }))}
          onSelect={setBuyerFilter}
          active={buyerFilter !== BUYER_ITEMS[0]}
        />
        <Dropdown
          label={`Expected · ${expectedFilter}`}
          items={EXPECTED_ITEMS.map((label) => ({ label, selected: label === expectedFilter }))}
          onSelect={setExpectedFilter}
          active={expectedFilter !== EXPECTED_ITEMS[0]}
        />
      </div>

      {state === 'loading' && (
        <div role="status" aria-label="Loading purchase orders" style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: SKELETON_GRID_COLUMNS,
              alignItems: 'center',
              gap: 16,
              paddingBlock: 12,
              paddingInline: 16,
              background: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <input type="checkbox" aria-label="Select all rows" disabled />
            <span style={skeletonHeaderLabelStyle}>PO #</span>
            <span style={skeletonHeaderLabelStyle}>Supplier</span>
            <span style={skeletonHeaderLabelStyle}>Buyer</span>
            <span style={skeletonHeaderLabelStyle}>Expected</span>
            <span style={skeletonHeaderLabelStyle}>Received</span>
            <span style={{ ...skeletonHeaderLabelStyle, textAlign: 'end' }}>Total</span>
            <span style={skeletonHeaderLabelStyle}>Status</span>
          </div>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: SKELETON_GRID_COLUMNS,
                alignItems: 'center',
                gap: 16,
                paddingBlock: 12,
                paddingInline: 16,
                borderBottom: index < 7 ? '1px solid #e2e8f0' : 'none',
              }}
            >
              <input type="checkbox" aria-label={`Row ${index + 1} loading`} disabled />
              <ShimmerBar width="70%" />
              <ShimmerBar width="85%" />
              <ShimmerBar width="65%" />
              <ShimmerBar width="55%" />
              <ShimmerBar width="50%" />
              <ShimmerBar width="60%" />
              <ShimmerBar width="45%" height={18} radius={999} />
            </div>
          ))}
        </div>
      )}

      {state === 'error' && (
        <Card role="alert">
          <Text variant="body">Purchase orders couldn't be loaded. Try again.</Text>
          <Density value="compact">
            <Button variant="secondary">Retry</Button>
          </Density>
        </Card>
      )}

      {state === 'forbidden' && (
        <Card role="status">
          <Text variant="body">You don't have access to purchase orders. Ask an admin for the Purchasing role.</Text>
        </Card>
      )}

      {state === 'ready' && (
        <div role="region" aria-label="Purchase orders table" tabIndex={0} style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}>
          <div style={{ minWidth: 760 }}>
          <Density value="compact">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    {...stylex.props(checkboxStyles.checkbox)}
                  />
                </TableHeaderCell>
                <TableHeaderCell>PO #</TableHeaderCell>
                <TableHeaderCell>Supplier</TableHeaderCell>
                <TableHeaderCell>Buyer</TableHeaderCell>
                <TableHeaderCell>Expected</TableHeaderCell>
                <TableHeaderCell>Received</TableHeaderCell>
                <TableHeaderCell align="end">Total</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((order) => (
                <TableRow key={order.po}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select ${order.po}`}
                      checked={selected.has(order.po)}
                      onChange={() => toggleOne(order.po)}
                      {...stylex.props(checkboxStyles.checkbox)}
                    />
                  </TableCell>
                  <TableCell>{order.po}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{order.buyer}</TableCell>
                  <TableCell>{order.expected}</TableCell>
                  <TableCell>{order.receivedLabel}</TableCell>
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
                  <TableCell colSpan={8}>
                    <Text variant="caption">No purchase orders match these filters.</Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </Density>
          </div>
        </div>
      )}
    </div>
  );
}
