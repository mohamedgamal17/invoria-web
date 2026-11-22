# @invoria/sales

Sales domain feature module containing order processing, invoices, and returns management.

## Sub-Features

### 1. Orders (`/orders`)
- Route: `ORDERS_ROUTES`
- Features: Orders list, order creation wizard with stepper, order detail view, status progression (`Draft` -> `Accepted` -> `Completed` -> `Cancelled` / `Returned`), payment recording dialog, sales analytics (`/reports/sales`), profit analytics (`/reports/profit`).
- State: NgRx slices `ordersList`, `orderDetails`, and URL synchronizer.

### 2. Invoices (`/invoices`)
- Route: `INVOICES_ROUTES`
- Features: Paged invoice table, invoice details breakdown, printable invoice summaries.
- State: NgRx slices `invoicesList`, `invoiceDetails`.

### 3. Returns (`/returns`)
- Route: `RETURNS_ROUTES`
- Features: Order returns list, return inspection and approval/rejection workflows.
- State: Signals-based component state (`rxResource`, `linkedSignal`).

## Event Bus Integration
- Publishes: `SALES_EVENTS.orderChanged` on order status mutations.
