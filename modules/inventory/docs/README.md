# @invoria/inventory

Inventory domain module managing product batches, stock tracking, expiration dates, and batch mutations.

## Components

- `ProductBatchesPanelComponent`: Embedded panel for displaying and adding batches to a product.
- `BatchFormComponent`: Form for creating or modifying a batch (lot number, expiration date, quantity, cost).
- `BatchListComponent`: Table displaying current batches with status indicators.

## Services & Models

- `BatchesApiService`: API endpoints for listing, creating, and updating batches (`/batches`).
- `Batch`: Entity representing a discrete inventory batch.
