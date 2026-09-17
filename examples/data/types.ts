/**
 * The reference app's mock ERP domain — a fictional manufacturer/distributor
 * ("Northwind Traders, LLC", already established across examples/Settings.tsx,
 * examples/Invoice.tsx). Grows one transaction family at a time, slice by slice, per the
 * brief's own "manageable slices" instruction — this file starts with Sales-to-billing's
 * entities (Slice 1) plus the master data every later slice will also need (customers,
 * suppliers, products), rather than the full 6-family schema up front.
 */

export type Address = { line1: string; cityStateZip: string };

export type Customer = {
  id: string;
  name: string;
  billingAddress: Address;
  contact: { name: string; email: string };
};

export type Supplier = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  description: string;
  unitPrice: number;
  unit: string; // "hr", "seat", "unit", ...
};

export type LineItem = {
  productId: string;
  description: string;
  qty: number;
  unitPrice: number;
};

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

export type Quotation = {
  id: string;
  customerId: string;
  status: QuotationStatus;
  issueDate: string;
  expiryDate: string;
  lines: LineItem[];
  /** Set once a Sales order is created from this quotation — the document-flow link. */
  salesOrderId?: string;
};

export type SalesOrderStatus = 'draft' | 'confirmed' | 'fulfilled' | 'cancelled';

export type SalesOrder = {
  id: string;
  customerId: string;
  status: SalesOrderStatus;
  orderDate: string;
  quotationId?: string;
  lines: LineItem[];
  deliveryIds: string[];
  invoiceIds: string[];
};

export type DeliveryStatus = 'pending' | 'picking' | 'packed' | 'shipped' | 'delivered';

export type Delivery = {
  id: string;
  salesOrderId: string;
  customerId: string;
  status: DeliveryStatus;
  carrier?: string;
  trackingNumber?: string;
  lines: LineItem[];
};

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type Payment = { id: string; date: string; amount: number; method: string };

export type Invoice = {
  id: string;
  customerId: string;
  salesOrderId?: string;
  deliveryId?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  lines: LineItem[];
  payments: Payment[];
};

// --- Procurement + inventory (Slice 2) --------------------------------------------------------

export type Warehouse = { id: string; name: string };

export type RequisitionStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'converted';

export type Requisition = {
  id: string;
  requestedBy: string;
  department: string;
  status: RequisitionStatus;
  requestDate: string;
  lines: LineItem[];
  /** Set once approved and converted — the document-flow link. */
  purchaseOrderId?: string;
};

export type PurchaseOrderStatus = 'draft' | 'awaiting_approval' | 'sent' | 'partially_received' | 'received' | 'cancelled';

export type PurchaseOrder = {
  id: string;
  supplierId: string;
  warehouseId: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  requisitionId?: string;
  lines: LineItem[];
  goodsReceiptIds: string[];
};

export type GoodsReceiptLine = LineItem & { qtyReceived: number };

export type GoodsReceipt = {
  id: string;
  purchaseOrderId: string;
  receivedDate: string;
  lines: GoodsReceiptLine[];
};

export type StockLevel = {
  productId: string;
  warehouseId: string;
  qtyOnHand: number;
  qtyReserved: number;
};

export type StockMovementType = 'receipt' | 'shipment' | 'adjustment' | 'transfer';

export type StockMovement = {
  id: string;
  productId: string;
  warehouseId: string;
  type: StockMovementType;
  qty: number;
  date: string;
  reference: string;
};

// --- Production planning (Slice 3) ------------------------------------------------------------

export type DemandForecast = {
  id: string;
  productId: string;
  warehouseId: string;
  period: string; // "2026-10" — a month bucket, enough resolution for a reference app
  forecastQty: number;
};

export type RecommendationStatus = 'open' | 'actioned' | 'dismissed';

export type PlanningRecommendation = {
  id: string;
  productId: string;
  warehouseId: string;
  suggestedQty: number;
  reason: string;
  status: RecommendationStatus;
  plannedOrderId?: string;
};

export type PlannedOrderStatus = 'planned' | 'released' | 'cancelled';

export type PlannedOrder = {
  id: string;
  productId: string;
  warehouseId: string;
  qty: number;
  dueDate: string;
  status: PlannedOrderStatus;
  recommendationId?: string;
  productionOrderId?: string;
};

export type ProductionOrderStatus = 'released' | 'in_progress' | 'completed' | 'cancelled';

export type ProductionOrder = {
  id: string;
  plannedOrderId: string;
  productId: string;
  warehouseId: string;
  qty: number;
  status: ProductionOrderStatus;
  startDate: string;
  dueDate: string;
};

// --- Administration + role-based config (Slice 4) ----------------------------------------------

// A role's grants are modeled as the set of AppShell modules it can open — coarser than
// UsersAndRoles.tsx's per-action permissions matrix (View/Create/Edit/…), but that's the right
// grain for THIS slice's own named journey ("preview access"): showing which parts of the actual
// app a role can reach, not re-deriving that page's separate action-level grid.
export type Role = {
  id: string;
  name: string;
  moduleAccess: string[];
};

/** The full set of AppShell modules a role's `moduleAccess` can name — kept here (not
 * `examples/AppShell.tsx`'s own `AppShellModule` union) since this is the data layer's list of
 * valid grant values, read by both Users.tsx (preview access) and Roles.tsx (editing grants). */
export const ALL_MODULES = ['General', 'Sales', 'Purchase', 'Production', 'Finance', 'BI', 'Administration', 'Builder', 'Settings'] as const;

export type UserStatus = 'invited' | 'active' | 'deactivated';

export type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  status: UserStatus;
  roleId?: string;
};

// --- Administration — companies & entities, integrations & API (Slice 12) ----------------------

export type CompanyStatus = 'active' | 'inactive';

/** A legal entity/business unit under the account — distinct from Settings.tsx's own single
 * "Company" form (that screen edits the ONE entity a host itself is; this models the multi-entity
 * structure AdminOverview.tsx's "Companies & entities" card names). */
export type Company = {
  id: string;
  legalName: string;
  businessUnit: string;
  taxId: string;
  address: Address;
  status: CompanyStatus;
};

export type IntegrationStatus = 'connected' | 'disconnected';

export type Integration = {
  id: string;
  name: string;
  category: string;
  status: IntegrationStatus;
  /** Set only while `status` is `'connected'`. */
  connectedAt?: string;
};

export type ActivityEntry = {
  id: string;
  at: string;
  recordType:
    | 'quotation'
    | 'salesOrder'
    | 'delivery'
    | 'invoice'
    | 'requisition'
    | 'purchaseOrder'
    | 'goodsReceipt'
    | 'planningRecommendation'
    | 'plannedOrder'
    | 'productionOrder'
    | 'user'
    | 'role'
    | 'company'
    | 'integration';
  recordId: string;
  message: string;
};

export type AppState = {
  customers: Record<string, Customer>;
  suppliers: Record<string, Supplier>;
  products: Record<string, Product>;
  warehouses: Record<string, Warehouse>;
  quotations: Record<string, Quotation>;
  salesOrders: Record<string, SalesOrder>;
  deliveries: Record<string, Delivery>;
  invoices: Record<string, Invoice>;
  requisitions: Record<string, Requisition>;
  purchaseOrders: Record<string, PurchaseOrder>;
  goodsReceipts: Record<string, GoodsReceipt>;
  stockLevels: StockLevel[];
  stockMovements: StockMovement[];
  demandForecasts: DemandForecast[];
  planningRecommendations: Record<string, PlanningRecommendation>;
  plannedOrders: Record<string, PlannedOrder>;
  productionOrders: Record<string, ProductionOrder>;
  roles: Record<string, Role>;
  users: Record<string, User>;
  companies: Record<string, Company>;
  integrations: Record<string, Integration>;
  activity: ActivityEntry[];
  /** Route ids the user has starred from Launcher.tsx's "All apps" grid (Slice 14) — genuinely
   * user-curated, unlike `activity` (real business events) or "recent" (Slice 11, derived from
   * `activity`): nothing seeds this, since there is no natural "already favorited" starting fact
   * to reuse, honestly disclosed rather than forced. */
  favoriteRouteIds: string[];
  /**
   * A record id another screen wants pre-selected the next time its owning list+detail screen
   * mounts or updates (Slice 5's dashboard-exception drill-down: "row Analytics.tsx surfaced" IS
   * the row Billing/Requisitions/Planning select, not just a same-labeled coincidence). Screens
   * that consume it clear it right after, so a plain later visit doesn't re-trigger a stale jump.
   */
  focusRecordId: string | null;
  /**
   * A narrower sibling of `focusRecordId` for the one case where two screens share the same
   * record type as a focus target. Billing.tsx's own worklist already consumes any invoice id
   * `focusRecordId` carries (Analytics.tsx's unpaid-invoices exception), so Invoice.tsx's own
   * "View invoice" hop from Billing.tsx needs a separate slot — sharing `focusRecordId` would
   * have Billing.tsx's already-mounted `useFocusRecord` immediately reconsume it before
   * Invoice.tsx ever mounted to see it (found live, not assumed: every visited route in
   * `preview/client.tsx` stays mounted, hidden, after its first visit — Billing.tsx's own focus
   * effect keeps running even while hidden).
   */
  focusInvoiceId: string | null;
};

export function lineTotal(line: LineItem): number {
  return line.qty * line.unitPrice;
}

export function documentTotal(lines: LineItem[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

/**
 * Count of distinct materials stocked per warehouse — NOT a sum of `qtyOnHand` across materials,
 * since each Product's own `unit` field can differ (reams, spools, discrete units); summing those
 * as one physical quantity was ROADMAP item 52/issue #22's bug. Shared by Inventory.tsx,
 * BiExplore.tsx and BuilderReports.tsx (the 3 places that reused this exact figure — the same
 * duplication that produced the original bug, so this stays one function, not three copies).
 */
export function materialsStockedByWarehouse(
  stockLevels: StockLevel[],
  warehouses: Record<string, Warehouse>,
): { label: string; value: number }[] {
  return Object.values(warehouses).map((warehouse) => ({
    label: warehouse.name,
    value: stockLevels.filter((level) => level.warehouseId === warehouse.id).length,
  }));
}
