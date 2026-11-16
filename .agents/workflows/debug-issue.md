---
name: debug-issue
description: Reusable workflow for systematically diagnosing, isolating, and fixing bugs, runtime exceptions, and regressions in Invoria Web.
---

# Development Workflow: Debugging and Fixing Issues

This workflow guides the investigation and resolution of bugs, test failures, and unexpected behaviors in Invoria Web.

---

## Step 1: Inspect Problem Context & Existing Implementations

1. **Review Error Details**: Inspect the exact stack trace, compiler error, test output, or user report.
2. **Inspect Related Reference Implementations**:
   - For NgRx store issues (actions, reducers, effects, URL adapters): Compare against `src/app/features/customers/store/`.
   - For Signals issues (`rxResource`, `linkedSignal`, reactivity loops): Compare against `src/app/features/orders/pages/` or `suppliers/`.
   - For UI rendering or PrimeNG issues: Compare against `docs/architecture/design-consistency.md` and `src/app/shared/ui/`.
   - For API failures: Check `src/app/features/<feature>/services/` and inspect wire JSON models in `models/` against `swagger.v1.json`.

---

## Step 2: Reproduce the Issue with a Test

Before writing a fix, create a reproduction to verify the failure:
1. **API Service Issues**: Write or update a spec in `*-api.service.spec.ts` matching the failing HTTP scenario (e.g., handling 400/500 errors, unexpected null fields, or query string encoding).
2. **Component or Page Issues**: Update the component spec in `*.component.spec.ts` to simulate the user action or route parameter state causing the issue.
3. **Run the Targeted Spec**: Confirm that the test reliably reproduces the bug:
   ```bash
   npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
   ```

---

## Step 3: Isolate the Root Cause

Diagnose the issue across application layers:

### Common Root Causes in Invoria Web
- **Reactivity & Signal Loops**: Reading a signal inside an effect or event handler without `untracked()`, causing an unintended dependency loop.
- **URL Synchronization**: Mismatch between 1-based page query parameter (`?page=1`) and 0-based index in store or signals. Use `PaginationService` parse helpers.
- **NgRx Reducer Mutation**: In-place mutation of arrays or state objects instead of returning immutable copies.
- **Duplicate Query Invalidation**: Reducer failing to clear `fetchedQuery` on failure, preventing retry attempts.
- **Swagger / Wire Contract Mismatch**: Backend expecting PascalCase query keys (`Skip`, `Length`, `Name`) while request interface used camelCase. Check `swagger.v1.json`.
- **Form Submission Issues**: Missing `event.preventDefault()` on `(ngSubmit)` or improper `ControlValueAccessor` registration.
- **Single-Character Naming**: Minification or linting collisions caused by lazy variable names.

---

## Step 4: Apply the Minimal Fix

1. Apply the targeted fix in the appropriate layer (service, reducer, effect, or component).
2. Do not introduce wide refactoring or unrelated changes during a bug fix.
3. Ensure the fix follows all repository standards (2-character identifier minimum, external templates, semantic tokens).

---

## Step 5: Verify the Fix & Guard Against Regression

1. **Verify the Spec Passes**:
   ```bash
   npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
   ```
2. **Verify Full Application Type Safety**:
   ```bash
   npx tsc --noEmit -p tsconfig.app.json
   npx tsc --noEmit -p tsconfig.spec.json
   ```
3. **Format Touched Files**:
   ```bash
   npx prettier --write <path-to-fixed-file>
   ```
