import { createStore } from './store.js';
import { seed } from './seed.js';
import type { AppState, Invoice, Payment } from './types.js';
import { documentTotal } from './types.js';

/** The one shared store instance every reference-app screen reads from. */
export const appStore = createStore<AppState>(seed);

let activitySeq = 0;
function logActivity(state: AppState, recordType: AppState['activity'][number]['recordType'], recordId: string, message: string): AppState {
  activitySeq += 1;
  return {
    ...state,
    activity: [...state.activity, { id: `act-runtime-${activitySeq}`, at: new Date().toISOString().slice(0, 10), recordType, recordId, message }],
  };
}

/**
 * Simulated business actions — the "prototype behavior" the brief asks for (a click visibly
 * changes the relevant mock record's status, not just a success toast). Each one is a plain
 * synchronous state transition; nothing here calls a network, matching every other component's
 * Boundary rule (no ERP runtime) — this is reference-app-layer simulation, not a service layer.
 */
export const appActions = {
  acceptQuotation(quotationId: string) {
    appStore.setState((state) => {
      const quotation = state.quotations[quotationId];
      if (!quotation || quotation.status !== 'sent') return state;
      return logActivity(
        { ...state, quotations: { ...state.quotations, [quotationId]: { ...quotation, status: 'accepted' } } },
        'quotation',
        quotationId,
        `Quotation ${quotationId} accepted`,
      );
    });
  },

  /** Accepted quotation → a new draft sales order, linked both ways. */
  convertQuotationToSalesOrder(quotationId: string, newSalesOrderId: string) {
    appStore.setState((state) => {
      const quotation = state.quotations[quotationId];
      if (!quotation || quotation.status !== 'accepted' || state.salesOrders[newSalesOrderId]) return state;
      const nextState: AppState = {
        ...state,
        quotations: { ...state.quotations, [quotationId]: { ...quotation, salesOrderId: newSalesOrderId } },
        salesOrders: {
          ...state.salesOrders,
          [newSalesOrderId]: {
            id: newSalesOrderId,
            customerId: quotation.customerId,
            status: 'draft',
            orderDate: new Date().toISOString().slice(0, 10),
            quotationId,
            lines: quotation.lines,
            deliveryIds: [],
            invoiceIds: [],
          },
        },
      };
      return logActivity(nextState, 'salesOrder', newSalesOrderId, `Sales order ${newSalesOrderId} created from ${quotationId}`);
    });
  },

  confirmSalesOrder(salesOrderId: string) {
    appStore.setState((state) => {
      const order = state.salesOrders[salesOrderId];
      if (!order || order.status !== 'draft') return state;
      return logActivity(
        { ...state, salesOrders: { ...state.salesOrders, [salesOrderId]: { ...order, status: 'confirmed' } } },
        'salesOrder',
        salesOrderId,
        `Sales order ${salesOrderId} confirmed`,
      );
    });
  },

  advanceDeliveryStatus(deliveryId: string) {
    appStore.setState((state) => {
      const delivery = state.deliveries[deliveryId];
      if (!delivery) return state;
      const sequence: typeof delivery.status[] = ['pending', 'picking', 'packed', 'shipped', 'delivered'];
      const nextIndex = sequence.indexOf(delivery.status) + 1;
      if (nextIndex >= sequence.length) return state;
      const nextStatus = sequence[nextIndex];
      return logActivity(
        { ...state, deliveries: { ...state.deliveries, [deliveryId]: { ...delivery, status: nextStatus } } },
        'delivery',
        deliveryId,
        `Delivery ${deliveryId} ${nextStatus}`,
      );
    });
  },

  recordPayment(invoiceId: string, payment: Omit<Payment, 'id'>) {
    appStore.setState((state) => {
      const invoice = state.invoices[invoiceId];
      if (!invoice) return state;
      const newPayment: Payment = { ...payment, id: `pay-runtime-${invoiceId}-${invoice.payments.length + 1}` };
      const paidSoFar = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + newPayment.amount;
      const total = documentTotal(invoice.lines);
      const nextStatus: Invoice['status'] = paidSoFar >= total ? 'paid' : invoice.status;
      const nextInvoice: Invoice = { ...invoice, payments: [...invoice.payments, newPayment], status: nextStatus };
      return logActivity(
        { ...state, invoices: { ...state.invoices, [invoiceId]: nextInvoice } },
        'invoice',
        invoiceId,
        `Payment of $${newPayment.amount.toLocaleString('en-US')} recorded on ${invoiceId}${nextStatus === 'paid' ? ' — invoice paid in full' : ''}`,
      );
    });
  },

  reset() {
    activitySeq = 0;
    appStore.reset();
  },
};
