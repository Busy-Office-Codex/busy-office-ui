import { useState } from 'react';
import { Button, Card, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore, useFocusRecord } from './data/appStore.js';
import { documentTotal } from './data/types.js';
import { useStoreState } from './data/store.js';
import { ConfirmDialog } from './confirmDialog.js';

/**
 * Billing worklist + detail — the last hop of the Sales-to-billing journey (ROADMAP M7's ERP
 * reference-app initiative, Slice 1). New screen: the gap inventory found Invoice.tsx was
 * single-invoice-detail only, with no worklist above it. Same list-plus-detail-in-one-route
 * pattern as Quotations.tsx/Delivery.tsx/Inbox.tsx. Meant to render as `AppShell`'s content for
 * module="Sales", route "Billing".
 *
 * Reads live from the shared `examples/data` store — "Record payment" calls `appActions
 * .recordPayment`, a real transition (the payment appears in the list below, the balance due
 * shrinks, and the status Chip flips to "Paid" once it reaches zero) rather than a static
 * rendered outcome.
 *
 * Slice 10 (Billing completions) added "+ New invoice" (bills a confirmed sales order that has
 * no invoice yet — real worklist-driven creation, not a hand-typed blank form) and "Cancel
 * invoice" (a real reversal for an unpaid invoice; this simple model doesn't try to model a
 * credit note against an already-paid one — see `appActions.cancelInvoice`'s own comment).
 *
 * "View invoice" now sends a real selected invoice's data to Invoice.tsx (Invoice.tsx is
 * store-connected as of this change, the same static-to-connected upgrade Delivery.tsx got in
 * Slice 7): Shell owns navigation state centrally and this pane has no navigate callback of its
 * own (see Analytics.tsx's own comment), so the actual move to the Invoice route stays the app
 * strip/command palette, same as every other cross-module jump in this app — landing there,
 * Invoice.tsx pre-selects the exact invoice clicked here. This calls `appActions.viewInvoice`, a
 * dedicated slot, NOT `appActions.focusRecord` (Analytics.tsx's own cross-module exceptions) —
 * found live, not assumed: Billing.tsx's own `useFocusRecord` already claims any invoice id
 * `focusRecordId` carries, so it would immediately reconsume its own request for Invoice.tsx
 * before Invoice.tsx (mounting for the first time) ever saw it, since every visited route here
 * stays mounted, hidden, after its first visit. Its own working Print action (Slice 16) is
 * `window.print()`, with a `@media print` rule hiding its action-button row and sidebar so only
 * the document itself prints.
 *
 * "Cancel invoice" (not "Record payment" — only the destructive direction) confirms first via
 * `ConfirmDialog` (Slice 15, `./confirmDialog.js`).
 */

const STATUS_TONE: Record<string, ChipTone> = {
  draft: 'neutral',
  sent: 'accent',
  paid: 'strong',
  overdue: 'danger',
  cancelled: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

let nextInvoiceSeq = 1;

export function Billing() {
  const state = useStoreState(appStore, (s) => s);
  const invoiceList = Object.values(state.invoices).sort((a, b) => (a.id < b.id ? 1 : -1));
  const [selectedId, setSelectedId] = useState(invoiceList[0]?.id ?? '');
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  useFocusRecord(
    (id) => Boolean(state.invoices[id]),
    (id) => setSelectedId(id),
  );
  const selected = state.invoices[selectedId];
  const customer = selected ? state.customers[selected.customerId] : undefined;
  const total = selected ? documentTotal(selected.lines) : 0;
  const paid = selected ? selected.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0;
  const balanceDue = total - paid;

  const uninvoicedOrders = Object.values(state.salesOrders).filter((order) => order.status === 'confirmed' && order.invoiceIds.length === 0);

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
        <Text variant="heading">Billing</Text>

        {uninvoicedOrders.length > 0 && (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Text variant="title">Ready to invoice</Text>
              {uninvoicedOrders.map((order) => (
                <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <Text variant="body">
                      {order.id} · {state.customers[order.customerId]?.name}
                    </Text>
                    <Text variant="caption">{formatCurrency(documentTotal(order.lines))}</Text>
                  </div>
                  <Density value="compact">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const newId = `INV-${3300 + nextInvoiceSeq}`;
                        nextInvoiceSeq += 1;
                        appActions.createInvoice(order.id, newId);
                        setSelectedId(newId);
                      }}
                    >
                      Create invoice
                    </Button>
                  </Density>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div
          role="region"
          aria-label="Invoices table"
          tabIndex={0}
          style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff', overflowX: 'auto' }}
        >
          <div style={{ minWidth: 640 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Invoice #</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Issue date</TableHeaderCell>
                    <TableHeaderCell>Due date</TableHeaderCell>
                    <TableHeaderCell align="end">Total</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceList.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      onClick={() => setSelectedId(invoice.id)}
                      style={{ cursor: 'pointer', backgroundColor: invoice.id === selectedId ? '#eff6ff' : undefined }}
                    >
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{state.customers[invoice.customerId]?.name}</TableCell>
                      <TableCell>{invoice.issueDate}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell align="end">{formatCurrency(documentTotal(invoice.lines))}</TableCell>
                      <TableCell>
                        <Chip variant="status" tone={STATUS_TONE[invoice.status]}>
                          {STATUS_LABEL[invoice.status]}
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
                  {customer.name} · due {selected.dueDate}
                </Text>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text variant="caption">Invoice total</Text>
                  <Text variant="title" as="span">
                    {formatCurrency(total)}
                  </Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text variant="caption">Paid to date</Text>
                  <Text variant="title" as="span">
                    {formatCurrency(paid)}
                  </Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text variant="caption">Balance due</Text>
                  <Text variant="title" as="span">
                    {formatCurrency(balanceDue)}
                  </Text>
                </div>
              </div>

              {selected.payments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Text variant="caption" as="span">
                    Payments received
                  </Text>
                  {selected.payments.map((payment) => (
                    <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <Text variant="body">
                        {formatCurrency(payment.amount)} · {payment.method}
                      </Text>
                      <Text variant="caption">{payment.date}</Text>
                    </div>
                  ))}
                </div>
              )}

              {(selected.salesOrderId || selected.deliveryId) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text variant="caption" as="span">
                    Linked
                  </Text>
                  {selected.salesOrderId && <Text variant="body">Sales order · {selected.salesOrderId}</Text>}
                  {selected.deliveryId && <Text variant="body">Delivery · {selected.deliveryId}</Text>}
                </div>
              )}

              <Density value="compact">
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button type="button" variant="secondary" onClick={() => appActions.viewInvoice(selected.id)}>
                    View invoice
                  </Button>
                  {selected.status !== 'paid' && selected.status !== 'cancelled' && (
                    <>
                      <Button type="button" variant="secondary" onClick={() => setConfirmingCancel(true)}>
                        Cancel invoice
                      </Button>
                      {balanceDue > 0 && (
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() =>
                            appActions.recordPayment(selected.id, {
                              date: new Date().toISOString().slice(0, 10),
                              amount: balanceDue,
                              method: 'ACH transfer',
                            })
                          }
                        >
                          Record payment — {formatCurrency(balanceDue)}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Density>
            </div>
          </Card>
        )}
      </div>

      {selected && (
        <ConfirmDialog
          open={confirmingCancel}
          title={`Cancel ${selected.id}?`}
          confirmLabel="Cancel invoice"
          onConfirm={() => {
            appActions.cancelInvoice(selected.id);
            setConfirmingCancel(false);
          }}
          onCancel={() => setConfirmingCancel(false)}
        >
          {customer?.name} will need a new invoice if this order still needs to be billed.
        </ConfirmDialog>
      )}
    </div>
  );
}
