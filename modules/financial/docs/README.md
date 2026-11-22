# @invoria/financial

Financial management module for Invoria Web, covering Receivables and Payables.

## Structure
- `src/lib/receivables/`: Receivables feature (invoicing collections, customer debt obligations, settlement records).
- `src/lib/payables/`: Payables feature (supplier bills, purchase debt obligations, settlement records).

## Routes
- `RECEIVABLES_ROUTES`: Routes for `/receivables` (list, details).
- `PAYABLES_ROUTES`: Routes for `/payables` (list, details).

## Integration
Import `RECEIVABLES_ROUTES` and `PAYABLES_ROUTES` in the shell router configuration:
```typescript
{
  path: 'receivables',
  loadChildren: () => import('@invoria/financial').then(m => m.RECEIVABLES_ROUTES)
},
{
  path: 'payables',
  loadChildren: () => import('@invoria/financial').then(m => m.PAYABLES_ROUTES)
}
```
