# Domain Events Specification

All domain events in Invoria Web are registered as constants with typed payloads.

## Catalog Events
- `CATALOG_EVENTS.productChanged`: `'catalog.product.changed'`
  - Payload: `CatalogProductChangedEvent` (`productId: string`, `change: 'created' | 'updated' | 'deleted'`)

## Customers Events
- `CUSTOMERS_EVENTS.customerChanged`: `'customers.customer.changed'`
  - Payload: `CustomerChangedEvent` (`customerId: string`, `change: 'created' | 'updated' | 'deleted'`)

## Sales Events
- `SALES_EVENTS.orderChanged`: `'sales.order.changed'`
  - Payload: `SalesOrderChangedEvent` (`orderId: string`, `customerId: string`, `productIds: string[]`, `change: 'created' | 'updated' | 'accepted' | 'completed' | 'cancelled' | 'paid' | 'returned'`)

## Procurement Events
- `PROCUREMENT_EVENTS.purchaseOrderChanged`: `'procurement.purchase-order.changed'`
  - Payload: `ProcurementPurchaseOrderChangedEvent` (`purchaseOrderId: string`, `supplierId: string`, `productIds: string[]`, `change: 'created' | 'updated' | 'transitioned'`)
- `PROCUREMENT_EVENTS.supplierChanged`: `'procurement.supplier.changed'`
  - Payload: `ProcurementSupplierChangedEvent` (`supplierId: string`, `change: 'created' | 'updated'`)

## Financial Events
- `FINANCIAL_EVENTS.obligationSettled`: `'financial.obligation.settled'`
  - Payload: `FinancialObligationSettledEvent` (`obligationId: string`, `kind: 'receivable' | 'payable'`, `sourceId: string`)
