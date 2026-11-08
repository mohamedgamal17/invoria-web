# Guides — index

Task/feature guides. One entry per doc in this folder, with per-section anchors, so
navigation starts here. The overall docs map is [../README.md](../README.md).

| Doc | Read when | Key sections |
|-----|-----------|--------------|
| [frontend-list-conventions.md](frontend-list-conventions.md) | Building or changing anything with data tables, row actions, paging/URL query params, or batch lists | [Primary row action](frontend-list-conventions.md#primary-row-action-navigate-to-detail) · [Paging and URL state](frontend-list-conventions.md#paging-and-url-state) · [Batch lists](frontend-list-conventions.md#inventory-batch-lists-nested-product-route) |
| [order-workflow.md](order-workflow.md) | Working on order statuses, the progress stepper, action gating, or the order details page | [Statuses](order-workflow.md#statuses) · [Progress stepper](order-workflow.md#progress-stepper-app-order-progress) · [Action gating](order-workflow.md#action-gating) · [Page layout](order-workflow.md#page-layout-order-details-page) |
| [testing-conventions.md](testing-conventions.md) | Writing or changing Vitest specs for API services or pages | [API services](testing-conventions.md#api-services) · [Pages](testing-conventions.md#pages) · [Dropdown-driven signals](testing-conventions.md#dropdownselect-driven-signals) · [Orders fixtures](testing-conventions.md#orders-fixtures) · [Running tests](testing-conventions.md#running-tests) |

## Maintenance

When a doc is added, renamed, or removed in this folder, update this index and the
aggregator [../README.md](../README.md) in the same PR (see the `maintaining-docs` skill).
