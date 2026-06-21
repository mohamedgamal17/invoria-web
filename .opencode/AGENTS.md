# Invoria Web — AGENTS.md

Canonical docs (override everything else):
| Doc | Topic |
|-----|-------|
| `ai/ARCHITECTURE.md` | Structure, dependencies, routing, design system |
| `ai/component-design-rules.md` | Smart/dumb, `rxResource`, `linkedSignal`, URL state |
| `ai/api-services-and-models.md` | Entities, requests, API services |
| `ai/design-consistency-rules.md` | PrimeNG/Tailwind rules, PR checklist |

See also `.cursor/rules/invoria-web-conventions.mdc` for Cursor-specific equivalents.
**When a canonical `ai/` doc changes, update this file in the same PR.**

## Stack
Angular 21 standalone, PrimeNG 21 + AuraInvoria preset, Tailwind v4 (CSS-first `@theme`), RxJS 7.8, Vitest, Prettier (100 cols, single quotes), TypeScript strict.

## Commands
- `ng serve` — dev server (localhost:4200)
- `npm run build` — runs `scripts/generate-production-env.mjs` (requires `API_URL` env var) → `ng build --configuration production`
- `ng test` — Vitest (not Karma/Jasmine)
- `npx ng test --watch=false --include="src/app/features/<name>/**/*.spec.ts"` — focused feature tests
- `npx prettier --check src/app/` — check formatting

## Architecture constraints (most commonly violated)
- **Standalone only** — no NgModules; do NOT set `standalone: true` explicitly (default in v21+)
- **Smart** (`pages/`): `inject()` services/router/route, `rxResource` + `linkedSignal` for lists, scoped `MessageService`
- **Presentational** (`components/`): `input()`/`output()`/`model()` only — never inject API services or router
- **Cross-feature imports ARE FORBIDDEN** except the documented exceptions in `ai/ARCHITECTURE.md` §7 (orders↔customers/products, products↔inventory, suppliers↔procurement). Shared code → `shared/` or `core/`
- **No barrel files in `models/`** — import `*.entity.ts` and `*.request.ts` directly

## List page pattern (copy from orders/suppliers pages)
- Query params → `toSignal(queryParamMap, { initialValue })` → `computed(listRequest)` → `rxResource` → `linkedSignal` for display
- Page size: default 25, options `[25, 50, 100, 200]`; 1-based `?page=`, validated + fallback to 1
- Filters debounced ~700ms on the **page**, emit `filtersChange`/`clearFilters`
- Error: `presentApiError()` from `core/http`; toast via scoped `MessageService`
- Mutations: navigate with `queryParamsHandling: 'merge'`; `window.scrollTo({ top: 0, behavior: 'smooth' })` on manual page change

## UI & styling rules
- **PrimeNG first** for interactive primitives (`p-table`, `p-dialog`, `p-button`, `p-paginator`, `p-toast`, `p-tag`)
- **Semantic Tailwind classes only** — `bg-surface`, `text-foreground`, `border-border`, `text-danger`, etc. No hardcoded hex/rgb
- Avoid component-scoped CSS unless PrimeNG+Tailwind can't express it (document why)
- Dark mode: `.dark` on `html`/`body`; PrimeNG `darkModeSelector: '.dark'`

## API services
- `providedIn: 'root'`, `inject(HttpClient)`, `environment.apiUrl` (trailing slash normalized)
- Return `Observable<ApiResponse<T>>`; guard invalid inputs with `throwError`
- Request types: PascalCase per Swagger (`Skip`, `Length`, `CustomerId`, etc.)
- Use `httpParamsFromRequest()` from `shared/requests` for query param building

## Testing
- **API services**: `provideHttpClientTesting` + `HttpTestingController`; verify URLs, methods, params, body
- **Pages**: mock API services, `ActivatedRoute` via `BehaviorSubject(convertToParamMap(...))`, mock `Router`
- Use `NO_ERRORS_SCHEMA` or template override when only testing container logic (avoids child component issues)
- Order-specific: `npx ng test --watch=false --include="src/app/features/orders/**/*.spec.ts"`

## Code style
- `inject()` only (no constructor DI); `private readonly` for injected deps
- Import order: Angular → RxJS → PrimeNG → app (`core` → `shared` → feature)
- `class` not `ngClass`; signals `update`/`set` not `mutate`
- Request object literals use `TypeScript satisfies` keyword for type checking
- `ChangeDetectionStrategy.OnPush` where used (not always required with signals)
