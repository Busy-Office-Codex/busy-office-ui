import { useState } from 'react';
import { Button, Card, Chart, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore } from './data/appStore.js';
import { useStoreState } from './data/store.js';
import { color, space } from '../src/tokens.stylex.js';

/**
 * A real cross-domain exceptions dashboard (ROADMAP M7's ERP reference-app initiative, Slice 5,
 * Analytics) — the brief's own named journey: "dashboard exception → filtered worklist → record
 * details → relevant action". Every number here is computed live from the shared store, not
 * hardcoded sample copy.
 *
 * "Open" sets `focusRecordId` (examples/data/appStore.ts's `useFocusRecord`) so that record's
 * owning screen pre-selects it the moment you land there — a genuine drill-down, not a
 * same-named coincidence between two static pages. It does NOT also change the active route:
 * Shell (src/shell/Shell.tsx) owns navigation state centrally, and every content pane —
 * Analytics included — is a plain, route-agnostic component with no navigate callback of its
 * own (preview/client.tsx's `panes` map is exactly that: id → element, nothing more). Threading
 * a navigate function through that map for this one screen would be a bigger, disproportionate
 * change for one convenience click, so "Open" gives real, visible confirmation that the focus
 * was set (the button flips to a checked "Ready" state) and leaves the actual move to the app
 * strip/command palette, same as every other cross-module jump in this app.
 *
 * Deliberately does NOT add a date-range/org picker: nothing else in this reference app models
 * multiple periods or multiple orgs, so a decorative filter control that didn't actually filter
 * anything would violate the brief's own "every action must visibly work or be honestly
 * disabled" guardrail. What's real here — live counts, a real chart, a real drill-down — is
 * exactly what a decorative filter would have distracted from.
 */

const MODULE_SHORT_NAME: Record<string, string> = {
  Sales: 'Sales',
  Purchase: 'Purchase',
  Production: 'Production',
  Finance: 'Finance',
};

export function Analytics() {
  const state = useStoreState(appStore, (s) => s);

  const openQuotations = Object.values(state.quotations).filter((q) => q.status === 'sent');
  const openPurchaseOrders = Object.values(state.purchaseOrders).filter((po) => po.status !== 'received' && po.status !== 'cancelled');
  const pendingRequisitions = Object.values(state.requisitions).filter((r) => r.status === 'pending_approval');
  const openRecommendations = Object.values(state.planningRecommendations).filter((r) => r.status === 'open');
  const activeProductionOrders = Object.values(state.productionOrders).filter((o) => o.status === 'released' || o.status === 'in_progress');
  const unpaidInvoices = Object.values(state.invoices).filter((inv) => inv.status === 'sent' || inv.status === 'overdue');
  const lowStock = state.stockLevels.filter((level) => level.qtyOnHand - level.qtyReserved <= 5);

  const openByModule = [
    { label: 'Sales', value: openQuotations.length },
    { label: 'Purchase', value: openPurchaseOrders.length + pendingRequisitions.length },
    { label: 'Production', value: openRecommendations.length + activeProductionOrders.length },
    { label: 'Finance', value: unpaidInvoices.length },
  ];

  const firstRequisition = pendingRequisitions[0];
  const firstInvoice = unpaidInvoices[0];
  const firstRecommendation = openRecommendations[0];

  const [readyId, setReadyId] = useState<string | null>(null);

  return (
    <div
      style={{
        background: color.bgCanvas,
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: space.space6,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: space.space5 }}>
        <Text variant="heading">Analytics</Text>

        <div style={{ border: `1px solid ${color.border}`, borderRadius: 10, background: color.bgSurface, padding: space.space6, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
            <Text variant="title">Open work by module</Text>
            <Chart type="bar" title="Open work items by module" valueLabel="items" data={openByModule} height={200} />
          </div>
        </div>

        <Text variant="title">Exceptions</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.space3 }}>
          <ExceptionCard
            message={`${pendingRequisitions.length} requisition${pendingRequisitions.length === 1 ? '' : 's'} awaiting approval`}
            destination={`${MODULE_SHORT_NAME.Purchase} · Requisitions`}
            targetId={firstRequisition?.id}
            readyId={readyId}
            onOpen={(id) => {
              appActions.focusRecord(id);
              setReadyId(id);
            }}
          />

          <ExceptionCard
            message={`${unpaidInvoices.length} invoice${unpaidInvoices.length === 1 ? '' : 's'} awaiting payment`}
            destination={`${MODULE_SHORT_NAME.Finance} · Billing`}
            targetId={firstInvoice?.id}
            readyId={readyId}
            onOpen={(id) => {
              appActions.focusRecord(id);
              setReadyId(id);
            }}
          />

          <ExceptionCard
            message={`${openRecommendations.length} planning recommendation${openRecommendations.length === 1 ? '' : 's'} open`}
            destination={`${MODULE_SHORT_NAME.Production} · Planning`}
            targetId={firstRecommendation?.id}
            readyId={readyId}
            onOpen={(id) => {
              appActions.focusRecord(id);
              setReadyId(id);
            }}
          />

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.space3, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Text variant="body">
                  {lowStock.length} material{lowStock.length === 1 ? '' : 's'} at or below 5 units available
                </Text>
                <Text variant="caption">{MODULE_SHORT_NAME.Purchase} · Inventory — see the table below</Text>
              </div>
            </div>
          </Card>
        </div>

        {lowStock.length > 0 && (
          <div
            role="region"
            aria-label="Low stock table"
            tabIndex={0}
            style={{ border: `1px solid ${color.border}`, borderRadius: 10, background: color.bgSurface, overflowX: 'auto' }}
          >
            <div style={{ minWidth: 480 }}>
              <Density value="compact">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Material</TableHeaderCell>
                      <TableHeaderCell>Warehouse</TableHeaderCell>
                      <TableHeaderCell align="end">Available</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStock.map((level) => (
                      <TableRow key={`${level.productId}:${level.warehouseId}`}>
                        <TableCell>{state.products[level.productId]?.description}</TableCell>
                        <TableCell>{state.warehouses[level.warehouseId]?.name}</TableCell>
                        <TableCell align="end">{level.qtyOnHand - level.qtyReserved}</TableCell>
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

function ExceptionCard({
  message,
  destination,
  targetId,
  readyId,
  onOpen,
}: {
  message: string;
  destination: string;
  targetId: string | undefined;
  readyId: string | null;
  onOpen: (id: string) => void;
}) {
  const isReady = targetId !== undefined && targetId === readyId;
  return (
    <Card>
      <div role="group" aria-label={message} style={{ display: 'flex', alignItems: 'center', gap: space.space3, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Text variant="body">{message}</Text>
          <Text variant="caption">{destination}</Text>
        </div>
        <Density value="compact">
          <Button
            type="button"
            variant={isReady ? 'primary' : 'secondary'}
            disabled={!targetId}
            onClick={() => targetId && onOpen(targetId)}
          >
            {isReady ? `Ready — open ${destination.split('· ')[1]}` : 'Open'}
          </Button>
        </Density>
      </div>
    </Card>
  );
}
