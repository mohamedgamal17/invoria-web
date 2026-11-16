---
name: write-tests
description: Reusable workflow for authoring, improving, and running automated unit tests in Invoria Web using Vitest and Angular TestBed.
---

# Development Workflow: Writing and Improving Tests

This workflow defines the process for creating meaningful, maintainable unit tests in Invoria Web using Vitest.

---

## Step 1: Inspect Existing Test Patterns

Before writing new tests, **inspect reference specifications** to follow established repository patterns:

1. **For API Services**:
   - Inspect `src/app/features/customers/services/customers-api.service.spec.ts` or `orders-api.service.spec.ts`.
2. **For Container / Smart Pages**:
   - Inspect `src/app/features/orders/pages/orders-page/orders-page.component.spec.ts` or `src/app/features/customers/pages/customers-page/customers-page.component.spec.ts`.
3. **For Form Pages**:
   - Inspect `src/app/features/orders/pages/order-form-page/order-form-page.component.spec.ts` (stubbing PrimeNG tabs, template overrides).
4. **Documentation**:
   - Review `docs/guides/testing-conventions.md` and `.agents/rules/testing-quality.md`.

---

## Step 2: Choose the Correct Testing Layer

Map your test scenario to the appropriate layer:

| Scenario | Target File | Testing Pattern |
|---|---|---|
| HTTP endpoint contracts | `*-api.service.spec.ts` | `provideHttpClientTesting()`, `HttpTestingController` |
| Smart page orchestration | `*-page.component.spec.ts` | Mocked API services, `BehaviorSubject` for `ActivatedRoute`, `NO_ERRORS_SCHEMA` |
| Presentational components | `*.component.spec.ts` | Signal I/O (`input()`, `output()`), DOM event verification |
| NgRx store logic | `*.reducer.spec.ts`, `*.selectors.spec.ts` | Pure function assertions without `TestBed` overhead |

---

## Step 3: Implement the Test Specification

### 1. API Service Specs
- Provide `provideHttpClient()` and `provideHttpClientTesting()`.
- Inject `HttpTestingController`.
- Verify the entire HTTP contract: URL, HTTP method, query parameters (e.g. `Skip`, `Length`, `Name`), and request body.
- Always include `httpTestingController.verify()` in `afterEach()`.

### 2. Smart Container Specs
- Mock API services using `vi.fn().mockReturnValue(of(...))`. Never let tests make real network calls.
- Back `ActivatedRoute` with a `BehaviorSubject(convertToParamMap({ page: '1', pageSize: '25' }))` so parameter changes can be pushed interactively.
- Use `NO_ERRORS_SCHEMA` or override the page template (`TestBed.overrideComponent(..., { set: { template: '' } })`) when testing pure container logic to avoid coupling to presentational children.
- Stub `ConfirmDialogService` with `{ confirm: vi.fn().mockReturnValue(of(true)) }`.

### 3. Strict Coding Conventions in Tests
- **Ban Single-Character Identifiers**: Use descriptive names (`fixture`, `component`, `mockCustomerService`, `testRequest`, `error`).
- **Meaningful Assertions**: Test user intent, state mutations, and router navigation calls rather than mere component instantiation (`toBeTruthy`).

---

## Step 4: Execute & Verify Tests

Run the newly created or updated specifications:
```bash
# Focused test execution
npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"

# Verify full test suite health
ng test

# Verify type safety
npx tsc --noEmit -p tsconfig.spec.json

# Format touched spec files
npx prettier --write src/app/features/<feature>/**/*.spec.ts
```
