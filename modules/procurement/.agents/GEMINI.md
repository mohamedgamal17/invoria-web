# @invoria/procurement — Agent Guidelines

## Boundaries
- Belongs to the `@invoria/procurement` module.
- Contains Purchase Orders and Suppliers sub-features.
- Dependencies: `@invoria/core`, `@invoria/utils`, `@invoria/ui`, `@invoria/event-bus`, `@invoria/catalog`.
- Cross-module dependencies to `@invoria/catalog` are restricted to product lookups in purchase order forms.
- Strictly adhere to root conventions: 2-character identifiers, semantic design tokens, PrimeNG first, external templates, Signals/NgRx architecture.
