import { Button, Card, Chip, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { color } from '../src/tokens.stylex.js';

/**
 * A two-column invoice: a printed-document-style card (bill-to, dates, line
 * items, totals, payment instructions) on the left, and a payment-status /
 * payments-received / linked-records / activity sidebar on the right.
 * Mirrors `templates/erp-skeleton`'s "13 Invoice" screen. Meant to render as
 * `AppShell`'s content for module="Sales", route "Invoice" (see
 * `AppShell.tsx`'s `NAV.Sales`, which already lists "Invoice" as a sibling of
 * "Sales order"/"Delivery").
 *
 * Sample-data judgment call: this invoice is issued BY the tenant org
 * Settings.tsx already established as "Northwind Traders, LLC" (same legal
 * name/address used in its payment-instructions remit-to line below) TO
 * "Bluepeak Logistics" — the customer RolePage.tsx's work queue already has
 * an overdue "Confirm signed order" item for, so an overdue invoice for the
 * same account continues that thread rather than inventing an unrelated one.
 * The reference's own sample invoice number/customer pairing used
 * "Northwind Traders" as the bill-to customer, but this repo's existing
 * sample world already uses "Northwind Traders" as SO-1042's customer
 * (RecordDetail.tsx/Inbox.tsx, still "Awaiting approval") and, separately, as
 * the org's own legal name (Settings.tsx) — reusing it a third way here would
 * only add to that pre-existing ambiguity, so this file's linked sales order
 * is a fresh "SO-1044" instead of reusing SO-1042's number under a
 * contradictory status.
 */

type LineItem = { id: string; description: string; qty: number; unitPrice: number };

const LINE_ITEMS: LineItem[] = [
  { id: 'li-1', description: 'ERP implementation — professional services (Phase 2)', qty: 40, unitPrice: 185.0 },
  { id: 'li-2', description: 'Annual support & maintenance renewal', qty: 1, unitPrice: 4200.0 },
  { id: 'li-3', description: 'Additional user licenses (10 seats)', qty: 10, unitPrice: 45.0 },
];

type Payment = { id: string; date: string; amount: number; method: string };

const PAYMENTS_RECEIVED: Payment[] = [
  { id: 'pay-1', date: 'Aug 20, 2026', amount: 4000.0, method: 'Wire transfer' },
  { id: 'pay-2', date: 'Sep 1, 2026', amount: 2000.0, method: 'ACH transfer' },
];

const INVOICE = {
  number: 'INV-2024-0871',
  customer: 'Bluepeak Logistics',
  billingAddress: ['1180 Freightway Dr, Suite 400', 'Newark, NJ 07105'],
  issueDate: 'Aug 3, 2026',
  dueDate: 'Sep 2, 2026',
  overdueDays: 12,
  salesOrder: 'SO-1044',
  delivery: 'DL-0231',
};

const TAX_RATE = 0.085;

const ACTIVITY = [
  `${INVOICE.issueDate} — Invoice created and sent to ${INVOICE.customer}`,
  `${PAYMENTS_RECEIVED[0].date} — Payment of ${formatCurrency(PAYMENTS_RECEIVED[0].amount)} received (${PAYMENTS_RECEIVED[0].method})`,
  `${PAYMENTS_RECEIVED[1].date} — Payment of ${formatCurrency(PAYMENTS_RECEIVED[1].amount)} received (${PAYMENTS_RECEIVED[1].method})`,
  `${INVOICE.dueDate} — Invoice became overdue`,
  'Sep 10, 2026 — Reminder email sent to billing contact',
];

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const subtotal = LINE_ITEMS.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
const tax = subtotal * TAX_RATE;
const total = subtotal + tax;
const totalPaid = PAYMENTS_RECEIVED.reduce((sum, payment) => sum + payment.amount, 0);
const balanceDue = total - totalPaid;
const paidPercent = Math.round((totalPaid / total) * 100);

export function Invoice() {
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
              <Text variant="heading">{INVOICE.number}</Text>
              <Chip variant="status" tone="danger">
                Overdue · {INVOICE.overdueDays} days
              </Chip>
            </div>
            <Text variant="caption">
              {INVOICE.customer} · Issued {INVOICE.issueDate}
            </Text>
          </div>
          <div style={{ flex: 1 }} />
          <Density value="compact">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button type="button" variant="ghost" aria-label="More actions">
                ···
              </Button>
              <Button type="button" variant="secondary">
                Credit note
              </Button>
              <Button type="button" variant="secondary">
                Send reminder
              </Button>
              <Button type="button" variant="primary">
                Record payment
              </Button>
            </div>
          </Density>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '2 1 560px', minWidth: 320 }}>
            <Card>
              {/* The document's own letterhead — found live: this card jumped straight to
                  Bill-to/dates with no in-document header of its own, relying entirely on the
                  page-level heading above the card (INVOICE.number is real page content either
                  way; the reference shows it a second time INSIDE the printed document, the same
                  way a real invoice PDF repeats its own number on the page itself). */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: color.textPrimary, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <Text variant="caption">INVOICE</Text>
                  <Text variant="title" as="span">
                    {INVOICE.number}
                  </Text>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text variant="caption" as="span">
                    Bill to
                  </Text>
                  <Text variant="body">{INVOICE.customer}</Text>
                  {INVOICE.billingAddress.map((line) => (
                    <Text key={line} variant="caption">
                      {line}
                    </Text>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Text variant="caption" as="span">
                      Issue date
                    </Text>
                    <Text variant="body">{INVOICE.issueDate}</Text>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Text variant="caption" as="span">
                      Due date
                    </Text>
                    <Text variant="body">{INVOICE.dueDate}</Text>
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
                      {LINE_ITEMS.map((item) => (
                        <TableRow key={item.id}>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignSelf: 'flex-end', minWidth: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <Text variant="body">Subtotal</Text>
                  <Text variant="body">{formatCurrency(subtotal)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <Text variant="body">Tax ({Math.round(TAX_RATE * 1000) / 10}%)</Text>
                  <Text variant="body">{formatCurrency(tax)}</Text>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
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
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 240px' }}>
                  <Text variant="title">Payment instructions</Text>
                  <Text variant="caption">
                    Remit payment via ACH or wire transfer to Northwind Traders, LLC — routing 021000021, account
                    4471182005. Reference invoice {INVOICE.number} on the transfer. Payments received after the due
                    date may accrue a 1.5% monthly late fee.
                  </Text>
                </div>
                {/* A scannable pay-by-QR affordance — no QR-generation dependency in this
                    package, so (matching the "no Icon component" precedent elsewhere in
                    examples/) this is a plain hand-built stand-in, not a real generated code. */}
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

          <div style={{ flex: '1 1 320px', minWidth: 280, maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <Text variant="title">Payment status</Text>
                <Chip variant="status" tone="danger">
                  Overdue · {INVOICE.overdueDays} days
                </Chip>
              </div>

              {/* A real Paid-vs-Outstanding progress bar — found live: this card only ever
                  listed the same figures as plain text rows below, with nothing visual
                  conveying how much of the invoice is actually paid off at a glance. */}
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
                  <Text variant="body">{INVOICE.dueDate}</Text>
                </div>
              </div>
            </Card>

            <Card>
              <Text variant="title">Payments received</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYMENTS_RECEIVED.map((payment) => (
                  <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Text variant="body">{formatCurrency(payment.amount)}</Text>
                      <Text variant="caption">{payment.method}</Text>
                    </div>
                    <Text variant="caption">{payment.date}</Text>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <Text variant="title">Linked records</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Text variant="body">Sales order · {INVOICE.salesOrder}</Text>
                <Text variant="body">Delivery · {INVOICE.delivery}</Text>
              </div>
            </Card>

            <Card>
              <Text variant="title">Activity</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ACTIVITY.map((event) => (
                  <Text key={event} variant="caption">
                    {event}
                  </Text>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
