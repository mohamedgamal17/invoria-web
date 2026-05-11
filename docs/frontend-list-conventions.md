# Frontend list conventions (Angular)

This document describes **Angular** patterns used for data tables and card lists in this app. For **backend** module boundaries (Catalog, Ordering, Inventory, etc.), see the Invoria solution architecture document at **`Invoria/ai/Architecture.md`** (in the Invoria solution repository; not shipped inside this web app repo).

## Primary row action (navigate to detail)

- Match the **View** pattern used in [`order-list.component.html`](../src/app/features/orders/components/order-list/order-list.component.html):
  - **Mobile (cards):** `label="View Details"`, `icon="pi pi-arrow-right"`, `size="small"`, `styleClass="h-9"`, container `flex flex-col items-end gap-2`.
  - **Desktop (table):** `label="View"`, `icon="pi pi-arrow-right"`, `size="small"`, `styleClass="h-8 px-3 mr-1"`, container `flex justify-end items-center gap-1` (add more actions beside View as needed).

[`product-list`](../src/app/features/products/components/product-list/product-list.component.html) follows this pattern for consistency.

## Paging and URL state

- List **pages** (not dumb list components) own persistence via **query parameters**:
  - `page` — 1-based page index.
  - `pageSize` — rows per page; must be one of the allowed options for that feature.
- Default **page size options** and **default page size** should match [`orders-page.component.ts`](../src/app/features/orders/pages/orders-page/orders-page.component.ts) unless a feature explicitly documents different values:
  - `pageSizeOptions = [25, 50, 100, 200]`
  - Default `pageSize` when missing or invalid: **25**

Parent pages pass `[pageSizeOptions]` into list components so the paginator stays in sync with URL parsing.

## Inventory batch lists (nested product route)

- On [`product-details-page`](../src/app/features/products/pages/product-details-page/product-details-page.component.ts), the **Batches** tab uses the **same `page` / `pageSize` query contract** as [`products-page`](../src/app/features/products/pages/products-page/products-page.component.ts), applied when **`tab=batches`** (for example `/dashboard/products/:id?tab=batches&page=...&pageSize=...`). The legacy path `/dashboard/products/:id/batches` is handled by a **`canActivate` route guard** in [`products.routes.ts`](../src/app/features/products/products.routes.ts) that navigates to `.../:id?tab=batches` (optional **`page`** / **`pageSize`** from the incoming URL).
- [`batch-list.component.ts`](../src/app/features/inventory/components/batch-list.component.ts) receives **`first`**, **`pageSize`**, and **`pageSizeOptions`** from [`product-batches-panel.component.ts`](../src/app/features/inventory/components/product-batches-panel.component.ts). The panel forwards **`pageChange`** to the owning page (same query contract here) or to [`product-batches-modal`](../src/app/features/inventory/components/product-batches-modal.component.ts) (local signals, reset when the dialog closes).
- **Edit** (primary row action for batches): **Desktop** — `label="Edit"`, `icon="pi pi-pencil"`, `size="small"`, `styleClass="h-8 px-3 mr-1"`. **Mobile** — same labels/icons with `styleClass="h-9"` in `flex flex-col items-end gap-2`, matching the visual weight of **View Details** on order cards.
- Table caption and mobile paginator show **Displaying X of Y batches** with the same paginator template pattern as [`product-list`](../src/app/features/products/components/product-list/product-list.component.html) (including rows-per-page dropdown on mobile).
