---
name: eliminate-redundancy
description: Reusable workflow for identifying, consolidating, and eliminating redundant code, duplicate UI primitives, and repeated logic across Invoria Web.
---

# Development Workflow: Eliminating Redundant Code

This workflow defines the process for detecting and eliminating code duplication, consolidating repeated patterns into `src/app/shared/`, and preserving the clean boundaries of Invoria Web.

---

## Step 1: Inspect Existing Shared Infrastructure

Before refactoring or extracting code, **inspect existing shared modules** to see what abstractions already exist:

1. **Shared UI Components (`src/app/shared/ui/`)**:
   - `app-chart-card`: Central wrapper for ECharts.
   - `app-kpi-card`: Standard KPI tile with semantic status tones.
   - `app-list-skeleton`: Unified loading skeleton for tables and lists.
   - `app-name-filter-panel`: Debounced text search filter panel.
   - `app-status-steps`: Workflow timeline and progress stepper.
   - `app-settle-modal`: Common settlement modal dialog.
   - `app-autosearch`: Typeahead search input implementing `ControlValueAccessor`.
   - `app-confirm-dialog`: Application-wide confirmation host.
   - `app-page-header`: Standard page title and action header.
2. **Shared Models & Constants (`src/app/shared/models/`)**:
   - `pagination.ts`: `DEFAULT_PAGE_SIZE`, `DEFAULT_PAGE_SIZE_OPTIONS`, `PageState`.
   - `currency.ts`: `DEFAULT_CURRENCY_CODE` (`'EGP'`).
   - `debounce.ts`: `SEARCH_DEBOUNCE_MS`.
   - `async-request-state.ts`: `AsyncRequestState`, `startLoading`, `applyFailure`.
3. **Shared Utilities (`src/app/shared/utils/`)**:
   - `format.ts`: `formatCurrency`, `formatNumber`.
   - `pagination.service.ts`: Runtime paging math and query parsing helpers.
   - `numeric-enum-values.ts`: Enum conversion helpers.
4. **Shared Request Bases (`src/app/shared/requests/`)**:
   - `paging-query.request.ts`: `PagingQueryRequest` (`skip`, `length`).

---

## Step 2: Audit for Redundant Patterns

Identify duplication in feature folders:
- **Duplicate UI Components**: Are features implementing custom loading skeletons, KPI tiles, or chart wrappers instead of using `shared/ui/`?
- **Hardcoded Constants**: Are components re-declaring `[25, 50, 100, 200]`, `'EGP'`, or `300` ms debounce delays?
- **Ad-Hoc Formatters**: Are pages creating inline `new Intl.NumberFormat()` instances instead of calling `formatCurrency()`?
- **Duplicate Request Interfaces**: Are `list-*.request.ts` files declaring their own `skip` and `length` properties instead of extending `PagingQueryRequest`?
- **Aggregating Barrels in `models/`**: Are there `product.ts` or `order.ts` files that merely re-export interfaces from `*.entity.ts` and `*.request.ts`? (These must be removed; consumers should import direct files).
- **Copied Helpers**: Are tab validation or enum-to-label functions copied between features?

---

## Step 3: Consolidate & Migrate

1. **Promote to Shared**: If logic is needed by two or more features, extract it to the appropriate subfolder in `src/app/shared/` (`ui/`, `models/`, `utils/`, or `requests/`).
2. **Update Call Sites**: Replace duplicate implementations across all consuming features with imports from `src/app/shared/`.
3. **Remove Redundant Files**: Safely delete duplicate component folders, helper files, or barrel files once all imports are migrated.
4. **Enforce Boundary Rules**: Verify that no cross-feature coupling was introduced during consolidation. Shared code must live in `shared/`, not in a sibling feature.

---

## Step 4: Verification & Testing

1. **Verify No Broken Imports**:
   ```bash
   npx tsc --noEmit -p tsconfig.app.json
   npx tsc --noEmit -p tsconfig.spec.json
   ```
2. **Execute Full Test Suite**:
   ```bash
   ng test
   ```
3. **Format Touched Files**:
   ```bash
   npx prettier --write <path-to-modified-files>
   ```
