# @invoria/customers

Feature module managing CRM customer profiles, orders history per customer, creation metrics, and customer reports.

## Routes Exposed

The module exposes `CUSTOMERS_ROUTES` under the path `/customers`:
- `/customers` (`CustomersPageComponent`): Paginated customer table with search filtering and sorting.
- `/customers/new` (`CustomerFormPageComponent`): Customer creation form.
- `/customers/:id/edit` (`CustomerFormPageComponent`): Customer edit form.
- `/customers/:id` (`CustomerDetailsPageComponent`): Customer detail profile, contacts, and order history.

## State Management

The module uses NgRx store slices:
- `customersList`: Paginated customer table state with URL synchronization.
- `customerDetails`: Active customer entity view.
- `customerOrders`: Order history tab within customer details.
- `customerMutations`: Optimistic state syncing for create and update actions.

## Event Bus Integration

- Publishes: `CUSTOMERS_EVENTS.customerChanged`
- Handles queries: `CUSTOMERS_QUERIES.search`, `CUSTOMERS_QUERIES.getRefs`
