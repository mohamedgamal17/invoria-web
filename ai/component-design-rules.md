# Component design rules

These rules describe **conventions for smart vs presentational components**, URL-driven list state, NgRx state modules, and API boundaries. The **Customers** feature (`src/app/features/customers/`) is the **reference implementation**: an NgRx-backed list page with query-param pagination, URL adapter effects, and presentational component children.

It complements [api-services-and-models.md](./api-services-and-models.md) for HTTP types (`ApiResponse`, `Paging`, `Entity`), request naming, and service structure.

---

## 1. Feature layout

- **`pages/`** — Smart container (e.g. `customers-page`): store selector mapping, URL write glue, navigation. No data fetching, no local async state.
- **`components/`** — Presentational UI: list, filter panel, form dialog, list skeleton. No feature service injection.
- **`services/`** — `CustomersApiService`: `HttpClient` only, returns `Observable<ApiResponse<...>>`. Only effects inject it, never pages directly.
- **`models/`** — `*.entity.ts` for domain types; `*.request.ts` for list/body shapes.
- **`store/`** — One state module per page/usage, each self-contained: `actions.ts`, `reducer.ts`, `selectors.ts`, `effects.ts`, plus a separate `<feature>-url/` adapter effect folder when the URL drives the state (see [§3](#3-ngrx-feature-store-modules-customers-reference)).
- **Standalone** components only; explicit `imports` in `@Component`.

---

## 2. Smart page (`CustomersPageComponent`)

### Scope: glue only

The smart page owns **no business state**. It maps NgRx selectors to signals, writes the URL, and navigates.

### Dependency injection and fields

- Inject **`Store`** plus `Router` / `ActivatedRoute` (for URL writes) and **`PaginationService`** (page-size validation + paginator-event math). No API service, no `MessageService`, no `rxResource`.
- Map state with **`this.store.selectSignal(selector)`** into **`readonly`** fields whose names follow the state, not the transport: **`customers`**, **`paging`**, **`listLoading`**, **`pageIndex`**, **`pageSize`**, **`nameFilter`**, **`first`**.
- Use **`untracked(this.signal)`** inside event handlers when reading the previous value (avoids signal-reactivity side effects).

### URL contract: component writes, store reads

- The component is the **URL write adapter**: user intents (`onPageChange`, `onFiltersChange`, `onClearFilters`) validate/no-op against `untracked()` state and then **`router.navigate`** with `queryParamsHandling: 'merge'`:
  - Page change → `{ page: pageIndex + 1, pageSize }`; manual page changes also **`window.scrollTo({ top: 0, behavior: 'smooth' })`**.
  - Filter change → `{ q: name || null, page: 1 }`; clear → `{ q: null, page: 1 }`; skip navigation when the normalized value already matches the current state.
- The **store reads the URL** (see [§3](#3-ngrx-feature-store-modules-customers-reference)); the reducers no-op identical values, so the component's `merge` writes round-tripping through `ROUTER_NAVIGATED` are harmless.
- Nothing in the component reads `route.queryParamMap` — keep names free of "...FromRoute"/"...FromUrl"-style transport wording.

### Error presentation

- Errors flow through the reducers' **`AsyncRequestState`** fragment and the **global `AppErrorEffects`** (`APP_ERROR_ACTIONS.apiError` → toast + error-route navigation). The page does **not** provide a scoped `MessageService`; a single root-provided `MessageService` + `p-toast` in the template are shared feature-wide.

### Imports and helpers

- Prefer import order: **Angular** → **RxJS** → **third-party (PrimeNG, NgRx)** → **app** paths (`core`, `shared`, feature `services` / `models` / `components` / `store`).

---

## 3. NgRx feature store modules (Customers reference)

Follows `core/` `provideStore`/`provideRouterStore` plus **route-scoped state**: each feature's data slices are provided in `customers.routes.ts` via `provideState(FEATURE_KEY, reducer)` / `provideEffects(...)` on the owning route entry. Each module folder under `features/customers/store/` contains:

### Naming

- Folder `store/<feature-key-kebab>/` with files `<feature-key-kebab>.actions.ts` / `.reducer.ts` / `.selectors.ts` / `.effects.ts`.
- **`FEATURE_KEY`** = camelCase (`customersList`, `customerDetails`, `customerDetailsOrders`); actions grouped in one **`<FEATURE>_ACTIONS`** object (`as const`) with source labels `'[<Feature> <Area>] <Action>'`.
- State fields carry **selector-friendly** names; selectors exported as **`xSelectors`** objects including derived ones: `selectIsLoading` (from `request.status`), `selectPaging` (`info ?? EMPTY_PAGING_INFO`), `selectFirst` (`pageIndex * pageSize`).

### Reducer conventions

- State embeds the shared **`AsyncRequestState`** fragment (`status` / `error` / `failureNonce`) via `shared/models/async-request-state.ts` helpers (`startLoading`, `applyFailure`); failures also clear list data and the **`fetchedQuery`** so the same query is re-triggerable.
- **Paging + filters**: user/URL events write plain values; a single internal trigger (`loadCustomers`) goes through a normalized **`fetchedQuery`** identity — identical queries no-op (page stays put), so duplicate triggers never refetch (see `customer-details-orders` for the canonical funnel).
- URL application actions (`setQueryFromUrl`) normalize values inside the reducer (trim filters) and no-op when nothing changes.

### Effects conventions

- **Data-only**: `prepareFetch` funnel → `loadCustomers`; the fetch effect consumes `withLatestFrom(state)`, filters on `request.status === Loading`, dedupes by **state identity** (`distinctUntilChanged`, since no-op passes keep references), and `switchMap`s so a superseding query cancels the in-flight one.
- Success/failure branch on `res.isSuccess` with `mergeMap`; both the mapped failure and `catchError` emit **`<ACTIONS>.loadXFailure({ error })` + `APP_ERROR_ACTIONS.apiError({ error })`** — the global `AppErrorEffects` owns toasts/navigation.

### URL adapter (`store/<feature>-url/<feature>-url.effects.ts`)

- Listens for **`routerNavigatedAction`** from `@ngrx/router-store` (`RouterState.Minimal`; root wiring in `app.config.ts`), gates on the owning route (e.g. URL pattern `/^\/customers(?:[?#]|$)/` for the list, `routeParams.id` presence for details), then dispatches `setQueryFromUrl` actions built via **`PaginationService`** parse helpers.
- All normalization (1-based `page` → 0-based index, page-size option validation, trimming) lives in the parse helpers/reducer — never in the page component.

---

## 4. Presentational components

### `CustomerListComponent`

- Use **`input()`** and **`output()`** only; **no** `CustomersApiService` or router.
- Pass **`customers`**, **`loading`**, **`totalRecords`**, pagination inputs, and handle **`pageChange`** / **`editCustomer`** / **`deleteCustomer`** in the parent.

### `CustomerFormDialogComponent`

- Use **`model(false)`** for dialog visibility (two-way **`[(visible)]`** with the parent).
- Use **`input()`** / **`output()`** for mode, saving state, name, submit, cancel, hide.
- **Submit path:** **`(ngSubmit)="onFormSubmit($event)"`** with **`event.preventDefault()`** then **`submit.emit()`**; primary action uses **`type="button"`** and **`(onClick)="submit.emit()"`** so a single user action does not double-fire submit (and the parent can guard with a saving flag).

### Skeleton

- Use a dedicated skeleton component for loading layout; parent drives **`loading`** from the store's `selectIsLoading`-derived `listLoading` signal (in-flight request state), not from stale local patches.

---

## 5. API service (`CustomersApiService`)

- **`inject(HttpClient)`**; build **`baseUrl`** from **`environment.apiUrl`**.
- Expose methods returning **`Observable<ApiResponse<...>>`**.
- Use a small feature-local helper for **`HttpParams`** (e.g. **`Skip`** / **`Length`** for list).
- Validate obvious bad input with **`throwError`** before calling HTTP where appropriate.
- Pages **never** inject API services for their own list flows — only state-module effects do. (Exceptions are feature cross-imports documented in [ARCHITECTURE.md](./ARCHITECTURE.md) §7, which allow the typed API services for autocomplete/report flows.)

---

## 6. Models

- **`customer.entity.ts`**: domain interface extending **`Entity`** from `core`.
- **`create-customer.request.ts`**, **`update-customer.request.ts`**, **`list-customer.request.ts`**: request/query shapes aligned with the API (PascalCase property names if that matches backend JSON).
- At call sites, use **`satisfies`** on request object literals so literals stay type-checked against the request type.

---

## 7. File reference

| Role | Path |
|------|------|
| Smart page | `src/app/features/customers/pages/customers-page/customers-page.component.ts` |
| Page template | `src/app/features/customers/pages/customers-page/customers-page.component.html` |
| List store module | `src/app/features/customers/store/customers-list/` |
| List URL adapter | `src/app/features/customers/store/customers-list-url/customers-list-url.effects.ts` |
| Details store modules | `src/app/features/customers/store/customer-details/`, `store/customer-details-orders/`, `store/customer-details-url/` |
| Feature route wiring | `src/app/features/customers/customers.routes.ts` |
| List UI | `src/app/features/customers/components/customer-list/` |
| Filter panel | `src/app/features/customers/components/customers-filter-panel/` |
| Form dialog | `src/app/features/customers/components/customer-form-dialog/` |
| List skeleton | `src/app/features/customers/components/customer-list-skeleton/` |
| API | `src/app/features/customers/services/customers-api.service.ts` |
| Models | `src/app/features/customers/models/` |
| Global error presentation | `src/app/shared/store/app-error.effects.ts` |
