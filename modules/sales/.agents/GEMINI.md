# @invoria/sales — AI Agent Rules

## Module Purpose
Complete sales pipeline: orders, invoicing, returns, and sales/profit reporting.

## Allowed Dependencies
- `@invoria/core`, `@invoria/utils`, `@invoria/ui`, `@invoria/event-bus`
- `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/router`
- `@ngrx/store`, `@ngrx/effects`, `@ngrx/router-store`
- `rxjs`, `primeng/*`, `lucide-angular`, `ngx-echarts`, `echarts`

## Strict Restrictions
- NEVER import directly from `@invoria/customers`, `@invoria/catalog`, or other domain modules.
- Any customer or product lookups must use queries via `ServiceBus` from `@invoria/event-bus`.
- All analytics charts must use `AppChartCardComponent` and tokens from `@invoria/utils`.
