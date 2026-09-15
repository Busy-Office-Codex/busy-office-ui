import type { AppState } from './types.js';

/**
 * Seed data for the shared reference-app store. Reuses real, already-established entities from
 * existing example pages (Customers.tsx's own customer roster, Invoice.tsx's own line items)
 * rather than inventing a parallel cast — same fictional manufacturer/distributor world this
 * package has used all along ("Northwind Traders, LLC" as the org itself, per Settings.tsx).
 *
 * Known, pre-existing data conflicts found while building this (not introduced by it — a direct
 * harvest of every examples/*.tsx sample-data constant found them first): SO-1044, DL-0231,
 * SO-1046 and SO-1038 each already have 2-3 mutually-contradicting definitions scattered across
 * SalesOrderList.tsx/Invoice.tsx/Delivery.tsx/Notifications.tsx (different customers or linked
 * documents for the same record number). Left untouched here rather than silently patched over —
 * see the verification report for the full list. This seed deliberately avoids reusing any of
 * those four numbers, anchoring instead on SO-1042 (Northwind Traders, "Awaiting approval"), the
 * one sales-order record every existing file already agrees on (RecordDetail.tsx,
 * SalesOrderList.tsx, Approvals.tsx, Inbox.tsx) — confirming it here starts a fresh, genuinely
 * consistent quotation → order → delivery → invoice chain instead of adding a fifth conflicting
 * definition of an already-contested number.
 */

const NORTHWIND = 'cust-northwind';
const BLUEPEAK = 'cust-bluepeak';
const SOLACE = 'cust-solace';
const DELTA = 'cust-delta';

export const seed: AppState = {
  customers: {
    [NORTHWIND]: {
      id: NORTHWIND,
      name: 'Northwind Traders',
      billingAddress: { line1: '2200 Riverside Pkwy, Suite 310', cityStateZip: 'Austin, TX 78704' },
      contact: { name: 'J. Rivera', email: 'j.rivera@northwindtraders.example' },
    },
    [BLUEPEAK]: {
      id: BLUEPEAK,
      name: 'Bluepeak Logistics',
      billingAddress: { line1: '1180 Freightway Dr, Suite 400', cityStateZip: 'Newark, NJ 07105' },
      contact: { name: 'D. Okafor', email: 'd.okafor@bluepeaklogistics.example' },
    },
    [SOLACE]: {
      id: SOLACE,
      name: 'Solace Health Partners',
      billingAddress: { line1: '88 Windmere Ave', cityStateZip: 'Boston, MA 02118' },
      contact: { name: 'Priya Shah', email: 'priya.shah@solacehealth.example' },
    },
    [DELTA]: {
      id: DELTA,
      name: 'Delta Manufacturing',
      billingAddress: { line1: '4410 Foundry Row', cityStateZip: 'Cleveland, OH 44113' },
      contact: { name: 'Marcus Webb', email: 'marcus.webb@deltamfg.example' },
    },
  },

  suppliers: {
    'sup-alden': { id: 'sup-alden', name: 'Alden Paper Co.' },
    'sup-vantage': { id: 'sup-vantage', name: 'Vantage Electrical Co.' },
    'sup-cascade-it': { id: 'sup-cascade-it', name: 'Cascade IT Distribution' },
  },

  products: {
    'prod-impl': { id: 'prod-impl', description: 'ERP implementation — professional services (Phase 2)', unitPrice: 185, unit: 'hr' },
    'prod-support': { id: 'prod-support', description: 'Annual support & maintenance renewal', unitPrice: 4200, unit: 'yr' },
    'prod-seats': { id: 'prod-seats', description: 'Additional user licenses', unitPrice: 45, unit: 'seat' },
    'prod-training': { id: 'prod-training', description: 'On-site admin training (2-day)', unitPrice: 2600, unit: 'session' },
    // Stocked materials (Slice 2, procurement + inventory) — bought from suppliers, held in a
    // warehouse, distinct from the services products above (sold to customers, never stocked).
    'mat-paper': { id: 'mat-paper', description: '500-sheet letterhead paper, ream', unitPrice: 6.2, unit: 'ream' },
    'mat-cable': { id: 'mat-cable', description: 'Cat6 network cable, 1000ft spool', unitPrice: 145, unit: 'spool' },
    'mat-switch': { id: 'mat-switch', description: '24-port managed network switch', unitPrice: 410, unit: 'unit' },
  },

  warehouses: {
    'wh-main': { id: 'wh-main', name: 'Main DC' },
    'wh-east': { id: 'wh-east', name: 'East Coast Hub' },
    'wh-west': { id: 'wh-west', name: 'West Coast Hub' },
  },

  quotations: {
    'QUO-3001': {
      id: 'QUO-3001',
      customerId: NORTHWIND,
      status: 'accepted',
      issueDate: '2026-08-20',
      expiryDate: '2026-09-20',
      lines: [
        { productId: 'prod-impl', description: 'ERP implementation — professional services (Phase 2)', qty: 40, unitPrice: 185 },
        { productId: 'prod-training', description: 'On-site admin training (2-day)', qty: 1, unitPrice: 2600 },
      ],
      salesOrderId: 'SO-1042',
    },
    'QUO-3002': {
      id: 'QUO-3002',
      customerId: SOLACE,
      status: 'sent',
      issueDate: '2026-09-10',
      expiryDate: '2026-10-10',
      lines: [{ productId: 'prod-seats', description: 'Additional user licenses', qty: 25, unitPrice: 45 }],
    },
    'QUO-3003': {
      id: 'QUO-3003',
      customerId: DELTA,
      status: 'draft',
      issueDate: '2026-09-14',
      expiryDate: '2026-10-14',
      lines: [{ productId: 'prod-support', description: 'Annual support & maintenance renewal', qty: 1, unitPrice: 4200 }],
    },
  },

  // SO-1042 starts "confirmed" here (Slice 1's live demo, per its own file header, moves it from
  // this already-established "Awaiting approval" state through the rest of the chain) — every
  // other existing page's own SO-1042 reference (RecordDetail.tsx's approve/reject flow,
  // Approvals.tsx, Inbox.tsx) still shows the pre-approval state; that's the SAME record at an
  // EARLIER point in the same lifecycle this store picks up from, not a contradiction.
  salesOrders: {
    'SO-1042': {
      id: 'SO-1042',
      customerId: NORTHWIND,
      status: 'confirmed',
      orderDate: '2026-08-22',
      quotationId: 'QUO-3001',
      lines: [
        { productId: 'prod-impl', description: 'ERP implementation — professional services (Phase 2)', qty: 40, unitPrice: 185 },
        { productId: 'prod-training', description: 'On-site admin training (2-day)', qty: 1, unitPrice: 2600 },
      ],
      deliveryIds: ['DL-3101'],
      invoiceIds: ['INV-3201'],
    },
  },

  deliveries: {
    'DL-3101': {
      id: 'DL-3101',
      salesOrderId: 'SO-1042',
      customerId: NORTHWIND,
      status: 'delivered',
      carrier: 'FreightLine Express',
      trackingNumber: 'FLX-88213409',
      lines: [{ productId: 'prod-training', description: 'On-site admin training (2-day)', qty: 1, unitPrice: 2600 }],
    },
  },

  invoices: {
    'INV-3201': {
      id: 'INV-3201',
      customerId: NORTHWIND,
      salesOrderId: 'SO-1042',
      deliveryId: 'DL-3101',
      status: 'sent',
      issueDate: '2026-09-05',
      dueDate: '2026-10-05',
      lines: [
        { productId: 'prod-impl', description: 'ERP implementation — professional services (Phase 2)', qty: 40, unitPrice: 185 },
        { productId: 'prod-training', description: 'On-site admin training (2-day)', qty: 1, unitPrice: 2600 },
      ],
      payments: [],
    },
  },

  // Slice 2 (Procurement → stock). Anchored on FRESH record numbers (REQ-4xxx/PO-4xxx/GR-4xxx),
  // deliberately not reusing PO-1042 and its siblings (already fully consistent across
  // ListReport.tsx/Approvals.tsx/Notifications.tsx/Inbox.tsx, same "don't add a conflicting
  // definition of an already-established number" reasoning as SO-1042 above) — those existing
  // pages stay untouched and independently correct; this is a second, separate live chain.
  requisitions: {
    'REQ-4001': {
      id: 'REQ-4001',
      requestedBy: 'Marcus Webb',
      department: 'Facilities',
      status: 'pending_approval',
      requestDate: '2026-09-12',
      lines: [{ productId: 'mat-paper', description: '500-sheet letterhead paper, ream', qty: 120, unitPrice: 6.2 }],
    },
    'REQ-4002': {
      id: 'REQ-4002',
      requestedBy: 'Priya Shah',
      department: 'IT',
      status: 'draft',
      requestDate: '2026-09-15',
      lines: [
        { productId: 'mat-cable', description: 'Cat6 network cable, 1000ft spool', qty: 4, unitPrice: 145 },
        { productId: 'mat-switch', description: '24-port managed network switch', qty: 2, unitPrice: 410 },
      ],
    },
  },

  purchaseOrders: {},
  goodsReceipts: {},

  stockLevels: [
    { productId: 'mat-paper', warehouseId: 'wh-main', qtyOnHand: 340, qtyReserved: 40 },
    { productId: 'mat-paper', warehouseId: 'wh-east', qtyOnHand: 95, qtyReserved: 10 },
    { productId: 'mat-paper', warehouseId: 'wh-west', qtyOnHand: 60, qtyReserved: 0 },
    { productId: 'mat-cable', warehouseId: 'wh-main', qtyOnHand: 18, qtyReserved: 6 },
    { productId: 'mat-cable', warehouseId: 'wh-east', qtyOnHand: 5, qtyReserved: 4 },
    { productId: 'mat-switch', warehouseId: 'wh-main', qtyOnHand: 12, qtyReserved: 2 },
    { productId: 'mat-switch', warehouseId: 'wh-west', qtyOnHand: 3, qtyReserved: 3 },
  ],

  stockMovements: [
    { id: 'mv-1', productId: 'mat-paper', warehouseId: 'wh-main', type: 'receipt', qty: 200, date: '2026-08-18', reference: 'PO-1042' },
    { id: 'mv-2', productId: 'mat-switch', warehouseId: 'wh-main', type: 'receipt', qty: 15, date: '2026-08-22', reference: 'PO-1029' },
    { id: 'mv-3', productId: 'mat-paper', warehouseId: 'wh-main', type: 'shipment', qty: -60, date: '2026-09-02', reference: 'SO-1035' },
    { id: 'mv-4', productId: 'mat-cable', warehouseId: 'wh-east', type: 'transfer', qty: -3, date: '2026-09-08', reference: 'wh-main → wh-east' },
    { id: 'mv-5', productId: 'mat-switch', warehouseId: 'wh-west', type: 'adjustment', qty: -1, date: '2026-09-10', reference: 'Cycle count variance' },
  ],

  // Slice 3 (Production planning). "Production" here means assembling switches from received
  // components — this fictional distributor also does light final-assembly, not just resale —
  // consistent with mat-switch/mat-cable already being stocked materials, not finished goods
  // bought pre-built.
  demandForecasts: [
    { id: 'fc-1', productId: 'mat-switch', warehouseId: 'wh-west', period: '2026-10', forecastQty: 20 },
    { id: 'fc-2', productId: 'mat-switch', warehouseId: 'wh-main', period: '2026-10', forecastQty: 15 },
    { id: 'fc-3', productId: 'mat-cable', warehouseId: 'wh-east', period: '2026-10', forecastQty: 30 },
  ],

  planningRecommendations: {
    'REC-5001': {
      id: 'REC-5001',
      productId: 'mat-switch',
      warehouseId: 'wh-west',
      suggestedQty: 20,
      reason: 'Forecast demand (20) exceeds available stock (0) for Oct 2026',
      status: 'open',
    },
    'REC-5002': {
      id: 'REC-5002',
      productId: 'mat-cable',
      warehouseId: 'wh-east',
      suggestedQty: 25,
      reason: 'Forecast demand (30) exceeds available stock (1) for Oct 2026',
      status: 'open',
    },
  },

  plannedOrders: {},
  productionOrders: {},

  activity: [
    { id: 'act-1', at: '2026-08-20', recordType: 'quotation', recordId: 'QUO-3001', message: 'Quotation QUO-3001 sent to Northwind Traders' },
    { id: 'act-2', at: '2026-08-22', recordType: 'quotation', recordId: 'QUO-3001', message: 'Quotation QUO-3001 accepted — Sales order SO-1042 created' },
    { id: 'act-3', at: '2026-09-01', recordType: 'salesOrder', recordId: 'SO-1042', message: 'Sales order SO-1042 confirmed' },
    { id: 'act-4', at: '2026-09-03', recordType: 'delivery', recordId: 'DL-3101', message: 'Delivery DL-3101 shipped via FreightLine Express' },
    { id: 'act-5', at: '2026-09-05', recordType: 'delivery', recordId: 'DL-3101', message: 'Delivery DL-3101 confirmed delivered' },
    { id: 'act-6', at: '2026-09-05', recordType: 'invoice', recordId: 'INV-3201', message: 'Invoice INV-3201 issued and sent to Northwind Traders' },
    { id: 'act-7', at: '2026-09-12', recordType: 'requisition', recordId: 'REQ-4001', message: 'Requisition REQ-4001 submitted for approval' },
  ],
};
