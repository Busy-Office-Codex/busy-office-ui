import { useState } from 'react';
import { Button, Card, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore } from './data/appStore.js';
import { documentTotal } from './data/types.js';
import { useStoreState } from './data/store.js';

/**
 * Requisitions list + detail — the first hop of the Procurement-to-stock journey (ROADMAP M7's
 * ERP reference-app initiative, Slice 2). New screen: the gap inventory found no requisition
 * screen at all. Same list-plus-detail-in-one-route pattern as Quotations.tsx/Delivery.tsx.
 * Meant to render as `AppShell`'s content for module="Purchase", route "Requisitions".
 *
 * Deliberately shows the FULL requisition → approval → purchase order → goods receipt chain in
 * one screen rather than splitting each hop into its own route: the brief names this exact chain
 * as its first example connected journey, and every hop after "approve" is a short, obvious next
 * action on the SAME record (there's no independent worklist need for "purchase orders awaiting
 * receipt" yet — that's real future scope, not something to fake a whole extra screen for here).
 * "Receive goods" is the one action in this reference app that actually mutates `stockLevels` —
 * see Inventory.tsx, which reads the same store and shows the result.
 */

const STATUS_TONE: Record<string, ChipTone> = {
  draft: 'neutral',
  pending_approval: 'accent',
  approved: 'strong',
  rejected: 'danger',
  converted: 'strong',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  rejected: 'Rejected',
  converted: 'Converted',
};

const PO_STATUS_TONE: Record<string, ChipTone> = {
  draft: 'neutral',
  awaiting_approval: 'accent',
  sent: 'accent',
  partially_received: 'strong',
  received: 'strong',
  cancelled: 'danger',
};

const PO_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  awaiting_approval: 'Awaiting approval',
  sent: 'Sent',
  partially_received: 'Partially received',
  received: 'Received',
  cancelled: 'Cancelled',
};

// A reasonable supplier/warehouse pairing per material — this reference app has no real supplier-
// catalog screen yet (out of this slice's scope), so approving a requisition picks the one
// supplier already selling that material in the seed data, same judgment call ListReport.tsx's
// own sample filters already make.
const SUPPLIER_FOR_PRODUCT: Record<string, string> = { 'mat-paper': 'sup-alden', 'mat-cable': 'sup-vantage', 'mat-switch': 'sup-cascade-it' };

const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

let nextPurchaseOrderSeq = 1;
let nextGoodsReceiptSeq = 1;

export function Requisitions() {
  const state = useStoreState(appStore, (s) => s);
  const requisitionList = Object.values(state.requisitions).sort((a, b) => (a.id < b.id ? 1 : -1));
  const [selectedId, setSelectedId] = useState(requisitionList[0]?.id ?? '');
  const selected = state.requisitions[selectedId];
  const linkedOrder = selected?.purchaseOrderId ? state.purchaseOrders[selected.purchaseOrderId] : undefined;

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
        <Density value="compact">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text variant="heading">Requisitions</Text>
            <div style={{ flex: 1 }} />
            <Button type="button" variant="primary">
              + New requisition
            </Button>
          </div>
        </Density>

        <div
          role="region"
          aria-label="Requisitions table"
          tabIndex={0}
          style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
        >
          <div style={{ minWidth: 640 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Requisition #</TableHeaderCell>
                    <TableHeaderCell>Requested by</TableHeaderCell>
                    <TableHeaderCell>Department</TableHeaderCell>
                    <TableHeaderCell>Request date</TableHeaderCell>
                    <TableHeaderCell align="end">Total</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requisitionList.map((requisition) => (
                    <TableRow
                      key={requisition.id}
                      onClick={() => setSelectedId(requisition.id)}
                      style={{ cursor: 'pointer', backgroundColor: requisition.id === selectedId ? '#eff6ff' : undefined }}
                    >
                      <TableCell>{requisition.id}</TableCell>
                      <TableCell>{requisition.requestedBy}</TableCell>
                      <TableCell>{requisition.department}</TableCell>
                      <TableCell>{requisition.requestDate}</TableCell>
                      <TableCell align="end">{formatCurrency(documentTotal(requisition.lines))}</TableCell>
                      <TableCell>
                        <Chip variant="status" tone={STATUS_TONE[requisition.status]}>
                          {STATUS_LABEL[requisition.status]}
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
                <Text variant="title">{selected.id}</Text>
                <Chip variant="status" tone={STATUS_TONE[selected.status]}>
                  {STATUS_LABEL[selected.status]}
                </Chip>
                <div style={{ flex: 1 }} />
                <Text variant="caption">
                  {selected.requestedBy} · {selected.department}
                </Text>
              </div>

              <Density value="compact">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Description</TableHeaderCell>
                      <TableHeaderCell align="end">Qty</TableHeaderCell>
                      <TableHeaderCell align="end">Unit price</TableHeaderCell>
                      <TableHeaderCell align="end">Amount</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selected.lines.map((line) => (
                      <TableRow key={line.productId}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell align="end">{line.qty}</TableCell>
                        <TableCell align="end">{formatCurrency(line.unitPrice)}</TableCell>
                        <TableCell align="end">{formatCurrency(line.qty * line.unitPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Density>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Text variant="title" as="span">
                  Total {formatCurrency(documentTotal(selected.lines))}
                </Text>
              </div>

              {linkedOrder ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Text variant="body">
                    Linked: Purchase order {linkedOrder.id} · {state.suppliers[linkedOrder.supplierId]?.name}
                  </Text>
                  <Chip variant="status" tone={PO_STATUS_TONE[linkedOrder.status]}>
                    {PO_STATUS_LABEL[linkedOrder.status]}
                  </Chip>
                </div>
              ) : (
                <Text variant="caption">No linked purchase order yet.</Text>
              )}

              {linkedOrder?.goodsReceiptIds.length ? (
                <Text variant="body">Linked: Goods receipt {linkedOrder.goodsReceiptIds[0]} — stock updated</Text>
              ) : null}

              <Density value="compact">
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  {selected.status === 'pending_approval' && (
                    <>
                      <Button type="button" variant="secondary" onClick={() => appActions.rejectRequisition(selected.id)}>
                        Reject
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                          const requisitionId = selected.id;
                          const supplierId = SUPPLIER_FOR_PRODUCT[selected.lines[0]?.productId] ?? 'sup-alden';
                          const newPoId = `PO-40${10 + nextPurchaseOrderSeq}`;
                          nextPurchaseOrderSeq += 1;
                          appActions.approveRequisitionAndCreatePO(requisitionId, newPoId, supplierId, 'wh-main');
                        }}
                      >
                        Approve — create purchase order
                      </Button>
                    </>
                  )}
                  {linkedOrder && linkedOrder.status === 'sent' && (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        const newReceiptId = `GR-40${20 + nextGoodsReceiptSeq}`;
                        nextGoodsReceiptSeq += 1;
                        appActions.receiveGoods(linkedOrder.id, newReceiptId);
                      }}
                    >
                      Receive goods — update stock
                    </Button>
                  )}
                </div>
              </Density>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
