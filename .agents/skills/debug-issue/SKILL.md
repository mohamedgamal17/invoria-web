---
name: debug-issue
description: Use when diagnosing, isolating, and fixing bugs, runtime exceptions, or failing tests in Invoria Web — provides reproduction steps, root cause analysis across Signals, NgRx, and API services, and regression prevention.
---

# Skill: Debugging and Fixing Issues

This skill guides the systematic debugging and resolution of defects in Invoria Web.

## Step 1: Inspect Problem Context & Canonical Implementations
- Examine error stack traces, network payloads, and test logs.
- Inspect canonical reference code (`src/app/features/customers/store/` for NgRx, `src/app/features/orders/` for Signals, `src/app/shared/ui/` for UI).
- Check Swagger definition (`swagger.v1.json`) if the issue relates to API contracts or wire serialization.

## Step 2: Reproduce with a Targeted Test
Before applying a fix, write or adjust a unit test to reliably reproduce the failure:
- API service contract test in `*-api.service.spec.ts`.
- Component or container test in `*.component.spec.ts`.
- Run the targeted spec:
  ```bash
  npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
  ```

## Step 3: Common Failure Modes in Invoria Web
- **Reactivity Loops**: Signal read without `untracked()` inside an effect or handler.
- **Paging Sync Mismatch**: 1-based page param in URL vs 0-based pageIndex in state. Use `PaginationService` parse helpers.
- **Reducer State Mutation**: In-place mutation of arrays or nested objects in NgRx reducers.
- **Duplicate Query Invalidation**: Reducer failing to clear `fetchedQuery` on failure, preventing retry attempts.
- **Wire Case Mismatch**: A renamed request field no longer reaches the API (DTOs use camelCase; the wire is camelCase and binds case-insensitively).
- **Single-Character Minification/Collision**: Collision of `e`, `i`, `v` variable names.

## Step 4: Apply Minimal Fix & Guard Against Regression
- Apply the targeted fix in the proper layer without scope creep.
- Verify the reproduction test passes.
- Execute full typecheck and test validation:
  ```bash
  npx tsc --noEmit -p tsconfig.app.json
  npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
  npx prettier --write <touched-file>
  ```
