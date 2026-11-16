# State Management Guidelines (Signals vs. NgRx)

This rule defines how state is structured, managed, and synchronized across **Invoria Web**.

---

## 1. Decision Matrix: Selecting the State Pattern

State management is decided per page based on **complexity**, not developer preference:

| Criteria | Simple State Pattern (Signals) | Complex State Pattern (NgRx) |
|---|---|---|
| **Scope** | Single, self-contained list, detail, or report page. | Shared state across multiple slices or sibling pages. |
| **Data Sharing** | No cross-page caching or synchronization needed. | Detail views needing cached list references, or shared filters. |
| **Mutations** | Form navigation or immediate refetch is sufficient. | Silent create/update sync into paged lists without refetching. |
| **Query Funnel** | Direct URL query param binding is adequate. | In-flight request cancellation (`switchMap`) + deduplication funnels (`fetchedQuery`). |
| **Reference** | `src/app/features/orders/` & `src/app/features/suppliers/` | `src/app/features/customers/` & `src/app/features/products/` |

---

## 2. Simple State Pattern: Component-Local Signals

For features following the Signals pattern:
1. **Query Param Binding**: Bind route parameters reactively using `toSignal(this.route.queryParamMap)`.
2. **Derived Request**: Compute API request parameters using `computed()`:
   ```ts
   readonly listRequest = computed(() => ({
     Name: this.nameFilter(),
     Skip: this.pageIndex() * this.pageSize(),
     Length: this.pageSize()
   } satisfies ListSupplierRequest));
   ```
3. **Data Fetching via `rxResource`**:
   - Use Angular `rxResource({ request: () => this.listRequest(), loader: ({ request }) => this.apiService.list(request) })`.
   - Expose loading state directly from `this.resource.isLoading()`.
4. **Display State via `linkedSignal`**: Use `linkedSignal` to derive editable or transient display states linked to the resource's output.
5. **Scoped Notification**: Provide `MessageService` directly in the component's `providers: [MessageService]` array and call `presentApiError()` from `core/http` on failure.

---

## 3. Complex State Pattern: NgRx Feature Store Modules

For features requiring NgRx (e.g. `customers`, `products`):

### 1. Route-Scoped State Slices
- Provide slices in the feature's route definition (e.g., `customers.routes.ts`) using `provideState(FEATURE_KEY, reducer)` and `provideEffects(...)`.
- Group slices by responsibility: `<feature>-list`, `<feature>-details`, `<feature>-url`.

### 2. Standard Slice Files
Each store module under `features/<feature>/store/<module-name>/` contains:
- `actions.ts`: Export `<FEATURE>_ACTIONS` object (`as const`) with descriptive type tags: `'[<Feature> <Area>] <Action>'`.
- `reducer.ts`: Pure reducer embedding the shared `AsyncRequestState` fragment (`status`, `error`, `failureNonce`) from `src/app/shared/models/async-request-state.ts`.
- `selectors.ts`: Export `<module>Selectors` object, including derived selectors (`selectIsLoading`, `selectPaging`, `selectFirst`).
- `effects.ts`: Async orchestration, API invocation, error toast forwarding.

### 3. URL-Driven State Synchronization
- State flow is strictly one-way:
  1. User interacts with UI (pagination, search filter).
  2. Component writes to the URL via `router.navigate([], { queryParams, queryParamsHandling: 'merge' })`.
  3. The URL adapter effect (`<feature>-url.effects.ts`) listens to `routerNavigatedAction` from `@ngrx/router-store`.
  4. The effect validates parameters using `PaginationService` parse helpers and dispatches `setQueryFromUrl`.
  5. The reducer applies normalized values and no-ops identical values, preventing unnecessary re-renders.

### 4. Fetch Funnel & Duplicate Prevention
- Data-fetching effects must be duplicate-proof:
  - Reducer tracks `fetchedQuery` (stringified query identity). If an identical query is dispatched while already loaded, it no-ops.
  - Effect uses `withLatestFrom(state)` + `distinctUntilChanged` (state identity) + `switchMap` so in-flight requests are automatically cancelled if superseded.
  - On failure, `applyFailure` clears data and resets `fetchedQuery` so the failed query can be retried.

### 5. Silent Mutation Sync (CRUD Compatibility)
- Avoid full list refetches after successful create or update mutations:
  - Create: Insert new entity into the existing paged slice or update totals smoothly.
  - Update: Patch the updated entity in-place within the current list slice without resetting scroll position.
  - Delete: Remove entity from slice and decrement total records.
