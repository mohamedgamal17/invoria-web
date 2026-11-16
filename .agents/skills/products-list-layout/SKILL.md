---
name: products-list-layout
description: Use when working on the products catalog list page or product list component in src/app/features/products/ — URL query ownership, spacing rhythm (gap-8), the shared name-filter panel (`app-name-filter-panel`, `NameListFilters`) used by products/orders, and the clearFilters wiring contract.
compatibility: Invoria Web (Angular 21)
---

# Products list page — spacing and filter (orders parity)

- **`ProductsPageComponent`** owns URL query params (`page`, `pageSize`, `name`) and data
  loading (`rxResource`, navigation). See `docs/guides/frontend-list-conventions.md` and
  `docs/architecture/overview.md` (smart vs presentational split).
- **Vertical rhythm:** the products catalog page root `<section>` uses **`flex flex-col gap-8`**
  between breadcrumb, header, and list — aligned with `orders-page`.
- **Filters:** use the shared **`NameFilterPanelComponent`**
  (**`app-name-filter-panel`**, `shared/ui/name-filter-panel/`) between the header and
  **`ProductListComponent`**, passing **`label`** + **`inputId`** (`products-name-filter`) and
  binding **`[name]`** / **`[loading]`** with **`(filtersChange)`** / **`(clearFilters)`**;
  the page types its handler with the shared **`NameListFilters`** (`{ name }`). The panel
  already implements the surface card, header row + "Clear filters", and the debounced name
  field (`SEARCH_DEBOUNCE_MS` from `shared/models/debounce.ts`) — do not re-implement it.
- **`ProductListComponent`** does not embed filters. It exposes **`clearFilters`**
  (`output<void>`) for empty-state actions; the page wires **`(clearFilters)`** to
  **`onClearFilters()`** (same idea as **`OrderListComponent`**).

Backend module boundaries live in the Invoria solution `Invoria/ai/Architecture.md`; Angular
conventions for this repo are in `docs/architecture/overview.md` and
`docs/guides/frontend-list-conventions.md`.
