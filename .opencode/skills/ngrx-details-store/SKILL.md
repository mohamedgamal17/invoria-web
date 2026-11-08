---
name: ngrx-details-store
description: Use when building or reviewing a details/single-entity page (entity load, tabs, child paged panels, entity mutations originating elsewhere) — API calls live only in page components dispatching into NgRx state modules, never in view/panel components; the details store holds the entity and silently folds in mutation-success results for the currently edited entity id (edit synced from the *-mutations slice without refetching); background re-fetch keeps the entity visible. Applies the product-details reference implementation to customers and future detail pages in this repo.
compatibility: Invoria Web (Angular 21, @ngrx/store 22)
---

# NgRx details (single-entity) page state

Conventions for a *details page* store, using
`src/app/features/products/store/product-details*` as the reference implementation.

## 1. Read these first (reference map)

| Concern | File |
| --- | --- |
| Entity + tabs slice (actions / reducer / selectors / effects) | `src/app/features/products/store/product-details/` |
| Paged child-tab slice (paging, lazy gate, fetch, mutations) | `src/app/features/products/store/product-details-batches/` |
| URL adapter effect (`tab` / `page` / `pageSize`) | `src/app/features/products/store/product-details-url/` |
| Silent mutation sync (details reducer listens to mutations) | `product-details.reducer.ts` → `on(PRODUCT_MUTATIONS_ACTIONS.updateProductSuccess, ...)` |
| Tab slug validation util | `src/app/features/products/utils/product-details-tab.ts` |
| Request lifecycle helpers | `src/app/shared/models/async-request-state.ts`, `load-status.ts` |
| Paged-slice reducer/effect rules | the `ngrx-page-state` skill |

## 2. Hard rules

- **All API calls flow through the page component and its store** — a page
  dispatches actions; view/panel/list/tab components are presentational (they
  receive state via `input()`s and emit intents via `output()`s). Never inject
  an API service into a panel or view component. The batches panel
  (`inventory/components/product-batches-panel.component.ts`) and the batches
  modal are pure presentation; the details page's store owns every batches call.
- **The details store silently syncs entity mutations.** When the store holds
  the entity whose id was just mutated (e.g. `updateProductSuccess` from the
  `products-mutations` slice), the details reducer replaces the entity in place
  — no refetch, no navigation, no loading flicker:

  ```ts
  on(PRODUCT_MUTATIONS_ACTIONS.updateProductSuccess, (state, { product }) =>
    state.product !== null && state.product.id === product.id
      ? { ...state, product }
      : state,
  )
  ```

  The details store is the single source of truth for the currently held entity
  id: while the user views/edits that product, the store stays the winner over
  any panel-local caches, and this in-place sync is enforced for all future
  details / single-entity state stores in this repo.
- **Background refresh keeps the entity visible.** A re-fetch triggered by side
  data changes (e.g. a batches mutation changed stock aggregates) uses a separate
  `refreshProduct {productId}` action: the reducer only flips the request to
  loading and keeps the entity; `loadProduct` (initial load / `:id` change)
  still clears it.
- **Load-failure presentation is global.** Slice effects are data-only: failure
  → slice failure action + `APP_ERROR_ACTIONS.apiError({ error })`; the global
  `AppErrorEffects` presents the toast and any `routeTarget` navigation. The
  inline error still renders from `AsyncRequestState.error`.

## 3. Taxonomy

- Entity+tab slice: `loadProduct {productId}`, `refreshProduct {productId}`,
  `loadProductSuccess {product}`, `loadProductFailure {error}`,
  `setActiveTab {activeTab}` — the tab is a **string enum whose values double as
  URL slugs** (`info` / `batches` / `orders`); validate raw slugs via the
  feature's `utils/*.tab.ts` helper.
- Paged child-tab slice (see `ngrx-page-state` for reducer/effect rules):
  `{entityName}TabOpened` gate, `setPagingFromUrl`, `pageChange`, `load*`,
  `load*Success/Failure`, `reset {entityId}`, plus mutation fragments
  (`createBatch` / `updateBatch` + `saveRequest: AsyncRequestState`).
- Products URL contract (differs from customers!): `page` is **1-based**
  (`tab=batches&page=2&pageSize=50`); the URL adapter normalizes it with
  `pageIndexFromPageParam` (see `products-list-url.effects.ts`). The page
  component writes query params per tab: batches → `tab` + `page` + `pageSize`;
  other tabs → `tab` only.

## 4. Wiring checklist

1. Register the slices on the details route in `<feature>.routes.ts`
   (`provideState` × 2 + `provideEffects` × 3) like `PRODUCT_DETAILS_PROVIDERS`.
2. Mutations dispatched from the details page (delete) ride the shared
   `*-mutations` slice registered on the shell route; success presentation is a
   `dispatch: false` tap effect (toast + `router.navigate`), and a local
   list-sync action (e.g. `productDeleted`) keeps the list slice coherent.
3. No-op semantics are load-bearing: URL round-trips and duplicate intents must
   return the *same state references* — the effects rely on it (fetch-round
   identity).
4. Reset the paged child slice on `loadProduct` when the id changes
   (`resetOnProductLoad$`); re-trigger its fetch when the gate was already open
   (on `loadProductSuccess`).
5. Specs: a reducer spec per slice next to it (`product-details.reducer.spec.ts`,
   `product-details-batches.reducer.spec.ts`), including the silent-sync tests
   ("holds the id → folds in unchanged/live; holds another id → returns the same
   state").
