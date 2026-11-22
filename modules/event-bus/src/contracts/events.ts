export const CATALOG_EVENTS = {
  productChanged: 'catalog.product.changed',
} as const;

export interface CatalogProductChangedEvent {
  productId: string;
  change: 'created' | 'updated' | 'deleted';
}

export const CUSTOMERS_EVENTS = {
  customerChanged: 'customers.customer.changed',
} as const;

export interface CustomerChangedEvent {
  customerId: string;
  change: 'created' | 'updated' | 'deleted';
}

export const SALES_EVENTS = {
  orderChanged: 'sales.order.changed',
} as const;

export interface SalesOrderChangedEvent {
  orderId: string;
  customerId: string;
  productIds: string[];
  change: 'created' | 'updated' | 'accepted' | 'completed' | 'cancelled' | 'paid' | 'returned';
}

export const PROCUREMENT_EVENTS = {
  purchaseOrderChanged: 'procurement.purchase-order.changed',
  supplierChanged: 'procurement.supplier.changed',
} as const;

export interface ProcurementPurchaseOrderChangedEvent {
  purchaseOrderId: string;
  supplierId: string;
  productIds: string[];
  change: 'created' | 'updated' | 'transitioned';
}

export interface ProcurementSupplierChangedEvent {
  supplierId: string;
  change: 'created' | 'updated';
}

export const FINANCIAL_EVENTS = {
  obligationSettled: 'financial.obligation.settled',
} as const;

export interface FinancialObligationSettledEvent {
  obligationId: string;
  kind: 'receivable' | 'payable';
  sourceId: string;
}
