---
name: products-list-layout
description: Use when working on the products catalog list page, products filter panel, or product list component in src/app/features/products/ — URL query ownership, spacing rhythm (gap-8), filter-panel parity with the orders feature (ProductsListFilters, debounced 700ms name filter), and the clearFilters wiring contract.
compatibility: Invoria Web (Angular 21)
---

# Products list page — spacing and filter (orders parity)

- **`ProductsPageComponent`** owns URL query params (`page`, `pageSize`, `name`) and data
  loading (`rxResource`, navigation). See `docs/guides/frontend-list-conventions.md` and
  `docs/architecture/overview.md` (smart vs presentational split).
- **Vertical rhythm:** the products catalog page root `<section>` uses **`flex flex-col gap-8`**
  between breadcrumb, header, and list — aligned with `orders-page`.
- **Filters:** declare **`ProductsFilterPanelComponent`**
  (**`app-products-filter-panel`**, `components/products-filter-panel/`) between the header
  and **`ProductListComponent`**, matching **`OrdersFilterPanelComponent`**: exported
  **`ProductsListFilters`** (`name`), inputs **`[name]`** / **`[loading]`**, outputs
  **`(filtersChange)`** / **`(clearFilters)`**. Implement with **`SurfaceCard`**, header row +
  **“Clear filters”**, debounced name field (700 ms, same debounce as the orders
  order-number field).
- **`ProductListComponent`** does not embed filters. It exposes **`clearFilters`**
  (`output<void>`) for empty-state actions; the page wires **`(clearFilters)`** to
  **`onClearFilters()`** (same idea as **`OrderListComponent`**).

Backend module boundaries live in the Invoria solution `Invoria/ai/Architecture.md`; Angular
conventions for this repo are in `docs/architecture/overview.md` and
`docs/guides/frontend-list-conventions.md`.
