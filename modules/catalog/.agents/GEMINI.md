# @invoria/catalog — AI Agent Rules

## Module Purpose
Product catalog management, product details view, and catalog state.

## Allowed Dependencies
- `@invoria/core`, `@invoria/utils`, `@invoria/ui`, `@invoria/event-bus`
- `@invoria/inventory` (for batches panel)
- `@invoria/sales` (for embedded orders panel in product details)
- `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/router`
- `@ngrx/store`, `@ngrx/effects`, `@ngrx/router-store`
- `rxjs`, `primeng/*`, `lucide-angular`

## Strict Restrictions
- Cross-domain communication must use `@invoria/event-bus`.
