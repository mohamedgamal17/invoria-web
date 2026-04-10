# Component design rules

These rules describe **conventions for smart vs presentational components**, URL-driven list state, and API boundaries. The **Customers** feature (`src/app/features/customers/`) is the **reference implementation**: a signal-heavy list page with a modal form, query-param pagination, and local list updates without mutating the async resource.

It complements [api-services-and-models.md](./api-services-and-models.md) for HTTP types (`ApiResponse`, `Paging`, `Entity`), request naming, and service structure.

---

## 1. Feature layout

- **`pages/`** — Smart container (e.g. `customers-page`): routing, API calls, toasts, URL state, `rxResource`, `linkedSignal`.
- **`components/`** — Presentational UI: list, form dialog, list skeleton. No feature service injection.
- **`services/`** — `CustomersApiService`: `HttpClient` only, returns `Observable<ApiResponse<...>>`.
- **`models/`** — `*.entity.ts` for domain types; `*.request.ts` for list/body shapes.
- **Standalone** components only; explicit `imports` in `@Component`.

---

## 2. Smart page (`CustomersPageComponent`)

### Dependency injection and fields

- Use **`inject()`** for services, `Router`, and `ActivatedRoute`.
- Mark injected dependencies **`private readonly`** where they are implementation details.
- Expose **`readonly`** signals/computeds the template needs (`pageSize`, `pageIndex`, `displayCustomers`, `displayPaging`, etc.).

### URL as source of truth

- Derive **`page`** (1-based) and **`pageSize`** from **`ActivatedRoute.queryParamMap`** via **`toSignal(..., { initialValue })`**.
- Validate query values (e.g. `page` ≥ 1; `pageSize` must be one of a fixed options array); fall back to safe defaults.
- Use **`computed`** for **`pageIndex`** (0-based) and **`listRequest`** (`Skip` / `Length` for the API).

### List loading: `rxResource`

- Type the resource as a **tuple** **`[Customer[], PagingInfo]`** (no combined list-result interface).
- Keep a **shared constant** for the empty tuple (empty array + zeroed `PagingInfo`) for `defaultValue`, API failure branches, and `catchError`.
- In **`stream`**, map a successful **`ApiResponse<Paging<Customer>>`** to **`[data, info]`**; on failure, show a **`MessageService`** error toast and return the empty tuple.

### View layer: `linkedSignal`

- Add **two `linkedSignal`s** (e.g. **`displayCustomers`**, **`displayPaging`**) for what the table shows.
- Share one private **`customersLinkSource()`** that returns `{ request, customers, paging }` by reading **`listRequest()`** and **`customersResource.value()`** so that **any route or refetch** re-runs the linked `computation` and re-seeds the UI from the server.
- **`computation`**: copy data out of the source (e.g. spread customers into a new array; shallow copy `paging`) so the view does not hold mutable references into the resource value.

### Mutations after create / update

- Guard **`submitModal`** with a saving flag; use **`take(1)`** and **`finalize`** to clear it.
- **Create:** If **`pageIndex() === 0`**, **`displayCustomers.update`** (prepend new entity; if the list is already full for the current **`pageSize()`**, keep length by **`[new, ...prev.slice(0, pageSize - 1)]`**) and **`displayPaging.update`** to increment **`totalCount`**. Then **`router.navigate`** to **`page: 1`** with **`queryParamsHandling: 'merge'`** (preserves `pageSize`). If the user was not on page 1, skip the local patch and rely on navigation + resource reload.
- **Update:** **`displayCustomers.update`** only (replace row by **`id`** with the API result). **Do not** navigate to page 1 on edit.

### Toasts

- Provide **`MessageService`** on the **page component** (`providers: [MessageService]`) so toasts for that route are scoped with the container. Pair with **`p-toast`** in the page template.

### Imports and helpers

- Prefer import order: **Angular** → **RxJS** → **third-party (e.g. PrimeNG)** → **app** paths (`core`, feature `services` / `models` / `components`).
- Keep small **private** helpers (e.g. formatting API error details) at the bottom of the class.

---

## 3. Presentational components

### `CustomerListComponent`

- Use **`input()`** and **`output()`** only; **no** `CustomersApiService` or router.
- Pass **`customers`**, **`loading`**, **`totalRecords`**, pagination inputs, and handle **`pageChange`** / **`editCustomer`** / **`deleteCustomer`** in the parent.

### `CustomerFormDialogComponent`

- Use **`model(false)`** for dialog visibility (two-way **`[(visible)]`** with the parent).
- Use **`input()`** / **`output()`** for mode, saving state, name, submit, cancel, hide.
- **Submit path:** **`(ngSubmit)="onFormSubmit($event)"`** with **`event.preventDefault()`** then **`submit.emit()`**; primary action uses **`type="button"`** and **`(onClick)="submit.emit()"`** so a single user action does not double-fire submit (and the parent can guard with a saving flag).

### Skeleton

- Use a dedicated skeleton component for loading layout; parent drives **`loading`** from **`customersResource.isLoading()`** (network state), not from the linked display signals after local patches.

---

## 4. API service (`CustomersApiService`)

- **`inject(HttpClient)`**; build **`baseUrl`** from **`environment.apiUrl`**.
- Expose methods returning **`Observable<ApiResponse<...>>`**.
- Use a small feature-local helper for **`HttpParams`** (e.g. **`Skip`** / **`Length`** for list).
- Validate obvious bad input with **`throwError`** before calling HTTP where appropriate.

---

## 5. Models

- **`customer.entity.ts`**: domain interface extending **`Entity`** from `core`.
- **`create-customer.request.ts`**, **`update-customer.request.ts`**, **`list-customer.request.ts`**: request/query shapes aligned with the API (PascalCase property names if that matches backend JSON).
- At call sites, use **`satisfies`** on request object literals so literals stay type-checked against the request type.

---

## 6. File reference

| Role | Path |
|------|------|
| Smart page | `src/app/features/customers/pages/customers-page/customers-page.component.ts` |
| Page template | `src/app/features/customers/pages/customers-page/customers-page.component.html` |
| List UI | `src/app/features/customers/components/customer-list/` |
| Form dialog | `src/app/features/customers/components/customer-form-dialog/` |
| List skeleton | `src/app/features/customers/components/customer-list-skeleton/` |
| API | `src/app/features/customers/services/customers-api.service.ts` |
| Models | `src/app/features/customers/models/` |
