# @invoria/customers — AI Agent Rules

## Module Purpose
Customer relationship management: directory, creation, edit, details, and reports.

## Allowed Dependencies
- `@invoria/core`, `@invoria/utils`, `@invoria/ui`, `@invoria/event-bus`
- `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/router`
- `@ngrx/store`, `@ngrx/effects`, `@ngrx/router-store`
- `rxjs`, `primeng/*`, `lucide-angular`

## Strict Restrictions
- NEVER import from `@invoria/sales`, `@invoria/catalog`, `@invoria/procurement`, or `@invoria/financial`.
- Communication with orders or other modules must go through `@invoria/event-bus`.
- Components in `components/` are presentational only; container pages live in `pages/`.
