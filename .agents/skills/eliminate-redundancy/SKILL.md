---
name: eliminate-redundancy
description: Use when identifying and eliminating duplicated code, repeated UI primitives, or redundant constants across Invoria Web — consolidates shared logic into src/app/shared/ following the shared-before-duplicate principle.
---

# Skill: Eliminating Redundant Code

This skill guides the discovery and elimination of code duplication across Invoria Web features.

## Step 1: Inspect Existing Shared Modules
Before extracting or building anything new, inspect `src/app/shared/`:
- **UI Components** (`src/app/shared/ui/`): `app-chart-card`, `app-kpi-card`, `app-list-skeleton`, `app-name-filter-panel`, `app-status-steps`, `app-settle-modal`, `app-autosearch`, `app-confirm-dialog`, `app-page-header`.
- **Constants & Models** (`src/app/shared/models/`): `pagination.ts` (`DEFAULT_PAGE_SIZE`, `DEFAULT_PAGE_SIZE_OPTIONS`), `currency.ts` (`DEFAULT_CURRENCY_CODE`), `debounce.ts` (`SEARCH_DEBOUNCE_MS`), `async-request-state.ts`.
- **Utilities** (`src/app/shared/utils/`): `format.ts` (`formatCurrency`, `formatNumber`), `pagination.service.ts`.
- **Request Bases** (`src/app/shared/requests/`): `paging-query.request.ts`.

## Step 2: Identify Duplicate Patterns
- Duplicate loading skeletons, table layouts, or KPI tiles in feature components.
- Inlined currency formatting (`new Intl.NumberFormat()`) or hardcoded `'EGP'`/`'USD'` strings.
- Re-declared paging options (`[25, 50, 100, 200]`) or debounce constants (`300`).
- Re-declared paging request fields (`skip`, `length`) instead of extending `PagingQueryRequest`.
- Aggregating barrel files in `models/` (e.g. `product.ts` that only re-exports types).
- Separate `create-*`/`update-*` request types with identical fields instead of one shared `<entity>-request.ts`.

## Step 3: Consolidate to `shared/` & Update Consumers
1. Extract duplicate logic to `src/app/shared/` (`ui/`, `models/`, `utils/`, or `requests/`).
2. Update all consuming features to import from the shared path.
3. Remove redundant feature-local files, including duplicate create/update request types when one shared `<entity>-request.ts` covers both.
4. Verify that no circular imports or cross-feature leaks were created.

## Step 4: Verification
```bash
npx tsc --noEmit -p tsconfig.app.json
ng test
npx prettier --write <touched-files>
```
