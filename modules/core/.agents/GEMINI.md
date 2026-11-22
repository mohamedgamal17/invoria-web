# @invoria/core — AI Agent Rules

## Module Purpose
Foundational HTTP interceptors, error normalization, base entity and paging models, and global services.

## Allowed Dependencies
- `@angular/core`, `@angular/common`, `@angular/router`
- `rxjs`, `rxjs/operators`

## Strict Restrictions
- NEVER import from other `@invoria/*` packages (core is layer 1).
- NEVER import from `src/app/` (legacy directory).
- NEVER hardcode backend host URLs; always use `API_BASE_URL`.
- Keep the public API surface clean and strictly exported via `src/index.ts`.
- All tests must use Vitest.
