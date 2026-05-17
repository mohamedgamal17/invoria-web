# Pull request: UI/UX refactor and order payment (branch vs `master`)

This branch refactors list and detail experiences across several features, introduces order payment type and status end-to-end, and splits heavy detail views into tabs. It is intended to be pasted into the GitHub pull request description as-is (or trimmed), with optional edits for your team’s checklist links.

**Base branch:** `master`  
**Compare branch:** `refactor/enhance-ui-according-to-ui/ux-princibles`  
**Approximate scope:** 83 files changed, about +4,295 / −1,222 lines (`git diff --stat master...HEAD`).

Backend architecture vocabulary for reviewers is documented separately:  
`c:\Users\Mohamed\source\repos\Invoria\ai\Architecture.md` (Invoria solution modules and layering). This PR does not change that repository; the sections below map **Angular** changes to the same bounded-context names for easier cross-repo review.

---

## Architecture alignment (frontend ↔ `Architecture.md` vocabulary)

| `Architecture.md` style module | Angular area |
|--------------------------------|--------------|
| **Ordering** | `src/app/features/orders/` — multi-step create/edit form, order list (payment columns), order details tabs, API client and models/mappers for payment recording. |
| **Procurement** | `src/app/features/procurement/` — purchase order details split into overview, lines, and history tab components. |
| **Catalog** (product-centric UI) | `src/app/features/products/` — products shell routes, list + filter panel, product details as tabs (including batches surfaced on the details page). |
| **CustomerManagement** (customer-centric UI) | `src/app/features/customers/` — customers page composition, header, filter panel, list, and customer details with reactive tab handling. |
| **Suppliers** (procurement-adjacent in the app) | `src/app/features/suppliers/` — suppliers page composition, header, filter panel, list, and supplier details with reactive tab handling. |
| **Shared presentation** | `src/app/layout/dashboard-sidebar/`, `src/app/app.ts`, and global styling hooks as touched in this branch. |

---

## Functional summary by area

### Orders (`features/orders`)

- **Create/edit flow:** Order form is reorganized into multiple steps, including payment-related fields and order type on the form page.
- **List:** Order list shows payment type and status where applicable; layout and bindings updated alongside model and API support.
- **Details:** Order details are split into tabbed child components: **Overview**, **Line items**, **Payment** (record/view payment flows), and **History**. The page coordinates loading, actions, and shared toasts/confirmations; tab order in code is index 0 Overview, 1 Line items, 2 Payment, 3 History.
- **Domain/API:** New or extended request types and enums for payment (debt/immediate style semantics), mapper and entity fields, and `OrdersApiService` methods for recording payment aligned with the UI.
- **Tests:** Expanded coverage for orders API service, order details page, order form page, order list/header, and orders page integration-style specs where present.

### Products (`features/products`)

- **List UX:** Filter behavior moved into a dedicated `ProductsFilterPanelComponent`; product list simplified to focus on listing concerns consistent with team list conventions.
- **Details UX:** Product details use tabbed layout; batch information is shown via `ProductBatchesPanelComponent` from the inventory feature on the appropriate tab, with query-param-driven tab and pagination behavior where implemented.
- **Routing:** Routes align under `/products` with a shell parent. Legacy URLs `/products/:id/batches` redirect to `/products/:id` with `tab=batches` and optional `page` / `pageSize` query params preserved when present. The standalone product batches **page** component files are removed in favor of this details-tab experience.

### Purchase orders (`features/procurement`)

- **Details page:** Large template decomposed into **overview**, **lines**, and **history** tab components to reduce cognitive load and match the tabbed pattern used elsewhere.

### Customers (`features/customers`)

- **List page:** Decomposed into header, optional filter panel, and list; customer name filtering lives in the filter panel component.
- **Details page:** Reactive tab handling and error management improvements; layout tightened for consistency; new or extended component tests.

### Suppliers (`features/suppliers`)

- **List page:** Same structural pattern as customers: header, filter panel, list decomposition; tests updated.
- **Details page:** Reactive tabs, error handling, and layout spacing/alignment updates; expanded specs.

### Routing, navigation, and shell

- **Sidebar:** Active navigation state respects child routes and query parameters so deep links and tabs do not lose the active menu highlight.
- **App shell:** `app.css` wired through the root app component as in the branch commits.

### Tooling and documentation

- **Cursor rules:** `orders-testing-architecture.mdc` documents how Angular orders tests align with backend `Ordering.Application.Tests` layout; `products-list-layout.mdc` captures product list layout guidance.
- **Docs:** `docs/frontend-list-conventions.md` adjusted in line with the list refactors.

---

## Notable behavior and migration notes

- **Bookmarks and deep links:** Old product batches paths `/products/:id/batches` should continue to work via redirect to `/products/:id?tab=batches` (and pagination query params when supplied).
- **Order details:** Consumers of a single long order details view should switch mental model to tabs; public URLs depend on your router config for orders (unchanged pattern unless your deployment documented otherwise).
- **Order form:** Multi-step flow may change scroll length and validation timing compared to a single long form; QA should walk create and edit paths.
- **Sidebar:** Any custom `routerLinkActive` assumptions in forks should be checked against child-route and query-param aware matching introduced here.

---

## Testing

**Orders** (canonical pattern from `.cursor/rules/orders-testing-architecture.mdc`):

```bash
npx ng test --watch=false --include="src/app/features/orders/**/*.spec.ts"
```

**Other features touched** (widen `--include` as needed):

```bash
npx ng test --watch=false --include="src/app/features/products/**/*.spec.ts"
npx ng test --watch=false --include="src/app/features/customers/**/*.spec.ts"
npx ng test --watch=false --include="src/app/features/suppliers/**/*.spec.ts"
npx ng test --watch=false --include="src/app/features/procurement/**/*.spec.ts"
npx ng test --watch=false --include="src/app/layout/dashboard-sidebar/**/*.spec.ts"
```

Representative spec files expanded or added in this branch include:

- `src/app/features/orders/services/orders-api.service.spec.ts`
- `src/app/features/orders/pages/order-details-page/order-details-page.component.spec.ts`
- `src/app/features/orders/pages/order-form-page/order-form-page.component.spec.ts`
- `src/app/features/customers/pages/customers-page/customers-page.component.spec.ts`
- `src/app/features/customers/pages/customer-details-page/customer-details-page.component.spec.ts`
- `src/app/features/suppliers/pages/suppliers-page/suppliers-page.component.spec.ts`
- `src/app/features/suppliers/pages/supplier-details-page/supplier-details-page.component.spec.ts`
- `src/app/features/procurement/pages/purchase-order-details-page/purchase-order-details-page.component.spec.ts`
- `src/app/layout/dashboard-sidebar/dashboard-sidebar.component.spec.ts`
- `src/app/features/products/components/products-filter-panel/products-filter-panel.component.spec.ts`

---

## Commit index (`git log master..HEAD --oneline`)

Recent-first listing for audit trail (includes merge commits from integrated PRs):

```
ee9a8f4 feat(orders): add line items tab and simplify order overview
6c93d60 fix(products): align routes with /products and fix batches redirect
3398ab2 fix(sidebar): keep nav active on child routes and query params
2a5e7be refactor(supplier): Update layout of SupplierDetailsPageComponent for improved spacing and alignment
fe7b89a refactor(customer): Enhance layout of CustomerDetailsPageComponent for improved UI consistency
714a0f6 docs(ai): Update the convention rules of ai
acb6d80 refactor(supplier): Enhance SupplierDetailsPageComponent with reactive tab handling and error management
33ccb9f refactor(customer): Enhance CustomerDetailsPageComponent with reactive tab handling and error management
9a2b792 refactor(customer): Decompose the customers-page component into multiple separte components
b414c42 refactor(customer): Remove the customer filter from customer list component
58a7696 refactor(customer): Add customer filter panel component
f52a514 refactor(customer): Decompose the customer header into seprate component
9385f81 refactor(supplier): Decompose the suppliers page into multiple components
7dfa6ad refactor(supplier): Decompose the filter by name from the supplier list component
a1e5e9e refactor(supplier): Decompose the supplier filter into seprate component
a357830 refactor(supplier): Add supplier-header component
28d2c5b Merge pull request #5 from mohamedgamal17/master
3ccde06 Merge pull request #6 from mohamedgamal17/refactor/enhance-ui-according-to-ui/ux-princibles
be6b8cb refactor(purchase-order): Decompose the purchase order details page into multiple tapped components to ease the view from user prespective
2de5173 refactor(purchase-order): Decompose the order details info into overview tapped component
edef249 refactor(purhcase-order): Decompose the purchase order lines into tapped component
aec8b25 refactor(purchase): Decompose the order state history tab from the PurchaseOrderDetails page
f51d4fc refactor(app): Add the app.css into App component
94b1bac refactor(product): Add ProductsFilterPanelComponent into the Products Page
87e61f7 refactor(product): Decompose the product-details page component into multiple tabs to follow the ui/ux best practices and oraganize the info related to the product
e08bb63 refactor(products): Remove the product batches page
c872712 refactor(product): Add new ProductFilter panel
a480a27 refactor(products): Remove the filter functionality
38c56fb Merge pull request #3 from mohamedgamal17/feat/order-payment-type
4847bf0 docs(ai): Remove the github changes bodies
eb00726 docs(pr): add feat/order-payment-type PR summary vs master
2012a59 docs(ai): Update the ai rules to follow the test pattern that has defined
a058612 test(order): Add order-header  assertion for the new updates added
d4b6215 test(order): Add order form page component unit test cases
99f19e0 test(order): Add order api service test cases
3914133 test(order-details): Add order details component unit test cases
a8c9ae8 feat(order): Include the order type in order-form-page-component
a41b43b feat(ordering): Add order payment into the order form - Decompose the order form into multiple steps instead
ee71bef refactor(ordering): Add order details page decompose defination into the related order data
b287a8e refactor(ordering): Decompose the order details history and overview into two seprate tabs
77371df feat(order): Add the order payment related tab component
e462ebc test(order): Add test case related to order payment (type/status)
febb585 feat(order): Include the order payment type and status in order list component
f2743c6 feat(order): Add new order payment reocrd into the order-api-service
9f32644 feat(order): Add order payment(debt/Imediate) entity types
```

---

## Suggested PR title (GitHub)

**refactor(ui): tabbed details, list decomposition, order payment, and `/products` routing**

Adjust prefix (`feat`, `refactor`, `chore`) to match your versioning policy.
