---
name: implement-feature
description: Use when implementing a new feature or page in Invoria Web — guides architectural design, Signals vs NgRx state selection, typed API services, presentational components with Signal I/O, external templates, route lazy loading, and unit tests.
---

# Skill: Implementing a New Feature

This skill provides step-by-step instructions for implementing new features in Invoria Web according to repository architecture and standards.

## Step 1: Inspect Reference Implementations
Before introducing any new pattern, inspect existing implementations:
- **Complex NgRx CRUD**: `src/app/features/customers/`
- **Simple Signals State**: `src/app/features/orders/` and `src/app/features/suppliers/`
- **Shared UI Primitives**: `src/app/shared/ui/`
- **Architecture Documentation**: `docs/architecture/overview.md` and `docs/architecture/component-design.md`

## Step 2: Choose State Management Pattern
- **Signals Pattern** (`rxResource`, `linkedSignal`, scoped `MessageService`): For isolated list/detail/form pages.
- **NgRx Store Pattern** (`provideState`, `provideEffects`, URL adapter effect, `AsyncRequestState`, mutation sync): For shared cross-slice state or silent list mutation sync.

## Step 3: Define Models (No Barrels)
Create models under `src/app/features/<feature>/models/`:
- `<entity>.entity.ts` extending `Entity` from `core/models/entity.ts`.
- `[action]-[entity].request.ts` (e.g. `list-<entity>.request.ts` extending `PagingQueryRequest`). When create and update accept the same body, use one shared `<entity>-request.ts` (e.g. `customer-request.ts`) instead of separate `create-*`/`update-*` files.
- Import direct file contracts; do not create aggregating barrel files.

## Step 4: Implement Typed API Service
Create `src/app/features/<feature>/services/<feature>-api.service.ts`:
- `@Injectable({ providedIn: 'root' })`, inject `HttpClient`, return `Observable<ApiResponse<T>>`.
- Accept `ListXRequest` and the shared `<Entity>Request` for create/update (or separate `CreateXRequest`/`UpdateXRequest` only when the bodies differ).
- Pre-validate arguments and reject with `throwError` on invalid input.

## Step 5: Implement Presentational Components
In `src/app/features/<feature>/components/<name>/`:
- Use external template `templateUrl: './<name>.component.html'`. Never use inline `template:`.
- Use Signal I/O: `input<T>()`, `output<T>()`. No legacy `@Input()`/`@Output()`.
- **Never inject API services, Router, ActivatedRoute, or MessageService.**
- Use PrimeNG primitives (`p-table`, `p-card`, `p-dialog`, `p-button`, `p-tag`).
- Use semantic Tailwind tokens (`bg-surface`, `text-foreground`, `text-success`, `text-warning`, `text-danger`). Never use raw color palettes.

## Step 6: Implement Smart Container Page
In `src/app/features/<feature>/pages/<name>/`:
- Wire URL write adapter (`page`, `pageSize`, `q` query params) with `router.navigate()`.
- For destructive operations, inject `ConfirmDialogService` (never `<p-confirmDialog>`).

## Step 7: Wire Lazy Routes
In `src/app/features/<feature>/<feature>.routes.ts`:
- Use `loadComponent: () => import(...)`. Attach route-scoped store slices if using NgRx.
- Register into `src/app/app.routes.ts`.

## Step 8: Verification
```bash
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.spec.json
npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
npx prettier --write src/app/features/<feature>/**/*
```
