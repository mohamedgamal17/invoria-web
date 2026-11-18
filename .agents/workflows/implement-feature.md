---
name: implement-feature
description: Reusable workflow for implementing a new feature in Invoria Web following existing architectural patterns, state guidelines, and UI standards.
---

# Development Workflow: Implementing a New Feature

This workflow guides the implementation of a new feature in Invoria Web, enforcing architectural boundaries, code conventions, and verification steps.

---

## Step 1: Inspect Existing Reference Implementations

Before writing any code, **inspect canonical implementations** in the repository to match established patterns:

1. **For State Management & Architecture**:
   - Inspect `src/app/features/customers/` for complex NgRx-based CRUD features (store modules, URL adapter, mutation sync).
   - Inspect `src/app/features/orders/` and `src/app/features/suppliers/` for simple Signal-based features (`rxResource`, `linkedSignal`).
2. **For API Services & Model Contracts**:
   - Inspect `src/app/features/customers/models/` and `src/app/features/customers/services/customers-api.service.ts`.
3. **For Shared UI & Form Controls**:
   - Inspect `src/app/shared/ui/` for available reusable components (`app-chart-card`, `app-kpi-card`, `app-list-skeleton`, `app-name-filter-panel`, `app-status-steps`, `app-autosearch`, `app-confirm-dialog`).
4. **For Documentation**:
   - Review `docs/architecture/overview.md` and `docs/architecture/component-design.md`.

---

## Step 2: Architecture & State Strategy Decision

Determine the state strategy based on feature complexity:
- **Choose Signals Pattern** if the feature is a self-contained list, detail, or form page without cross-page state sharing or silent mutation sync.
- **Choose NgRx Feature Store Pattern** if the feature involves multi-slice shared state, cached detail views, silent mutation sync into paged lists without refetches, or complex query cancellation.

---

## Step 3: Define Domain Models & Request Contracts

Create models under `src/app/features/<feature>/models/`:
1. **Entity**: `<entity>.entity.ts` extending `Entity` from `src/app/core/models/entity.ts`. Wire properties must match backend JSON serialized names.
2. **Requests**: `[action]-[entity].request.ts` (e.g., `list-<entity>.request.ts`, `create-<entity>.request.ts`). When create and update accept the same body, use one shared `<entity>-request.ts` (e.g., `customer-request.ts`) instead of separate create/update files.
   - List requests must extend `PagingQueryRequest` from `src/app/shared/requests/paging-query.request.ts`.
3. **Strict Constraint**: Do not introduce barrel files (e.g. `product.ts`) that re-export types. Consumers must import `*.entity.ts` and `*.request.ts` directly.

---

## Step 4: Implement Typed API Service

Create `src/app/features/<feature>/services/<feature>-api.service.ts`:
- Mark with `@Injectable({ providedIn: 'root' })`.
- Inject `HttpClient` and derive base URL from `environment.apiUrl`.
- Accept strongly-typed request interfaces (`ListXRequest`, shared `<Entity>Request` for create/update; separate `CreateXRequest`/`UpdateXRequest` only when the bodies differ).
- Return `Observable<ApiResponse<T>>`.
- Validate required parameters before invoking HTTP, using `throwError` on invalid inputs.

---

## Step 5: Implement Presentational Components

Create reusable visual components in `src/app/features/<feature>/components/<component-name>/`:
- **External Template**: Always use `templateUrl: './<component-name>.component.html'`. Never use inline `template:`.
- **Signal-Driven I/O**: Use `input<T>()`, `input.required<T>()`, and `output<T>()`.
- **Injection Ban**: Never inject API services, `Router`, `ActivatedRoute`, or `MessageService`.
- **PrimeNG First**: Use `p-table`, `p-card`, `p-dialog`, `p-tag`, `p-button`.
- **Semantic Tokens**: Use semantic Tailwind classes (`bg-surface`, `text-foreground`, `border-border`, `text-success`, `text-warning`, `text-danger`). Never use raw color palette hues.
- **Reuse Shared Primitives**: Use `app-list-skeleton` for loading states, `app-name-filter-panel` for text filters, and `shared/utils/format.ts` for currency formatting.

---

## Step 6: Implement Smart Container Page

Create `src/app/features/<feature>/pages/<page-name>/<page-name>.component.ts`:
- Act as the container orchestrating state, modals, and URL query parameter writes (`page`, `pageSize`, `q`).
- For Signals: bind route query parameters with `toSignal()`, create `rxResource()`, and handle failures via `presentApiError()`.
- For NgRx: select state with `this.store.selectSignal()`, dispatch actions, and delegate URL changes via `router.navigate()`.
- For destructive actions: inject `ConfirmDialogService` to prompt the user before dispatching mutations.

---

## Step 7: Wire Routes with Lazy Loading

Register feature routes in `src/app/features/<feature>/<feature>.routes.ts`:
- Lazy-load component targets using `loadComponent: () => import('./pages/...').then(m => m.XComponent)`.
- If using NgRx, attach route-scoped store slices using `providers: [provideState(FEATURE_KEY, reducer), provideEffects(...)]`.
- Register the feature route into `src/app/app.routes.ts`.

---

## Step 8: Write Automated Tests & Verify

1. Write unit tests for the API service: `src/app/features/<feature>/services/<feature>-api.service.spec.ts` using `HttpTestingController`.
2. Write unit tests for the smart page: mock dependencies, provide `ActivatedRoute` via `BehaviorSubject`, and test state transitions.
3. Verify compliance with repository standards:
   ```bash
   # 1. Typecheck
   npx tsc --noEmit -p tsconfig.app.json
   npx tsc --noEmit -p tsconfig.spec.json

   # 2. Run feature tests
   npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"

   # 3. Format touched files only
   npx prettier --write src/app/features/<feature>/**/*
   ```
