---
name: ngrx-list-mutations
description: Use when syncing create/update mutations into an NgRx paged-list slice without refetching — store-owned mutations slice (createProduct/updateProduct + effect), form page as dumb submit wrapper, mutation-effect success firing productCreated/customerUpdated prepend-on-top, silent totalCount bump, pageSize trim, replace-or-ignore, local mutation sync, list stale after create. Applies the products reference implementation to customers and other `*-list` slices in this repo.
compatibility: Invoria Web (Angular 21, @ngrx/store 22)
---

# NgRx store-owned mutations + list local sync

Rules for store-owned create/update mutations so a **paged-list slice** stays in
sync **without calling the list API again**. The form page is a dumb submit
wrapper: it validates the form and dispatches a mutation request action; the
**mutations slice + effect** performs the typed API call, presents success
(toast + navigation), and funnels the API-returned entity into the list slice's
local-sync actions. Follow the reference implementation; do not invent new shapes.

## 1. Read these first (reference map)

| Concern                                              | File                                                                                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reference implementation (actions / reducer / effects / spec) | `src/app/features/products/store/products-mutations/`, `src/app/features/products/store/products-list/`                                                                   |
| Second implementation                                | `src/app/features/customers/store/customer-mutations/`, `src/app/features/customers/store/customers-list/`                                                                |
| Form-page dispatch sites                             | `src/app/features/products/pages/product-form-page/product-form-page.component.ts`, `src/app/features/customers/pages/customer-form-page/customer-form-page.component.ts` |
| Shell-scoped provider wiring                         | `src/app/features/products/products.routes.ts`, `src/app/features/customers/customers.routes.ts`                                                                          |
| Global error presentation                            | `src/app/shared/store/app-error.effects.ts` (`APP_ERROR_ACTIONS.apiError`)                                                                                                |
| Paging types                                         | `src/app/core/models/paging.ts` (`PagingInfo`)                                                                                                                            |
| Request fragment                                     | `src/app/shared/models/async-request-state.ts` (`AsyncRequestState`, `startLoading`, `applyFailure`)                                                                      |
| Paging conventions (page size options, URL contract) | `docs/frontend-list-conventions.md`, skill `ngrx-page-state`                                                                                                              |

## 2. Action taxonomy

### Mutations slice (`<FEATURE>_MUTATIONS_ACTIONS`, `"Feature" <Verb>` titles)

Carry the **request body** (validated by the form) and, for update, the `id`:

```ts
createProduct: createAction('[Products] Create Product', props<{ request: CreateProductRequest }>()),
createProductSuccess: createAction('[Products] Create Product Success', props<{ product: Product }>()),
createProductFailure: createAction('[Products] Create Product Failure', props<{ error: unknown }>()),
updateProduct: createAction('[Products] Update Product', props<{ id: string; request: UpdateProductRequest }>()),
updateProductSuccess: createAction('[Products] Update Product Success', props<{ product: Product }>()),
updateProductFailure: createAction('[Products] Update Product Failure', props<{ error: unknown }>()),
```

### List slice (`<FEATURE>_LIST_ACTIONS`, `'[Feature List] Verb'` titles)

The two local-sync actions carry the **API-returned entity** (never the request
body) — `productCreated` / `productUpdated` (customers: `customerCreated` /
`customerUpdated`). They are consumed only by the list reducer; they must never
funnel into `loadX` / `setQueryFromUrl` (that would refetch).

## 3. Mutations reducer rules

State: `{ createRequest: AsyncRequestState; updateRequest: AsyncRequestState }`,
each starting at `INITIAL_ASYNC_REQUEST_STATE`.

- **Double-submit guard:** `createX` / `updateX` while that fragment is
  `LOAD_STATUS.Loading` returns the **same state reference** — one request in
  flight. Fragments are independent (create and update never touch each other).
- Success: set the fragment's `status` to `LOAD_STATUS.Loaded`.
- Failure: `applyFailure(fragment, error)` (inline error detail + `failureNonce`).
- Silent create/update sync into the list slice is done by the **effect
  dispatch** (see below), never by joining slices in a reducer.

## 4. Mutations effects rules

- **One `exhaustMap` effect per verb:** calls the typed API service (same
  guard style as the list fetch effects: `mergeMap` on `res.isSuccess &&
  res.result`, error fallback `res.error ?? new Error('Failed to …')`, then
  `catchError`).
- **Success path** dispatches two actions in one `of(...)`:
  `xSuccess({ product })` **and** the list-sync action
  `PRODUCTS_LIST_ACTIONS.productCreated({ product: res.result })` /
  `productUpdated(...)`. The list reducer's silent prepend/replace then runs in
  the same dispatch batch.
- **Failure path** dispatches `xFailure({ error })` **and**
  `APP_ERROR_ACTIONS.apiError({ error })` — do NOT present API errors yourself;
  the global `AppErrorEffects` owns error toasts/navigation.
- **Success presentation** is a `{ dispatch: false }` tap effect injecting the
  `MessageService` and `Router`: success toast (same text as before the
  refactor, e.g. `'Product created successfully.'`) then navigate to the
  **absolute** details route `['/products', product.id]` (create and update both
  landed on details before navigation left the form page). Keep the existing
  destination per feature — mirror the pre-refactor `relativeTo` navigation.

## 5. Form-page wiring (dumb submit wrapper)

- **Store lifetime (load-bearing):** the list AND mutations slices must both be
  provided on the owning **shell/parent route**, not the list route only
  (`products.routes.ts`: the shell route attaches `[...PRODUCTS_LIST_PROVIDERS, ...PRODUCTS_MUTATIONS_PROVIDERS]`;
  customers: same on the parent `''` route). Route-scoped providers on
  `path:''` (list) are destroyed on `/new` and `/:id/edit`, so a form-page
  dispatch would land in a dead slice.
- **`submit()` flow:** validate (`markAllAsTouched` when invalid) → guard
  `if (this.saving()) return` → build the request body (`satisfies` on the
  update) → `dispatch(PRODUCT_MUTATIONS_ACTIONS.createProduct({ request }))` or
  `updateProduct({ id, request })`. No API call, no `MessageService` success
  toast, no navigation after mutation.
- **`saving`:** computed over the mutations feature's `selectCreateRequest` /
  `selectUpdateRequest` via `store.selectSignal`; the page binds
  `status === LOAD_STATUS.Loading ||` across both fragments. The
  template binds stay unchanged (`[disabled]`/`[loading]`).
- **Edit-mode prefetch** (`getProduct`) stays a local `take(1)` API call in the
  page. Edit-load errors keep presenting with `presentApiError` inline.
- The form page keeps its `<p-toast />` bound to the **root** `MessageService`
  (do NOT re-scope `providers: [MessageService]` on the page — the mutation
  effect injects the root instance).

## 6. List reducer rules (`xCreated` / `xUpdated` — unchanged contract)

Both handlers are **silent**: never touch `request` (no loading spinner) and
never touch `fetchedQuery` (returning to the list with the same URL must stay a
no-op, not a refetch).

### Created (`xCreated`)

- **Guard:** if `info === null || fetchedQuery === null` (page never loaded),
  return the same state reference — there is no page to sync into.
- **Guard:** if an item with the same `id` is already in the array, return the
  same state reference (duplicate dispatch must not double-count).
- **Always** bump the paging total silently:
  `info = { ...info, totalCount: info.totalCount + 1, length: Math.min(items.length, pageSize) }`.
- **Prepend only when the new item belongs on the visible page:**
  `pageIndex === 0` **and** the filter matches
  (`!nameFilter || entity.name.toLowerCase().includes(nameFilter.toLowerCase())`).
  Trim with `.slice(0, pageSize)`; the dropped last row reappears on the next
  real fetch. When the gate fails, keep the array unchanged and only bump
  `totalCount`.

### Updated (`xUpdated`)

- **Guard:** if `info === null`, return the same state reference.
- **Replace-or-ignore:** if the id is not in the current array, return the
  **same state reference** — the next real fetch will include it.
- Never change `totalCount` on update.

## 7. Checklist when applying to a new `*-list` slice

1. Re-read the products reference (`products-mutations` + `products-list`) before
   copying semantics (same-reference no-ops and silent sync are load-bearing).
2. Create `<store-dir>/<feature>-mutations/` — actions, reducer, effect, spec.
3. The mutations effect must dispatch the list sync action in its success `of()`.
4. Attach mutations providers to the same shell/parent route as the list slice.
5. Convert the form page into the dumb submit wrapper (§4/§5): no API mutation
   call, no success toast, no post-mutation navigation.
6. Add reducer specs: loading/failure/success transitions per fragment,
   double-submit same-reference no-op, fragments independent.
7. Keep the list-slice spec cases: prepend on page 0, trim to `pageSize`,
   total-only on non-first page, total-only on filter mismatch, prepend on
   filter match, no-op when `info`/`fetchedQuery` null, duplicate-id no-op;
   update replace-in-place, same-reference ignore when absent, no-op when
   `info` null; assert `request`/`fetchedQuery` references are untouched.
8. Run the touched feature's specs, prettier, and typecheck after editing.
