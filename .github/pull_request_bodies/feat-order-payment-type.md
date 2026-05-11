# Suggested PR title (paste into GitHub/GitLab)

**feat(orders): payment type & status, tabbed details, multi-step form + tests**

---

## Summary

Introduces **order payment** concepts (**PaymentType**: Immediate / Debt, **PaymentStatus**: Unpaid / Partial / Paid, **OrderPaymentMethod** for recorded payments), extends **`OrdersApiService`** with **`POST /orders/{id}/payments`**, refactors **order details** into **Overview / History / Payment** tabs, and **decomposes the order form** into multiple steps while including **order type** in the flow. The **order list** surfaces payment-related fields. Adds and expands **Vitest** coverage for the API service, form page, details page, list, header, and orders page.

Frontend Orders testing is aligned with Invoria’s Ordering test layering via `.cursor/rules/orders-testing-architecture.mdc`, which references the canonical backend description in **`Architecture.md`** (Ordering module and `Invoria.Ordering.Application.Tests` layout).

## Changes vs `master`

### Features

- **Models**: Payment enums aligned with Swagger contracts (`InvoriaOrderingContractsOrdersOrderPaymentType`, `OrderPaymentStatus`, `OrderPaymentMethod`); `RecordOrderPaymentRequest` for payment recording; order entity / create-order payload / UI mapper updates for payment and order type where applicable.
- **`OrdersApiService`**: `recordOrderPayment(id, body)` → `POST {apiUrl}orders/{id}/payments` with client-side validation (`PaidAmount` positive; `PaymentMethod` enum member).
- **Order list**: Display payment type/status (and related UI updates).
- **Order form**: Step-based UX; order type on the form page; substantial template updates on `OrderFormComponent`.
- **Order details**: Tab components for overview, history, and payment; payment tab supports recording payments against the API.

### Refactors

- Order details page split so overview and history live in dedicated tab components; page orchestrates tabs.
- Order form structure reorganized for multi-step flow.

### Tests

- **`orders-api.service.spec.ts`**: HTTP tests including `recordOrderPayment`, validation errors, and existing order endpoints as touched.
- **`order-form-page.component.spec.ts`**, **`order-details-page.component.spec.ts`**: Page-level specs (including stubs for PrimeNG / jsdom where used).
- **`order-header.component.spec.ts`**, **`order-list.component.spec.ts`**, **`orders-page.component.spec.ts`**: Assertions updated for new behavior.

### Docs / tooling

- **`.cursor/rules/orders-testing-architecture.mdc`**: Maps backend `Ordering.Application.Tests` folders (Domain, Integration, Infrastructure/Services, Assertions) to Angular Orders specs; canonical backend reference: Invoria **`Architecture.md`**.

## Stats

- **Branch:** `feat/order-payment-type` → **`master`**
- Approx. **29 files**, **+2150 / −400** lines (`git diff master...HEAD --stat`).

## How to test

```bash
npx ng test --watch=false --include="src/app/features/orders/**/*.spec.ts"
```

**Manual:** Create or edit orders; confirm list columns; walk through form steps and order type; open order details and verify **Overview**, **History**, and **Payment** tabs; on **Payment**, record a payment and confirm **`POST /orders/{id}/payments`** succeeds against your API environment.

## Risk / notes

- Large template changes on order form and details may affect accessibility and responsive layout; smoke-test all tabs and steps.
- Ensure the backend exposes **`POST /orders/{id}/payments`** and order payloads include payment fields expected by the UI.

## Related

- Backend Ordering context: Invoria **`Architecture.md`** (Ordering module, contracts, application tests layout).
