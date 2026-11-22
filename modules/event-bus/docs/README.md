# @invoria/event-bus

In-memory event bus and communication contracts for decoupled cross-module interactions in Invoria Web.

## Overview

The `@invoria/event-bus` library allows feature modules to communicate without direct dependencies. It supports:
1. **Pub/Sub Domain Events**: Broadcast state changes (e.g., `catalog.product.changed`, `customers.customer.changed`).
2. **Request/Response Queries**: Synchronously or asynchronously query other domains (e.g. look up customer or product details).
3. **Reference Types**: Lean contracts (`CustomerRef`, `ProductRef`, `SupplierRef`, `PurchaseOrderRef`, `OrderRef`) representing foreign entities.

## ServiceBus API

The `ServiceBus` is a singleton provided in root.

```typescript
import { inject } from '@angular/core';
import { ServiceBus, CUSTOMERS_EVENTS, CustomerChangedEvent } from '@invoria/event-bus';

// Publishing an event:
const bus = inject(ServiceBus);
bus.publish<CustomerChangedEvent>(CUSTOMERS_EVENTS.customerChanged, {
  customerId: '123',
  change: 'created'
});

// Subscribing to an event:
bus.on<CustomerChangedEvent>(CUSTOMERS_EVENTS.customerChanged).subscribe((event) => {
  console.log('Customer changed:', event.customerId);
});

// Handling a query (Module owner):
bus.handle<GetCustomerRefsQuery, CustomerRef[]>(CUSTOMERS_QUERIES.getRefs, (query) => {
  return customerApiService.getRefs(query.ids);
});

// Requesting data from another module:
bus.request<GetCustomerRefsQuery, CustomerRef[]>(CUSTOMERS_QUERIES.getRefs, { ids: ['123'] })
  .subscribe((refs) => { ... });
```

## Docs Index
- [Domain Events](./events.md): Specification of all domain event topics and payloads.
- [Queries](./queries.md): Specification of cross-module request/response queries.
