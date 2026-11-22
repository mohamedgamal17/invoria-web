# Cross-Module Queries Specification

Queries allow a module to request information owned by another module asynchronously via the `ServiceBus`.

## Customers Queries
- `CUSTOMERS_QUERIES.search`: `'customers.search'`
  - Request: `SearchCustomersQuery` (`name: string`, `skip?: number`, `length?: number`)
  - Response: `CustomerSearchResult` (`CustomerRef`)
- `CUSTOMERS_QUERIES.getRefs`: `'customers.get-refs'`
  - Request: `GetCustomerRefsQuery` (`ids: string[]`)
  - Response: `CustomerRef[]`

## Catalog Queries
- `CATALOG_QUERIES.searchProducts`: `'catalog.search-products'`
  - Request: `SearchProductsQuery` (`name: string`, `skip?: number`, `length?: number`)
  - Response: `ProductSearchResult` (`ProductRef`)
- `CATALOG_QUERIES.getProducts`: `'catalog.get-products'`
  - Request: `GetProductsQuery` (`ids: string[]`)
  - Response: `ProductRef[]`

## Procurement Queries
- `PROCUREMENT_QUERIES.searchSuppliers`: `'procurement.search-suppliers'`
  - Request: `SearchSuppliersQuery` (`name: string`, `skip?: number`, `length?: number`)
  - Response: `SupplierSearchResult` (`SupplierRef`)
- `PROCUREMENT_QUERIES.getSuppliers`: `'procurement.get-suppliers'`
  - Request: `GetSuppliersQuery` (`ids: string[]`)
  - Response: `SupplierRef[]`
- `PROCUREMENT_QUERIES.getPurchaseOrders`: `'procurement.get-purchase-orders'`
  - Request: `GetPurchaseOrdersQuery` (`ids: string[]`)
  - Response: `PurchaseOrderLookupResult[]`
