---
name: write-tests
description: Use when authoring or improving unit tests in Invoria Web — covers Vitest testing patterns for HTTP API services, smart container pages with mocked routes, signal-driven components, and orders fixtures.
---

# Skill: Writing and Improving Tests

This skill guides the creation and improvement of unit tests in Invoria Web using Vitest and Angular TestBed.

## Step 1: Inspect Reference Specifications
Before authoring tests, inspect established specs:
- **API Services**: `src/app/features/customers/services/customers-api.service.spec.ts`
- **Smart Pages**: `src/app/features/orders/pages/orders-page/orders-page.component.spec.ts`
- **Form Pages**: `src/app/features/orders/pages/order-form-page/order-form-page.component.spec.ts`
- **Conventions Doc**: `docs/guides/testing-conventions.md`

## Step 2: Test Authoring Patterns

### 1. API Service Unit Tests
- Provide `provideHttpClient()` and `provideHttpClientTesting()`.
- Inject `HttpTestingController`.
- Verify full contract: URL, HTTP method, query parameters (`Skip`, `Length`, `Name`), and request body.
- Verify controller cleanly in `afterEach(() => httpTestingController.verify())`.

### 2. Smart Container Component Tests
- Mock all API services using `vi.fn().mockReturnValue(of(...))`.
- Back `ActivatedRoute` with `new BehaviorSubject(convertToParamMap({ page: '1', pageSize: '25' }))` to push parameter changes.
- Use `NO_ERRORS_SCHEMA` or override the page template (`template: ''`) to isolate container logic from child presentation components.
- Stub `ConfirmDialogService` with `{ confirm: vi.fn().mockReturnValue(of(true)) }`.

### 3. Coding Rules in Tests
- Enforce the ban on single-character identifiers in tests (`fixture`, `component`, `mockCustomerService`, `testRequest`, `error`).
- Assert state transitions, emitted outputs, and navigation calls. Avoid trivial `toBeTruthy()` assertions.

## Step 3: Run and Verify
```bash
npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
npx tsc --noEmit -p tsconfig.spec.json
npx prettier --write <touched-spec-files>
```
