# @invoria/catalog

Product catalog feature module containing product listings, creation, edit, details, and analytics.

## Routes Exposed

- `PRODUCTS_ROUTES` under `/products`:
  - `/products` (`ProductsPageComponent`): Paginated product list.
  - `/products/new` (`ProductFormPageComponent`): Create new product.
  - `/products/:id/edit` (`ProductFormPageComponent`): Edit product.
  - `/products/:id` (`ProductDetailsPageComponent`): Product detail tabs (Info, Batches from `@invoria/inventory`, Orders from `@invoria/sales`).
  - `/products/:id/batches`: Redirects to `/products/:id?tab=batches`.

## State Management

- `productsList`: Paginated product directory.
- `productDetails`: Single active product entity.
- `productBatches`: Embedded batch history for the current product.
- `productOrders`: Embedded order summary for the current product.
- `productsMutations`: Optimistic create/update sync.

## Event Bus Integration

- Publishes: `CATALOG_EVENTS.productChanged`.
- Handles queries: `CATALOG_QUERIES.searchProducts`, `CATALOG_QUERIES.getProducts`.
