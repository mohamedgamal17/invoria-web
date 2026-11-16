---
name: orders-testing
description: Use when writing or changing spec files under src/app/features/orders/ — maps the backend Ordering test layers (Domain/Integration/Infrastructure/Assertions) onto Orders Angular specs, where each test type belongs, spec-stubbing patterns for PrimeNG tabs, and the focused test command.
compatibility: Invoria Web (Angular 21, Vitest)
---

# Orders feature testing (backend-layer alignment)

Canonical backend reference (Ordering bounded context and `Invoria.Ordering.Application.Tests`
layout): `Invoria/ai/Architecture.md` in the Invoria solution repository.

That document describes **.NET** test folders (`Domain/Orders`, `Integration`,
`Infrastructure/Services`, `Assertions`). In **invoria-web**, map them as follows:

| Backend (Ordering.Application.Tests) | Angular (`src/app/features/orders/`) |
|--------------------------------------|----------------------------------------|
| `Domain/Orders/` | `models/*.spec.ts` for domain helpers **where present** (e.g. `order-actions.spec.ts`); no dedicated mapper specs |
| `Integration/` | **Pages** — `TestBed` + mocked `OrdersApiService` / `Router` / allowed cross-feature API services; Vitest + patterns from `orders-page.component.spec.ts` |
| `Infrastructure/Services/` | `orders-api.service.spec.ts` — `HttpClientTestingModule` + `HttpTestingController` |
| `Assertions/` | Optional shared helpers under `features/orders/testing/` only when duplication appears |

Mapper and facade wiring (`order-ui.mapper`, `OrderActionFacade`) are exercised through
page/component flows rather than separate unit spec files.

## Checklist when adding Orders behavior

- **HTTP client** → extend `src/app/features/orders/services/orders-api.service.spec.ts`
  (URLs, methods, query params, validation errors).
- **Smart pages** → details/form pages use focused specs; stub **PrimeNG Tabs** environment
  (`ResizeObserver` in jsdom) and avoid deep-shallow **OrderForm** template issues by
  overriding the **page** template in tests when only container logic is under test
  (`order-form-page.component.spec.ts`).

Run Orders-related tests:
`npx ng test --watch=false --include="src/app/features/orders/**/*.spec.ts"`
(adjust `--include` as needed).
