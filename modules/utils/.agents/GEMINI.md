# @invoria/utils — AI Agent Rules

## Module Purpose
Shared pure utility functions, TypeScript models, validation helpers, and pagination service.

## Allowed Dependencies
- `@invoria/core` (for Entity, ApiResponse, error presenter types)
- `@angular/core`, `@angular/common`, `@angular/router`
- `@ngrx/store`, `@ngrx/effects`
- `rxjs`, `echarts`, `ngx-echarts`, `primeng`

## Strict Restrictions
- NEVER import from any feature module (`@invoria/customers`, `@invoria/sales`, etc.).
- NEVER hardcode `'USD'` or `'EGP'` strings — always use `DEFAULT_CURRENCY_CODE` from `./lib/models/currency`.
- Always use `formatCurrency` and `formatNumber` for numeric values.
- All utility functions must remain pure and side-effect free.
