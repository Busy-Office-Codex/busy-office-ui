import { createStore } from './store.js';
import { seed } from './seed.js';
import type { AppState, GoodsReceiptLine, Invoice, Payment } from './types.js';
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

  // --- Procurement + inventory (Slice 2) -------------------------------------------------

  /** Approved requisition → a new draft purchase order to a chosen supplier, linked both ways. */
  approveRequisitionAndCreatePO(requisitionId: string, newPurchaseOrderId: string, supplierId: string, warehouseId: string) {
    appStore.setState((state) => {
      const requisition = state.requisitions[requisitionId];
      if (!requisition || requisition.status !== 'pending_approval' || state.purchaseOrders[newPurchaseOrderId]) return state;
      let nextState: AppState = {
        ...state,
        requisitions: {
          ...state.requisitions,
          [requisitionId]: { ...requisition, status: 'converted', purchaseOrderId: newPurchaseOrderId },
        },
        purchaseOrders: {
          ...state.purchaseOrders,
          [newPurchaseOrderId]: {
            id: newPurchaseOrderId,
            supplierId,
            warehouseId,
            status: 'sent',
            orderDate: new Date().toISOString().slice(0, 10),
            requisitionId,
            lines: requisition.lines,
            goodsReceiptIds: [],
          },
        },
      };
      nextState = logActivity(nextState, 'requisition', requisitionId, `Requisition ${requisitionId} approved`);
      return logActivity(nextState, 'purchaseOrder', newPurchaseOrderId, `Purchase order ${newPurchaseOrderId} created from ${requisitionId}`);
    });
  },

  rejectRequisition(requisitionId: string) {
    appStore.setState((state) => {
      const requisition = state.requisitions[requisitionId];
      if (!requisition || requisition.status !== 'pending_approval') return state;
      return logActivity(
        { ...state, requisitions: { ...state.requisitions, [requisitionId]: { ...requisition, status: 'rejected' } } },
        'requisition',
        requisitionId,
        `Requisition ${requisitionId} rejected`,
      );
    });
  },

  /** Posts a full goods receipt against a sent PO: creates the receipt record, marks the PO
   * received, and — the actual inventory effect — adds the received qty to stock (creating the
   * `StockLevel` row if this is the first time this product/warehouse pairing has ever been
   * stocked) plus a matching `receipt` movement, the same ledger `stockMovements` already models
   * for the seeded historical entries. */
  receiveGoods(purchaseOrderId: string, newGoodsReceiptId: string) {
    appStore.setState((state) => {
      const order = state.purchaseOrders[purchaseOrderId];
      if (!order || order.status !== 'sent' || state.goodsReceipts[newGoodsReceiptId]) return state;

      const receiptLines: GoodsReceiptLine[] = order.lines.map((line) => ({ ...line, qtyReceived: line.qty }));

      const stockLevels = [...state.stockLevels];
      const stockMovements = [...state.stockMovements];
      const today = new Date().toISOString().slice(0, 10);
      for (const line of receiptLines) {
        const existingIndex = stockLevels.findIndex((level) => level.productId === line.productId && level.warehouseId === order.warehouseId);
        if (existingIndex >= 0) {
          stockLevels[existingIndex] = { ...stockLevels[existingIndex], qtyOnHand: stockLevels[existingIndex].qtyOnHand + line.qtyReceived };
        } else {
          stockLevels.push({ productId: line.productId, warehouseId: order.warehouseId, qtyOnHand: line.qtyReceived, qtyReserved: 0 });
        }
        stockMovements.push({
          id: `mv-runtime-${newGoodsReceiptId}-${line.productId}`,
          productId: line.productId,
          warehouseId: order.warehouseId,
          type: 'receipt',
          qty: line.qtyReceived,
          date: today,
          reference: purchaseOrderId,
        });
      }

      let nextState: AppState = {
        ...state,
        purchaseOrders: {
          ...state.purchaseOrders,
          [purchaseOrderId]: { ...order, status: 'received', goodsReceiptIds: [...order.goodsReceiptIds, newGoodsReceiptId] },
        },
        goodsReceipts: {
          ...state.goodsReceipts,
          [newGoodsReceiptId]: { id: newGoodsReceiptId, purchaseOrderId, receivedDate: today, lines: receiptLines },
        },
        stockLevels,
        stockMovements,
      };
      nextState = logActivity(nextState, 'purchaseOrder', purchaseOrderId, `Purchase order ${purchaseOrderId} received in full`);
      return logActivity(nextState, 'goodsReceipt', newGoodsReceiptId, `Goods receipt ${newGoodsReceiptId} posted — stock updated`);
    });
  },

  // --- Production planning (Slice 3) -----------------------------------------------------

  /** An open recommendation → a new planned order for the suggested qty, linked both ways. */
  actionRecommendation(recommendationId: string, newPlannedOrderId: string, dueDate: string) {
    appStore.setState((state) => {
      const recommendation = state.planningRecommendations[recommendationId];
      if (!recommendation || recommendation.status !== 'open' || state.plannedOrders[newPlannedOrderId]) return state;
      let nextState: AppState = {
        ...state,
        planningRecommendations: {
          ...state.planningRecommendations,
          [recommendationId]: { ...recommendation, status: 'actioned', plannedOrderId: newPlannedOrderId },
        },
        plannedOrders: {
          ...state.plannedOrders,
          [newPlannedOrderId]: {
            id: newPlannedOrderId,
            productId: recommendation.productId,
            warehouseId: recommendation.warehouseId,
            qty: recommendation.suggestedQty,
            dueDate,
            status: 'planned',
            recommendationId,
          },
        },
      };
      nextState = logActivity(nextState, 'planningRecommendation', recommendationId, `Recommendation ${recommendationId} actioned`);
      return logActivity(nextState, 'plannedOrder', newPlannedOrderId, `Planned order ${newPlannedOrderId} created`);
    });
  },

  dismissRecommendation(recommendationId: string) {
    appStore.setState((state) => {
      const recommendation = state.planningRecommendations[recommendationId];
      if (!recommendation || recommendation.status !== 'open') return state;
      return logActivity(
        { ...state, planningRecommendations: { ...state.planningRecommendations, [recommendationId]: { ...recommendation, status: 'dismissed' } } },
        'planningRecommendation',
        recommendationId,
        `Recommendation ${recommendationId} dismissed`,
      );
    });
  },

  /** A planned order → a released production order on the shop floor, linked both ways. */
  releasePlannedOrder(plannedOrderId: string, newProductionOrderId: string, startDate: string) {
    appStore.setState((state) => {
      const planned = state.plannedOrders[plannedOrderId];
      if (!planned || planned.status !== 'planned' || state.productionOrders[newProductionOrderId]) return state;
      let nextState: AppState = {
        ...state,
        plannedOrders: { ...state.plannedOrders, [plannedOrderId]: { ...planned, status: 'released', productionOrderId: newProductionOrderId } },
        productionOrders: {
          ...state.productionOrders,
          [newProductionOrderId]: {
            id: newProductionOrderId,
            plannedOrderId,
            productId: planned.productId,
            warehouseId: planned.warehouseId,
            qty: planned.qty,
            status: 'released',
            startDate,
            dueDate: planned.dueDate,
          },
        },
      };
      nextState = logActivity(nextState, 'plannedOrder', plannedOrderId, `Planned order ${plannedOrderId} released`);
      return logActivity(nextState, 'productionOrder', newProductionOrderId, `Production order ${newProductionOrderId} released to the shop floor`);
    });
  },

  /** Completing a production order is the second (and last) action in this reference app that
   * mutates stock — the finished qty is added to the target warehouse, same ledger
   * `stockMovements` the goods-receipt flow already writes to, typed `'adjustment'` here since
   * it's stock created by assembly, not purchased or physically counted. */
  completeProductionOrder(productionOrderId: string) {
    appStore.setState((state) => {
      const order = state.productionOrders[productionOrderId];
      if (!order || order.status !== 'in_progress') return state;

      const stockLevels = [...state.stockLevels];
      const existingIndex = stockLevels.findIndex((level) => level.productId === order.productId && level.warehouseId === order.warehouseId);
      if (existingIndex >= 0) {
        stockLevels[existingIndex] = { ...stockLevels[existingIndex], qtyOnHand: stockLevels[existingIndex].qtyOnHand + order.qty };
      } else {
        stockLevels.push({ productId: order.productId, warehouseId: order.warehouseId, qtyOnHand: order.qty, qtyReserved: 0 });
      }
      const today = new Date().toISOString().slice(0, 10);

      const nextState: AppState = {
        ...state,
        productionOrders: { ...state.productionOrders, [productionOrderId]: { ...order, status: 'completed' } },
        stockLevels,
        stockMovements: [
          ...state.stockMovements,
          { id: `mv-runtime-${productionOrderId}`, productId: order.productId, warehouseId: order.warehouseId, type: 'adjustment', qty: order.qty, date: today, reference: productionOrderId },
        ],
      };
      return logActivity(nextState, 'productionOrder', productionOrderId, `Production order ${productionOrderId} completed — stock updated`);
    });
  },

  startProductionOrder(productionOrderId: string) {
    appStore.setState((state) => {
      const order = state.productionOrders[productionOrderId];
      if (!order || order.status !== 'released') return state;
      return logActivity(
        { ...state, productionOrders: { ...state.productionOrders, [productionOrderId]: { ...order, status: 'in_progress' } } },
        'productionOrder',
        productionOrderId,
        `Production order ${productionOrderId} started`,
      );
    });
  },

  reset() {
    activitySeq = 0;
    appStore.reset();
  },
};
