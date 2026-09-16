import { useEffect, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Button, Card, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { color } from '../src/tokens.stylex.js';
import { appActions, appStore } from './data/appStore.js';
import { documentTotal } from './data/types.js';
import { useStoreState } from './data/store.js';

/**
 * A two-column invoice: a printed-document-style card (bill-to, dates, line items, totals,
 * payment instructions) on the left, and a payment-status / payments-received / linked-records /
 * activity sidebar on the right. Mirrors `templates/erp-skeleton`'s "13 Invoice" screen.
 *
 * Now store-connected (ROADMAP M7's ERP reference-app initiative — the remaining half of
 * Billing.tsx's own disclosed gap since Slice 10/16): reads the same shared `examples/data` store
 * every other Sales screen reads, the same kind of static-to-connected upgrade Delivery.tsx got
 * in Slice 7. A `focusInvoiceId` effect picks up the invoice `Billing.tsx`'s own new "View
 * invoice" button sets via `appActions.viewInvoice` — a real drill-down, not a same-named
 * coincidence between two static pages — falling back to the most-recent invoice (same sort
 * Billing.tsx's own worklist uses) so this route also renders something real on a direct visit
 * via the app strip/command palette. Threading an actual route-navigate callback through
 * `preview/client.tsx`'s route-agnostic `panes` map is the same disproportionate change
 * Analytics.tsx's own comment already declined for its cross-module exception cards; this reuses
 * that same store-mediated-handoff idea, but through `focusInvoiceId`/`viewInvoice` — a slot
 * dedicated to this one Billing.tsx→Invoice.tsx hop, not the general `focusRecordId`/
 * `useFocusRecord` Analytics.tsx's exceptions use. Found live, not assumed: Billing.tsx's own
 * `useFocusRecord` already claims any invoice id `focusRecordId` carries (it's Analytics.tsx's
 * own unpaid-invoices exception target), so sharing that slot here had Billing.tsx's
 * already-mounted effect reconsume its own request before Invoice.tsx ever mounted to see it —
 * every visited route in `preview/client.tsx` stays mounted, hidden, after its first visit, so
 * "not yet visited" is the only thing that ever gave Invoice.tsx a chance to react first.
 *
 * No tax breakdown: `Invoice`/`LineItem` model no tax field anywhere in `examples/data/types.ts`,
 * so the static page's own invented 8.5% tax line is gone rather than carried forward as a number
 * that could never tie to real state — the exact "half-connected" outcome this file's own prior
 * comment warned against. "Record payment" is now wired to the same `appActions.recordPayment`
 * Billing.tsx already uses (was present here with no handler at all); "Credit note"/"Send
 * reminder"/"···" stay decorative — not part of this connection, same as Delivery.tsx's own
 * inert view-toggle buttons.
 *
 * "Print" (Slice 16) is a real `window.print()` call; printing shows only the document itself
 * (the action-button row and the payment-status/activity sidebar are app chrome) via a real
 * `@media print` rule — a plain inline `style` object can't express a media query, so a small
 * scoped `stylex.create` block handles just this.
 */

const printStyles = stylex.create({
  // Only `display` is driven here — every other property on these two elements stays inline
  // `style`, since an inline `style` always wins specificity over a class, which would otherwise
  // silently defeat the `@media print` override.
  hideOnPrint: {
    display: {
      default: 'flex',
      '@media print': 'none',
    },
  },
});

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

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function Invoice() {
  const state = useStoreState(appStore, (s) => s);
  const invoiceList = Object.values(state.invoices).sort((a, b) => (a.id < b.id ? 1 : -1));
  const [selectedId, setSelectedId] = useState(invoiceList[0]?.id ?? '');
  useEffect(() => {
    if (state.focusInvoiceId) {
      setSelectedId(state.focusInvoiceId);
      appActions.clearInvoiceFocus();
    }
  }, [state.focusInvoiceId]);
  const selected = state.invoices[selectedId];
  const customer = selected ? state.customers[selected.customerId] : undefined;

  if (!selected || !customer) {
    return (
      <div
        style={{
          background: '#f8fafc',
          fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: 24,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Text variant="heading">Invoice</Text>
          <Card>
            <Text variant="body">No invoice selected. Create or open one from Billing.</Text>
          </Card>
        </div>
      </div>
    );
  }

  const total = documentTotal(selected.lines);
  const totalPaid = selected.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balanceDue = total - totalPaid;
  const paidPercent = total > 0 ? Math.round((totalPaid / total) * 100) : 0;
  const activity = state.activity.filter((entry) => entry.recordType === 'invoice' && entry.recordId === selected.id);

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // Matches ListReport.tsx/RecordDetail.tsx/RolePage.tsx's shared 24px content
        // padding/border-box frame (see RecordDetail.tsx for the full box-sizing reasoning).
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* `margin: 0`, not `'0 auto'` — left-aligns, matching every other sample page's content
          frame. No page-level `maxWidth` cap — fills whatever width AppShell gives it (see
          docs/design-conventions.md's "Page width and responsive layout"); the invoice document
          card and the sidebar panels below use flexible bases so the row wraps to a stacked
          mobile layout on its own. */}
      <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Text variant="heading">{selected.id}</Text>
              <Chip variant="status" tone={STATUS_TONE[selected.status]}>
                {STATUS_LABEL[selected.status]}
              </Chip>
            </div>
            <Text variant="caption">
              {customer.name} · Issued {selected.issueDate}
            </Text>
          </div>
          <div style={{ flex: 1 }} />
          <Density value="compact">
            <div style={{ gap: 8, flexWrap: 'wrap' }} {...stylex.props(printStyles.hideOnPrint)}>
              <Button type="button" variant="ghost" aria-label="More actions">
                ···
              </Button>
              <Button type="button" variant="secondary">
                Credit note
              </Button>
              <Button type="button" variant="secondary">
                Send reminder
              </Button>
              <Button type="button" variant="secondary" onClick={() => window.print()}>
                Print
              </Button>
              {selected.status !== 'paid' && selected.status !== 'cancelled' && balanceDue > 0 && (
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
            </div>
          </Density>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '2 1 560px', minWidth: 320 }}>
            <Card>
              {/* The document's own letterhead — found live: this card jumped straight to
                  Bill-to/dates with no in-document header of its own, relying entirely on the
                  page-level heading above the card (selected.id is real page content either
                  way; the reference shows it a second time INSIDE the printed document, the same
                  way a real invoice PDF repeats its own number on the page itself). */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: color.textPrimary, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <Text variant="caption">INVOICE</Text>
                  <Text variant="title" as="span">
                    {selected.id}
                  </Text>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text variant="caption" as="span">
                    Bill to
                  </Text>
                  <Text variant="body">{customer.name}</Text>
                  <Text variant="caption">{customer.billingAddress.line1}</Text>
                  <Text variant="caption">{customer.billingAddress.cityStateZip}</Text>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Text variant="caption" as="span">
                      Issue date
                    </Text>
                    <Text variant="body">{selected.issueDate}</Text>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Text variant="caption" as="span">
                      Due date
                    </Text>
                    <Text variant="body">{selected.dueDate}</Text>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
                <Text variant="title">Line items</Text>
                {/* Unlike ListReport.tsx/RolePage.tsx, this Table isn't wrapped in its own
                    bordered/overflow region — it already sits inside this Card's border, and a
                    second nested border would read as a widget floating inside the printed
                    document rather than a line-items section of it. */}
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
                      {selected.lines.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="end">{item.qty}</TableCell>
                          <TableCell align="end">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell align="end">{formatCurrency(item.qty * item.unitPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Density>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  alignSelf: 'flex-end',
                  minWidth: 220,
                  paddingTop: 8,
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <Text variant="title" as="span">
                  Total
                </Text>
                <Text variant="title" as="span">
                  {formatCurrency(total)}
                </Text>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 240px' }}>
                  <Text variant="title">Payment instructions</Text>
                  <Text variant="caption">
                    Remit payment via ACH or wire transfer to Northwind Traders, LLC — routing 021000021, account
                    4471182005. Reference invoice {selected.id} on the transfer. Payments received after the due date
                    may accrue a 1.5% monthly late fee.
                  </Text>
                </div>
                {/* A scannable pay-by-QR affordance — stays a labeled placeholder even after
                    Icon (ROADMAP issue #18) landed a real closed glyph set elsewhere in
                    examples/ (ControlCenter.tsx's sliders trigger, AppShell.tsx's notification
                    bell). A QR code is a generated 2D barcode encoding this invoice's own
                    payment data — every real one is visually distinct — not a fixed glyph a
                    small icon set can represent; a generic "code/scan" stand-in glyph here
                    would just be a different-looking lie about the same missing capability
                    (no QR-generation dependency in this package). It also has exactly one
                    caller, failing Icon's own "closed set built from what real consumers
                    actually need" bar the same way a one-caller prop/variant fails Objective 1
                    elsewhere in this repo. Left as a plain hand-built placeholder, honestly
                    labeled "QR" rather than rendered as if it were real. */}
                <div
                  aria-hidden="true"
                  style={{
                    width: 72,
                    height: 72,
                    flexShrink: 0,
                    border: '1px dashed #cbd5e1',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                  }}
                >
                  <Text variant="caption">QR</Text>
                </div>
              </div>
            </Card>
          </div>

          <div style={{ flex: '1 1 320px', minWidth: 280, maxWidth: 440, flexDirection: 'column', gap: 16 }} {...stylex.props(printStyles.hideOnPrint)}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <Text variant="title">Payment status</Text>
                <Chip variant="status" tone={STATUS_TONE[selected.status]}>
                  {STATUS_LABEL[selected.status]}
                </Chip>
              </div>

              {/* A real Paid-vs-Outstanding progress bar. */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  role="progressbar"
                  aria-label="Payment progress"
                  aria-valuenow={paidPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}
                >
                  <div style={{ height: '100%', width: `${paidPercent}%`, background: color.action, borderRadius: 999 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <Text variant="caption">Paid · {formatCurrency(totalPaid)}</Text>
                  <Text variant="caption">Outstanding · {formatCurrency(balanceDue)}</Text>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                  <Text variant="caption" as="span">
                    Amount due
                  </Text>
                  <Text variant="heading" as="span">
                    {formatCurrency(balanceDue)}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <Text variant="caption" as="span">
                    Invoice total
                  </Text>
                  <Text variant="body">{formatCurrency(total)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <Text variant="caption" as="span">
                    Paid to date
                  </Text>
                  <Text variant="body">{formatCurrency(totalPaid)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <Text variant="caption" as="span">
                    Due date
                  </Text>
                  <Text variant="body">{selected.dueDate}</Text>
                </div>
              </div>
            </Card>

            <Card>
              <Text variant="title">Payments received</Text>
              {selected.payments.length === 0 ? (
                <Text variant="caption">No payments received yet.</Text>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selected.payments.map((payment) => (
                    <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text variant="body">{formatCurrency(payment.amount)}</Text>
                        <Text variant="caption">{payment.method}</Text>
                      </div>
                      <Text variant="caption">{payment.date}</Text>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {(selected.salesOrderId || selected.deliveryId) && (
              <Card>
                <Text variant="title">Linked records</Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selected.salesOrderId && <Text variant="body">Sales order · {selected.salesOrderId}</Text>}
                  {selected.deliveryId && <Text variant="body">Delivery · {selected.deliveryId}</Text>}
                </div>
              </Card>
            )}

            <Card>
              <Text variant="title">Activity</Text>
              {activity.length === 0 ? (
                <Text variant="caption">No activity yet.</Text>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activity.map((entry) => (
                    <Text key={entry.id} variant="caption">
                      {entry.at} — {entry.message}
                    </Text>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
