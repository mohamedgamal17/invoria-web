---
name: ngrx-page-state
description: Use when adding, adjusting, or debugging pagination/page state in NgRx store slices — page index, page size, filters resetting paging, URL-driven page/rows params, lazy tab fetch gates, AsyncRequestState, PaginationService, fetchedQuery, reducer selectors and effects for paged lists in this repo.
compatibility: Invoria Web (Angular 20, @ngrx/store 22)
---

# NgRx page/pagination state

Rules for **tuning page state** (paging, filters, URL sync, lazy fetch gates, request status) inside
NgRx feature store slices. Follow the reference implementation; do not invent new shapes.

## 1. Read these first (reference map)

| Concern | File |
| --- | --- |
| Full paged-list slice (actions / reducer / selectors / effects / spec) | `src/app/features/customers/store/customer-details-orders/` |
| URL adapter effect (`page` / `rows` / `tab` params → store) | `src/app/features/customers/store/customer-details-url/customer-details-url.effects.ts` |
| Paging parse/normalize helpers | `src/app/shared/utils/pagination.service.ts` |
| Request lifecycle helpers | `src/app/shared/models/async-request-state.ts`, `src/app/shared/models/load-status.ts` |
| API paging types | `src/app/core/models/paging.ts` (`PagingInfo`) |
| Query-param contract + page size options | `docs/frontend-list-conventions.md` |

If the target feature needs a new paged list, scaffold it by mirroring
`customer-details-orders` (same file names, same action/reducer/effect taxonomy), renamed per feature.

## 2. State shape

A paged-list slice contains, at minimum:

```ts
interface CustomerOrdersState {
  customerId: string;             // owning entity context (or other slice scope key)
  ordersTabOpened: boolean;       // optional lazy gate: fetch only after UI opens the tab
  pageIndex: number;              // 0-based, observed from the `page` query param
  pageSize: number;               // observed from the `rows` query param
  filters: OrdersListFilters;
  fetchedQuery: CustomerOrdersQuery | null; // the exact normalized query behind in-flight/loaded data
  orders: UiOrder[];              // current API page
  info: PagingInfo | null;        // API paging details of the current page
  request: AsyncRequestState;
}
```

- `pageSize` defaults to **25**; valid options come from `DEFAULT_PAGE_SIZE_OPTIONS` (`[25, 50, 100, 200]`) via `PaginationService`.
- Model the fetch identity as a small `Query` interface (paging + normalized filters); implement `sameQuery` / `sameFilters` helpers next to the state (`orderNumber` is trimmed so plain equality works).

## 3. Action taxonomy

```ts
CUSTOMER_ORDERS_ACTIONS = {
  ordersTabOpened,   // lazy gate: UI click or `tab=orders` in the URL
  setPagingFromUrl,  // URL adapter only; concrete pageIndex/pageSize (defaults applied at parse time)
  pageChange,        // user-initiated paginator event
  filtersChange,     // replaces all filters; reset paging to first page
  filtersClear,      // clears all filters; reset paging to first page
  loadOrders,        // internal: the single fetch trigger; the reducer decides
  loadOrdersSuccess, // props: { items, info }
  loadOrdersFailure, // props: { error }
  reset,             // props: { customerId } — clears the slice when another entity is loading
}
```

- Action titles use the `'[Feature Slice] Verb'` bracket convention.
- User intents and the URL adapter action are **separate** actions; never let the URL effect dispatch `pageChange` directly (harmless round-trips no-op via the identical-value check).
- The component writes `page` / `rows` query params itself (`replaceUrl` navigation); the URL adapter effect closes the loop by re-applying them into the store.

## 4. Reducer rules

- Pure and immutable; **no-op on identical values** so URL round-trips are harmless:
  ```ts
  on(...setPagingFromUrl, (state, { pageIndex, pageSize }) => {
    return pageIndex === state.pageIndex && pageSize === state.pageSize
      ? state
      : { ...state, pageIndex, pageSize };
  })
  ```
- `filtersChange` / `filtersClear` always reset **`pageIndex` to 0** in the same transition.
- `loadOrders` is the **gatekeeper**: only start loading when the gate is open, the owning context is known, and the query differs from `fetchedQuery`; otherwise return unchanged state:
  ```ts
  on(loadOrders, (state) => {
    if (!state.ordersTabOpened || !state.customerId) return state;
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) return state;
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  })
  ```
- `loadOrdersFailure` clears `orders`, `info`, and `fetchedQuery`, then calls `applyFailure(state.request, error)`.
- An identical `loadOrders` that no-ops keeps the **same state references** — this is relied upon by the effects (fetch-round identity).

## 5. Effect rules

- **Gate reset**: when the owning entity (`:id`) reloads, clear the slice for the incoming id, compare against the current id first.
- **Funnel effect**: map *all* change actions (`ordersTabOpened`, `setPagingFromUrl`, `pageChange`, `filtersChange`, `filtersClear`) → `loadOrders()`, so every navigation/user change funnels into one trigger.
- **Re-trigger after context load**: if the gate was already open when the entity arrived (`loadCustomerSuccess`), dispatch `loadOrders()` — deep links land on the URL before the entity exists.
- **Fetch effect**:
  - `withLatestFrom` the slice state + owning entity; filter on `request.status === LOAD_STATUS.Loading` and entity presence (the reducer vetted the request);
  - `distinctUntilChanged` on the **state reference** (`sameFetchRound = a === b`) to suppress duplicate no-op `Load` copies;
  - `switchMap` so superseding triggers cancel the in-flight request;
  - build request math from state (`Skip = pageIndex * pageSize`, `Length = pageSize`); map `ApiResponse` → `loadOrdersSuccess` or `loadOrdersFailure` + `APP_ERROR_ACTIONS.apiError({ error })` (global error presentation lives in `AppErrorEffects`; keep slice effects data-only).
- **URL adapter effect** (`customer-details-url.effects.ts` pattern):
  - trigger on `routerNavigatedAction` **and** `loadCustomerSuccess` (deep links arrive before the entity exists);
  - guard: route params contain the entity id, the loaded entity matches it, and not still loading;
  - parse scalars defensively — repeated params / non-scalar values → `null` → parse helpers apply the defaults (`0` / `25`);
  - validate through `PaginationService.parseNonNegativeInt` (number in, defaults to `0`) / `normalizePageSize` (number in, falls back to `25` for page sizes outside the options);
  - apply **paging before the gate action** in the same batch so one URL update funnels into exactly one settled fetch.

## 6. Wiring

- Register in the feature's lazy route only: `provideState(CUSTOMER_ORDERS_FEATURE_KEY, customerOrdersReducer)` + `provideEffects([...])` in `*.routes.ts` (`createFeature({ name, reducer })` exports the feature + selectors).
- Feature keys are `camelCase` strings adjacent to the reducer (`'customerDetailsOrders'`).
- View models (`UiOrder` mapping) happen in the effects' mapper before dispatching success — the store holds **UI-ready** page data.

## 7. Checklist when tuning existing slices

1. Re-read the reference slice before changing semantics (no-op semantics and status flags are load-bearing).
2. Changing reducer conditions? Update/extend the `*.reducer.spec.ts` next to it.
3. New URL param? Add it to the URL adapter's `actionsFromUrlQuery` with scalar parsing + validation; keep defaults in the **reducer**, never in the adapter.
4. Prefer `firstValueFrom`-free, effect-driven flows here — components dispatch actions and select state only.
5. Run lint, typecheck, and the touch feature's specs after editing.
