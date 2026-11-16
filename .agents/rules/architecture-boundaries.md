# Architectural Boundaries & Dependency Rules

This rule defines project architecture boundaries, dependency constraints, and modular organization for **Invoria Web**.

---

## 1. Feature-Based Architecture

Invoria Web follows a strict **Feature-Based Angular Architecture** using Standalone Components:
```text
src/app/
├── core/               # Singleton infrastructure: provideStore, HTTP interceptors, error effects
├── features/           # Domain-specific feature modules (isolated)
│   ├── <feature>/
│   │   ├── pages/      # Smart container components (route targets)
│   │   ├── components/ # Presentational dumb components
│   │   ├── services/   # Typed HttpClient API services
│   │   ├── models/     # Dedicated *.entity.ts and *.request.ts files
│   │   ├── store/      # NgRx feature store modules (complex state only)
│   │   └── utils/      # Feature-local pure helpers
├── layout/             # App shell, sidebar, navbar
└── shared/             # Reusable primitives, UI, models, utils, charts
```

---

## 2. Dependency Isolation & Strict Rules

1. **Features are Isolated**: By default, code in `features/<featureA>` **must never import** from `features/<featureB>`.
2. **Circular Dependencies are Forbidden**: Any circular reference between modules or files is strictly prohibited. Use base classes in `shared/entities/` or contracts in `core/` / `shared/`.
3. **Shared-Before-Duplicate**:
   - If a visual primitive, helper function, or model interface is needed by a second feature, promote it to `src/app/shared/` instead of duplicating it across features.
   - One-off page chrome and feature-specific logic must remain within the owning feature.
4. **No Barrel Files in `models/`**:
   - Never create an aggregating barrel file like `features/<feature>/models/product.ts` that re-exports all entities and requests.
   - Consumers must import direct file paths: `import { Product } from './product.entity';` and `import { ListProductRequest } from './list-product.request';`.
   - This ensures explicit import graphs and prevents accidental circular imports.

---

## 3. Documented Whitelist Exceptions

Cross-feature coupling is permitted **only** for the 10 documented exceptions in `docs/architecture/overview.md §7`. Any usage outside these 10 exceptions is a violation:

1. **`orders` → `customers`, `products`**:
   - `import type` only for `Customer`, `Product` in `order.entity.ts` and search request shapes.
   - May inject `CustomersApiService` and `ProductsApiService` only for order form autocomplete.
2. **`customers` → `orders`**:
   - May inject `OrdersApiService` only for customer-scoped order lists.
   - Minimal read-only UI imports: `OrderListComponent`, `OrdersFilterPanelComponent`, `UiOrder`, `orderToUiOrder`, `ListOrderRequest`.
3. **`products` → `inventory`**:
   - Imports `ProductBatchesPanelComponent`, `SaveBatchEvent`, batch models.
   - Injects `BatchesApiService` in batches store effects.
   - `inventory` must not import `products` (one-way dependency).
4. **`products` → `orders`**:
   - May inject `OrdersApiService` only and read-only order summary helpers (`OrderStatus`, `getOrderStatusSeverity`, `getOrderStatusLabel`).
5. **`suppliers` → `procurement`**:
   - May inject `PurchaseOrdersApiService` only for supplier-scoped purchase order lists.
   - Minimal read-only UI imports: `PurchaseOrderListComponent`, `PurchaseOrdersFilterPanelComponent`, `PurchaseOrder`, `PurchaseState`, `ListPurchaseOrderRequest`.
6. **`procurement` → `suppliers`, `products`**:
   - `import type` for `Supplier`, `SupplierChoice`, `Product` choices and search requests.
   - May inject `SuppliersApiService` and `ProductsApiService` for autocomplete and purchase-order details batch resolution.
7. **`dashboard` → cross-feature reports**:
   - `import type` for report period entities.
   - Injects typed report API services only (`CustomersApiService`, `ProductsApiService`, `OrdersApiService`, `SuppliersApiService`, `PurchaseOrdersApiService`) inside dashboard store effects.
8. **`receivables` → `orders`**:
   - `import type` only for `OrderStatus` and `PaymentType` to type the inline source DTO.
9. **`payables` → `suppliers`, `procurement`**:
   - Injects `SuppliersApiService` and `PurchaseOrdersApiService` only for client-side party/source enrichment (`PayableReferenceResolverService`).
10. **Shared and Core usage**:
    - All features may import from `src/app/shared/` and `src/app/core/`.

---

## 4. SOLID & Architecture Checklist

- [ ] **Single Responsibility**: Smart pages handle routing/state glue; presentational components handle display; API services handle HTTP; store effects handle async orchestration.
- [ ] **Open/Closed**: Shared primitives (`app-chart-card`, `app-list-skeleton`, `app-status-steps`) accept configurable inputs/templates rather than being modified for single-case overrides.
- [ ] **Dependency Inversion**: High-level components depend on abstractions (interfaces, typed API service contracts, `ConfirmDialogService`), not low-level DOM or concrete UI dialog instances.
- [ ] **No Feature Creep**: New cross-feature imports require an explicit review note, minimal surface (`import type` + typed service), and an update to `docs/architecture/overview.md §7` in the same PR.
