# API services and models

This document defines how we structure **HTTP API services**, **domain entities**, and **request types** in Invoria Web. Follow it when adding a new backend integration or refactoring a mock service.

For broader architecture context, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Scope

These conventions apply to:

- Feature-scoped `*-api.service.ts` files that call the backend with `HttpClient`.
- TypeScript models under `features/<feature>/models/`.

Shared contracts live in:

- [`src/app/core/models/api-response.ts`](../src/app/core/models/api-response.ts) — `ApiResponse<T>` (`result`, `isSuccess`, `error`).
- [`src/app/core/models/paging.ts`](../src/app/core/models/paging.ts) — `Paging<T>`, `PagingInfo`.
- [`src/app/core/models/entity.ts`](../src/app/core/models/entity.ts) — `Entity` base fields (`id`, `createdAt`, `createdBy`, audit fields).

---

## Entity files (`[entityname].entity.ts`)

- **Location**: `src/app/features/<feature>/models/<entityname>.entity.ts`.
- **Shape**: `export interface <Entity> extends Entity { ... }` for resources that share base metadata with the API.
- **Wire alignment**: Property names must match **serialized JSON** from the API (typically camelCase). The same interface is used for `HttpClient` response typing when the payload matches.
- **Avoid**: Parallel “response DTO” types and manual DTO→domain mapping when the JSON shape already matches the domain model. If the server uses different names, prefer fixing server serialization (camelCase policy) so the client stays direct-typed.

Optional convenience aliases (e.g. `Pick<Entity, 'name'>` for form drafts) may live on the entity file for UI use only; **API service methods should not take these** as their primary parameters—use request types below.

---

## Request files (`[action]-[entity].request.ts`)

- **Location**: `src/app/features/<feature>/models/`.
- **Purpose**: Describe **HTTP inputs only**—request bodies and/or query shapes—not persisted domain entities.
- **Naming**: `[action]-[entity].request.ts` (kebab-case), e.g. `create-customer.request.ts`, `update-customer.request.ts`, `list-customer.request.ts`.
- **Swagger alignment**: Use property names required by the API (e.g. body `{ Name: string }`, query `Skip` / `Length` as in OpenAPI).

---

## Shared request bases

- **Location**: `src/app/shared/requests/` for cross-feature query or body fragments.
- **Example**: [`paging-query.request.ts`](../src/app/shared/requests/paging-query.request.ts) defines `PagingQueryRequest` (`Skip`, `Length`). Feature list requests **extend** it (e.g. `ListCustomerRequest extends PagingQueryRequest`).
- **Constants**: For repeated fixed queries (e.g. autocomplete fetch window), export a named constant next to the list request type (e.g. `customerSearchListRequest`).

Features may import from `shared/` per dependency rules in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## API services (`*-api.service.ts`)

- **Injectable**: `providedIn: 'root'`.
- **HTTP**: `inject(HttpClient)`; ensure [`provideHttpClient()`](../src/app/app.config.ts) is registered in `app.config.ts`.
- **Base URL**: `environment.apiUrl` from [`src/environments/environment.ts`](../src/environments/environment.ts), normalized so paths concatenate without double slashes.
- **Method signatures**:
  - Accept **request interfaces** (`CreateXRequest`, `ListXRequest`, etc.), not ad-hoc `Pick` of entity fields.
  - Return `Observable<ApiResponse<T>>` where `T` is the domain entity, `Paging<Entity>`, or another agreed contract.
- **Helpers**: Small file-local functions for `HttpParams` or URL encoding are fine; avoid large generic “normalize any JSON” mappers.
- **Validation**: Use guards and `throwError(() => new Error(...))` before calling `http` when inputs are invalid.

---

## Components

- Construct request objects at the call site (`{ Name: ... }`, `{ Skip, Length }`) and pass them into the API service.
- Unwrap `ApiResponse` in the UI: check `isSuccess` and `result`, and surface `error` via toasts or messages as appropriate.

---

## Exceptions

If the wire format cannot be aligned with `Entity` / domain types, **prefer changing the API** (serialization policy). Any client-side mapper should be treated as a **rare exception**, documented at the call site or in a short comment.

---

## Reference implementation

Use the **customers** feature as the canonical example:

- Service: [`src/app/features/customers/services/customers-api.service.ts`](../src/app/features/customers/services/customers-api.service.ts)
- Models: [`src/app/features/customers/models/`](../src/app/features/customers/models/) (`customer.entity.ts`, `create-customer.request.ts`, `update-customer.request.ts`, `list-customer.request.ts`)
