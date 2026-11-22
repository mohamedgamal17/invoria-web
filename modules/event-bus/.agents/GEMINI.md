# @invoria/event-bus — AI Agent Rules

## Module Purpose
Event bus implementation and contracts for all domain events and cross-module queries.

## Allowed Dependencies
- `@angular/core`
- `rxjs`, `rxjs/operators`

## Strict Restrictions
- NEVER import any feature module or `@invoria/ui` or `@invoria/core`.
- NEVER store persistent state; this bus is purely transient in-memory.
- Any new cross-module interaction contract MUST be added to `events.ts` or `queries.ts`.
- All methods must be strictly typed.
