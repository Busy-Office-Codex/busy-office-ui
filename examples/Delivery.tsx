import { Button, Card, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';

/**
 * A deliveries list + detail page: a view-mode toggle, status-Chip-as-tabs
 * row, a `Table` of shipments, and a tracking detail panel for one delivery.
 * Mirrors `templates/erp-skeleton`'s "12 Delivery" screen (list + kanban
 * toggle + detail). Meant to render as the content inside `AppShell`
 * (module="Sales", route "Delivery" — `AppShell.tsx`'s `NAV.Sales` already
 * lists "Delivery" as a sibling of "Sales order"/"Invoice").
 *
 * List view only, per this milestone's structural-first-pass scope: the
 * reference's List/Board/Map/Calendar toggle is a real row of filter
 * `Chip`s with "List" selected, but Board/Map/Calendar render as
 * present-but-inactive chips with no view behind them — same judgment as
 * Profile.tsx/RolePage.tsx/Notifications.tsx's inactive tabs. The status
 * tabs below it (Today/To pick/Packed/In transit/Delivered/Exceptions) are
 * the same filter-Chip-as-tabs pattern with only "Today" selected and no
 * filtering logic wired, again matching that precedent.
 *
 * The detail panel below the table is a single static pairing with
 * `DETAIL_DELIVERY_ID` (its table row gets a light highlight) rather than a
 * full click-to-switch table — same judgment Inbox.tsx's right pane already
 * made for this milestone's scope. `ChipTone` only has 4 tones for this
 * table's 5 distinct statuses, so `STATUS_TONE` reuses "strong" for both
 * "In transit" and "Delivered" (both read as forward/positive progress,
 * distinguished by their own label text) — a judgment call, not a new tone.
 *
 * `TrackingTimeline` below is a small file-local helper (same precedent as
 * ListReport.tsx's `ShimmerBar`/`StatTile` and Notifications.tsx's
 * `NotificationRow`), not a new package export: a vertical connector list of
 * plain styled `<span>`/`<div>`s, no new component or prop.
 */

type DeliveryStatus = 'To pick' | 'Packed' | 'In transit' | 'Delivered' | 'Exception';

type DeliveryRow = {
  id: string;
  order: string;
  customer: string;
  shipDate: string;
  carrier: string;
  status: DeliveryStatus;
};

const STATUS_TONE: Record<DeliveryStatus, ChipTone> = {
  'To pick': 'neutral',
  Packed: 'accent',
  'In transit': 'strong',
  Delivered: 'strong',
  Exception: 'danger',
};

// Customers reuse RolePage.tsx's work-queue accounts (Northwind Traders, Bluepeak Logistics,
// Solstice Home Goods, Ironclad Security Systems, Fenwick Retail Group) and SO-1038 continues
// Notifications.tsx's "SO-1038 was confirmed" — one shared sample world across the examples,
// not a fresh cast for this file. SO-1042 (RecordDetail.tsx/Inbox.tsx's own "Awaiting approval"
// order) is deliberately NOT reused here: an order still awaiting approval wouldn't plausibly
// already have an in-transit delivery, so this file's Northwind Traders rows use different SO
// numbers instead.
const DETAIL_DELIVERY_ID = 'DL-0231';

const DELIVERIES: DeliveryRow[] = [
  { id: 'DL-0231', order: 'SO-1050', customer: 'Northwind Traders', shipDate: 'Sep 14', carrier: 'FreightLine Express', status: 'In transit' },
  { id: 'DL-0229', order: 'SO-1038', customer: 'Bluepeak Logistics', shipDate: 'Sep 14', carrier: 'Regional Courier Co.', status: 'Delivered' },
  { id: 'DL-0233', order: 'SO-1044', customer: 'Solstice Home Goods', shipDate: 'Sep 14', carrier: 'FreightLine Express', status: 'Packed' },
  { id: 'DL-0235', order: 'SO-1046', customer: 'Ironclad Security Systems', shipDate: 'Sep 15', carrier: 'Continental Freight', status: 'To pick' },
  { id: 'DL-0227', order: 'SO-1049', customer: 'Fenwick Retail Group', shipDate: 'Sep 13', carrier: 'Regional Courier Co.', status: 'Delivered' },
  { id: 'DL-0230', order: 'SO-1043', customer: 'Northwind Traders', shipDate: 'Sep 14', carrier: 'Continental Freight', status: 'Exception' },
  { id: 'DL-0234', order: 'SO-1045', customer: 'Bluepeak Logistics', shipDate: 'Sep 16', carrier: 'FreightLine Express', status: 'To pick' },
];

const VIEW_TABS = ['List', 'Board', 'Map', 'Calendar'] as const;
const STATUS_TABS = ['Today', 'To pick', 'Packed', 'In transit', 'Delivered', 'Exceptions'] as const;

type TrackingStep = {
  label: string;
  detail: string;
  done: boolean;
  current?: boolean;
};

const TRACKING_STEPS: TrackingStep[] = [
  { label: 'Picked', detail: 'Sep 14, 8:02 AM · Warehouse 3', done: true },
  { label: 'Packed', detail: 'Sep 14, 11:20 AM', done: true },
  { label: 'In transit', detail: 'Sep 15, 6:45 AM · FreightLine Express', done: false, current: true },
  { label: 'Delivered · POD', detail: 'Pending', done: false },
];

/**
 * A vertical step sequence: a filled/outline dot per step (a non-color cue,
 * not just a color change) connected by a spine line, plus the label/detail
 * text. `aria-current="step"` marks the in-progress step — the correct ARIA
 * token for a step in a sequential process, not a generic "selected" state.
 */
function TrackingTimeline({ steps }: { steps: TrackingStep[] }) {
  return (
    <ol
      aria-label="Delivery tracking"
      style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: 0, padding: 0, listStyle: 'none' }}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const filled = step.done || step.current;
        return (
          <li
            key={step.label}
            aria-current={step.current ? 'step' : undefined}
            style={{ display: 'flex', gap: 12 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12, flexShrink: 0 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  background: filled ? '#0f172a' : '#ffffff',
                  border: `2px solid ${filled ? '#0f172a' : '#cbd5e1'}`,
                }}
              />
              {!isLast && (
                <span
                  aria-hidden="true"
                  style={{ width: 2, flex: 1, minHeight: 24, background: step.done ? '#0f172a' : '#e2e8f0' }}
                />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: isLast ? 0 : 16 }}>
              <Text variant={step.current ? 'body' : 'caption'} as="span">
                {step.label}
              </Text>
              <Text variant="caption">{step.detail}</Text>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Delivery() {
  const detail = DELIVERIES.find((row) => row.id === DETAIL_DELIVERY_ID)!;

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 1120, margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Text variant="heading">Delivery</Text>

        {/* View-mode toggle — only "List" has real content behind it this pass. */}
        <Density value="compact">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {VIEW_TABS.map((view) => (
              <Chip key={view} variant="filter" selected={view === 'List'}>
                {view}
              </Chip>
            ))}
          </div>
        </Density>

        {/* Status tabs — filter-Chip-as-tabs, only "Today" selected. */}
        <Density value="compact">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_TABS.map((tab) => (
              <Chip key={tab} variant="filter" selected={tab === 'Today'}>
                {tab}
              </Chip>
            ))}
          </div>
        </Density>

        <div
          role="region"
          aria-label="Deliveries table"
          tabIndex={0}
          style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
        >
          <div style={{ minWidth: 720 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Delivery #</TableHeaderCell>
                    <TableHeaderCell>Order</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Ship date</TableHeaderCell>
                    <TableHeaderCell>Carrier</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DELIVERIES.map((row) => (
                    <TableRow
                      key={row.id}
                      // Light highlight tying this row to the detail panel below it — a plain
                      // inline style, not a new `TableRow` prop (AGENTS.md: no prop/export with a
                      // single caller).
                      style={row.id === DETAIL_DELIVERY_ID ? { backgroundColor: '#eff6ff' } : undefined}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.order}</TableCell>
                      <TableCell>{row.customer}</TableCell>
                      <TableCell>{row.shipDate}</TableCell>
                      <TableCell>{row.carrier}</TableCell>
                      <TableCell>
                        <Chip variant="status" tone={STATUS_TONE[row.status]}>
                          {row.status}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Density>
          </div>
        </div>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Text variant="title">{detail.id}</Text>
              <Chip variant="status" tone={STATUS_TONE[detail.status]}>
                {detail.status}
              </Chip>
              <div style={{ flex: 1 }} />
              <Text variant="caption">
                {detail.order} · {detail.customer}
              </Text>
            </div>

            <TrackingTimeline steps={TRACKING_STEPS} />

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 280px', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="caption" as="span">
                  Route
                </Text>
                {/* Plain gray placeholder block — no real map, labeled as such for a sighted
                    reader via its own visible text (no ARIA needed: the text is the accessible
                    content, same as any other text-bearing div in this file). */}
                <div
                  style={{
                    height: 160,
                    borderRadius: 10,
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant="caption">Map placeholder — not implemented in this pass</Text>
                </div>
              </div>
              <div style={{ flex: '1 1 220px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="caption" as="span">
                  Ship to
                </Text>
                <Text variant="body">1220 NW Marina Blvd, Portland, OR 97209</Text>
                <Text variant="caption">
                  {detail.carrier} · Tracking FLE-88213
                </Text>
              </div>
            </div>

            <Density value="compact">
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button type="button" variant="secondary">
                  Print label
                </Button>
                <Button type="button" variant="primary">
                  Confirm delivered
                </Button>
              </div>
            </Density>
          </div>
        </Card>
      </div>
    </div>
  );
}
