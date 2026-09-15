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

export type ActivityEntry = {
  id: string;
  at: string;
  recordType: 'quotation' | 'salesOrder' | 'delivery' | 'invoice';
  recordId: string;
  message: string;
};

export type AppState = {
  customers: Record<string, Customer>;
  suppliers: Record<string, Supplier>;
  products: Record<string, Product>;
  quotations: Record<string, Quotation>;
  salesOrders: Record<string, SalesOrder>;
  deliveries: Record<string, Delivery>;
  invoices: Record<string, Invoice>;
  activity: ActivityEntry[];
};

export function lineTotal(line: LineItem): number {
  return line.qty * line.unitPrice;
}

export function documentTotal(lines: LineItem[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}
