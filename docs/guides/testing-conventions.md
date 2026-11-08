# Testing conventions

This document defines the testing patterns for Invoria Web. The test runner is **Vitest** (via `ng test`), not Karma/Jasmine.

## API services

- Use `provideHttpClientTesting` + `HttpTestingController`.
- Verify full request contracts: **URL, HTTP method, query params, request body**.

## Pages

- Mock API services (never hit real HTTP from page specs).
- Provide `ActivatedRoute` via a `BehaviorSubject(convertToParamMap(...))`; mock `Router` where navigation is asserted.
- Use **`NO_ERRORS_SCHEMA`** or a template override when a spec only exercises container logic — avoids coupling to child component internals.

## Dropdown/select-driven signals

- When testing `rxResource`/`linkedSignal` pages, drive the URL query params through the mocked `ActivatedRoute` subject; the fetch chain recomputes automatically.

## Orders fixtures

- Specs under `src/app/features/orders/` must use the `orders-testing` skill for fixtures and helpers.

## Running tests

- `ng test` — full suite (Vitest).
- `npx ng test --watch=false --include="src/app/features/<name>/**/*.spec.ts"` — focused feature tests.
