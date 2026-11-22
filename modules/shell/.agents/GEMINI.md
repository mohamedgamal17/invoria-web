# @invoria/shell — Agent Guidelines

## Boundaries
- Belongs to the `@invoria/shell` application shell.
- Orchestrates and dynamically loads feature modules: `@invoria/customers`, `@invoria/sales`, `@invoria/inventory`, `@invoria/catalog`, `@invoria/financial`, `@invoria/procurement`.
- Contains only layout, app config, router configuration, global styles, and environment bindings.
- Strictly adhere to root conventions: 2-character identifiers, semantic design tokens, PrimeNG first, external templates, Signals/NgRx architecture.
