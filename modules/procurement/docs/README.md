# @invoria/procurement

Procurement management module for Invoria Web, covering Purchase Orders and Suppliers.

## Structure
- `src/lib/purchase-orders/`: Purchase orders feature (creation, tracking, status lifecycles, reception).
- `src/lib/suppliers/`: Suppliers feature (vendor profiles, purchase order history, supplier reports).

## Routes
- `PROCUREMENT_ROUTES`: Routes for `/procurement` (purchase orders list, details, creation, metrics).
- `SUPPLIERS_ROUTES`: Routes for `/suppliers` (list, details, creation, metrics).

## Integration
Import `PROCUREMENT_ROUTES` and `SUPPLIERS_ROUTES` in the shell router configuration:
```typescript
{
  path: 'procurement',
  loadChildren: () => import('@invoria/procurement').then(m => m.PROCUREMENT_ROUTES)
},
{
  path: 'suppliers',
  loadChildren: () => import('@invoria/procurement').then(m => m.SUPPLIERS_ROUTES)
}
```
