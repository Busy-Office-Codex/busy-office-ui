import { useState } from 'react';
import { Button, Card, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore, useFocusRecord } from './data/appStore.js';
import { documentTotal } from './data/types.js';
import { useStoreState } from './data/store.js';

/**
 * Deliveries list + detail, now reading live from the shared store (ROADMAP M7's ERP
 * reference-app initiative, Slice 7, Distribution — the brief's own named transaction family,
 * alongside Procurement/Inventory/Sales/Billing/Production planning). Same list-plus-detail-
 * in-one-route pattern as Requisitions.tsx/ProductionOrders.tsx: picking, packing, shipment and
 * delivery confirmation are one real lifecycle on one record (`appActions.advanceDeliveryStatus`,
 * already built in Slice 1 but never wired to a screen until now), not four separate routes.
 *
 * Upgraded in place rather than left as a second parallel screen: this NAV.Sales 'Delivery' slot
 * is already the exact right concept (M6's own static treatment even ships a real
 * `TrackingTimeline` component, kept here, now driven by the record's real status instead of a
 * hardcoded step list). Building a new, differently-labeled screen for the identical subject
 * would have been real duplication — unlike Slice 6's Builder, where Forms/Workflows/Pages are
 * three different builder subjects.
 *
 * The static M6 page's own 7-row sample table (Solstice Home Goods, Ironclad Security Systems,
 * Fenwick Retail Group, DL-0231/0229/0233/0235/0227/0230/0234…) is gone. `DL-0231` was already
 * one of several pre-existing, mutually-contradicting IDs documented in
 * examples/data/seed.ts's own header comment before this file touched it — Invoice.tsx's own
 * static page still mentions it in passing, an existing soft inconsistency this change doesn't
 * make any worse (there were already 2-3 conflicting definitions of it scattered across four
 * files; this is simply one fewer).
 */

const STATUS_TONE: Record<string, ChipTone> = {
  pending: 'neutral',
  picking: 'accent',
  packed: 'accent',
  shipped: 'strong',
  delivered: 'strong',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  picking: 'Picking',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

const SEQUENCE = ['pending', 'picking', 'packed', 'shipped', 'delivered'] as const;

const STEP_DETAIL: Record<(typeof SEQUENCE)[number], string> = {
  pending: 'Awaiting warehouse pick',
  picking: 'Being picked from stock',
  packed: 'Packed, ready to ship',
  shipped: 'In transit to customer',
  delivered: 'Delivered — proof of delivery on file',
};

function TrackingTimeline({ status }: { status: string }) {
  const currentIndex = SEQUENCE.indexOf(status as (typeof SEQUENCE)[number]);
  return (
    <ol aria-label="Delivery tracking" style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: 0, padding: 0, listStyle: 'none' }}>
      {SEQUENCE.map((step, index) => {
        const isLast = index === SEQUENCE.length - 1;
        const done = index < currentIndex;
        const current = index === currentIndex;
        const filled = done || current;
        return (
          <li key={step} aria-current={current ? 'step' : undefined} style={{ display: 'flex', gap: 12 }}>
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
              {!isLast && <span aria-hidden="true" style={{ width: 2, flex: 1, minHeight: 24, background: done ? '#0f172a' : '#e2e8f0' }} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: isLast ? 0 : 16 }}>
              <Text variant={current ? 'body' : 'caption'} as="span">
                {STATUS_LABEL[step]}
              </Text>
              <Text variant="caption">{STEP_DETAIL[step]}</Text>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Delivery() {
  const state = useStoreState(appStore, (s) => s);
  const deliveryList = Object.values(state.deliveries).sort((a, b) => (a.id < b.id ? 1 : -1));
  const [selectedId, setSelectedId] = useState(deliveryList[0]?.id ?? '');
  useFocusRecord(
    (id) => Boolean(state.deliveries[id]),
    (id) => setSelectedId(id),
  );
  const selected = state.deliveries[selectedId];
  const customer = selected ? state.customers[selected.customerId] : undefined;
  const nextStatus = selected ? SEQUENCE[SEQUENCE.indexOf(selected.status as (typeof SEQUENCE)[number]) + 1] : undefined;

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
        <Text variant="heading">Delivery</Text>

        <div
          role="region"
          aria-label="Deliveries table"
          tabIndex={0}
          style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
        >
          <div style={{ minWidth: 640 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Delivery #</TableHeaderCell>
                    <TableHeaderCell>Order</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Carrier</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveryList.map((delivery) => (
                    <TableRow
                      key={delivery.id}
                      onClick={() => setSelectedId(delivery.id)}
                      style={{ cursor: 'pointer', backgroundColor: delivery.id === selectedId ? '#eff6ff' : undefined }}
                    >
                      <TableCell>{delivery.id}</TableCell>
                      <TableCell>{delivery.salesOrderId}</TableCell>
                      <TableCell>{state.customers[delivery.customerId]?.name}</TableCell>
                      <TableCell>{delivery.carrier ?? '—'}</TableCell>
                      <TableCell>
                        <Chip variant="status" tone={STATUS_TONE[delivery.status]}>
                          {STATUS_LABEL[delivery.status]}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Density>
          </div>
        </div>

        {selected && customer && (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Text variant="title">{selected.id}</Text>
                <Chip variant="status" tone={STATUS_TONE[selected.status]}>
                  {STATUS_LABEL[selected.status]}
                </Chip>
                <div style={{ flex: 1 }} />
                <Text variant="caption">
                  {selected.salesOrderId} · {customer.name}
                </Text>
              </div>

              <TrackingTimeline status={selected.status} />

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 220px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Text variant="caption" as="span">
                    Ship to
                  </Text>
                  <Text variant="body">{customer.billingAddress.line1}</Text>
                  <Text variant="caption">{customer.billingAddress.cityStateZip}</Text>
                  <Text variant="caption">
                    {selected.carrier ?? 'Carrier not yet assigned'}
                    {selected.trackingNumber ? ` · Tracking ${selected.trackingNumber}` : ''}
                  </Text>
                </div>
                <div style={{ flex: '1 1 220px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text variant="caption" as="span">
                    Contents
                  </Text>
                  {selected.lines.map((line) => (
                    <Text key={line.productId} variant="body">
                      {line.qty} × {line.description}
                    </Text>
                  ))}
                  <Text variant="caption">{documentTotal(selected.lines).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Text>
                </div>
              </div>

              {nextStatus && (
                <Density value="compact">
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <Button type="button" variant="primary" onClick={() => appActions.advanceDeliveryStatus(selected.id)}>
                      Advance to {STATUS_LABEL[nextStatus]}
                    </Button>
                  </div>
                </Density>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
