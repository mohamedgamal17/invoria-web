# @invoria/financial — Agent Guidelines

## Boundaries
- Belongs to the `@invoria/financial` module.
- Contains Receivables and Payables sub-features.
- Dependencies: `@invoria/core`, `@invoria/utils`, `@invoria/ui`, `@invoria/event-bus`.
- No direct coupling to feature modules; cross-module events or references flow through `@invoria/event-bus` or typed contracts.
- Strictly adhere to root conventions: 2-character identifiers, semantic design tokens, PrimeNG first, external templates, Signals/NgRx architecture.
