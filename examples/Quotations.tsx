import { useState } from 'react';
import { Button, Card, Chip, type ChipTone, Density, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '../src/index.js';
import { appActions, appStore } from './data/appStore.js';
import { documentTotal } from './data/types.js';
import { useStoreState } from './data/store.js';
import { color, space } from '../src/tokens.stylex.js';

/**
 * Quotations list + detail — the first hop of the Sales-to-billing journey (ROADMAP M7's ERP
 * reference-app initiative, Slice 1). New screen (the gap inventory found no existing coverage),
 * built from the same list-plus-detail-in-one-route pattern Delivery.tsx/Inbox.tsx already
 * established for this milestone (one route, click a row to select its detail below — no routing-
 * model change needed). Meant to render as `AppShell`'s content for module="Sales", route
 * "Quotations".
 *
 * Reads live from the shared `examples/data` store, not a local hardcoded array like every M6-era
 * page — this is genuinely NEW here: "Accept" on a `sent` quotation calls `appActions
 * .acceptQuotation` then `.convertQuotationToSalesOrder`, a real state transition a screen reader
 * or sighted user can watch happen (status Chip flips, a new "Linked: Sales order" reference
 * appears) rather than a static rendered outcome. That's the brief's own bar: "A simulated save,
 * approval, posting, or reversal should visibly change the relevant mock state."
 */

const STATUS_TONE: Record<string, ChipTone> = {
  draft: 'neutral',
  sent: 'accent',
  accepted: 'strong',
  declined: 'danger',
  expired: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
};

const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

let nextOrderSeq = 1;

export function Quotations() {
  const state = useStoreState(appStore, (s) => s);
  const quotationList = Object.values(state.quotations).sort((a, b) => (a.id < b.id ? 1 : -1));
  const [selectedId, setSelectedId] = useState(quotationList[0]?.id ?? '');
  const selected = state.quotations[selectedId];
  const customer = selected ? state.customers[selected.customerId] : undefined;
  const linkedOrder = selected?.salesOrderId ? state.salesOrders[selected.salesOrderId] : undefined;

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
        <Density value="compact">
          <div style={{ display: 'flex', alignItems: 'center', gap: space.space3, flexWrap: 'wrap' }}>
            <Text variant="heading">Quotations</Text>
            <div style={{ flex: 1 }} />
            <Button type="button" variant="primary">
              + New quotation
            </Button>
          </div>
        </Density>

        <div
          role="region"
          aria-label="Quotations table"
          tabIndex={0}
          style={{ border: `1px solid ${color.border}`, borderRadius: 10, background: color.bgSurface, overflowX: 'auto' }}
        >
          <div style={{ minWidth: 640 }}>
            <Density value="compact">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Quotation #</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Issue date</TableHeaderCell>
                    <TableHeaderCell>Expiry date</TableHeaderCell>
                    <TableHeaderCell align="end">Total</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotationList.map((quotation) => (
                    <TableRow
                      key={quotation.id}
                      onClick={() => setSelectedId(quotation.id)}
                      style={{ cursor: 'pointer', backgroundColor: quotation.id === selectedId ? color.bgSelected : undefined }}
                    >
                      <TableCell>{quotation.id}</TableCell>
                      <TableCell>{state.customers[quotation.customerId]?.name}</TableCell>
                      <TableCell>{quotation.issueDate}</TableCell>
                      <TableCell>{quotation.expiryDate}</TableCell>
                      <TableCell align="end">{formatCurrency(documentTotal(quotation.lines))}</TableCell>
                      <TableCell>
                        <Chip variant="status" tone={STATUS_TONE[quotation.status]}>
                          {STATUS_LABEL[quotation.status]}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: space.space3, flexWrap: 'wrap' }}>
                <Text variant="title">{selected.id}</Text>
                <Chip variant="status" tone={STATUS_TONE[selected.status]}>
                  {STATUS_LABEL[selected.status]}
                </Chip>
                <div style={{ flex: 1 }} />
                <Text variant="caption">
                  {customer.name} · expires {selected.expiryDate}
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
                <Text variant="body">Linked: Sales order {linkedOrder.id}</Text>
              ) : (
                <Text variant="caption">No linked sales order yet.</Text>
              )}

              {selected.status === 'sent' && (
                <Density value="compact">
                  <div style={{ display: 'flex', gap: space.space3, justifyContent: 'flex-end' }}>
                    <Button type="button" variant="secondary">
                      Decline
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        const quotationId = selected.id;
                        appActions.acceptQuotation(quotationId);
                        const newOrderId = `SO-${2000 + nextOrderSeq}`;
                        nextOrderSeq += 1;
                        appActions.convertQuotationToSalesOrder(quotationId, newOrderId);
                      }}
                    >
                      Accept — create sales order
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
