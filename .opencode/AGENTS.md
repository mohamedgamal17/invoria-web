# Invoria Web — AGENTS.md

This file is an **index**, not the source of truth. Every rule lives in a canonical doc
(reached via the navigation chain below) or skill — when adding/refactoring anything, follow
the linked doc/skill for that topic. When a doc or skill changes, update it in the **same PR**
(see skill `maintaining-docs`).

## Docs navigation (single entry point)

Navigate docs through one chain: [docs/README.md](../docs/README.md) (aggregator) →
per-folder indexes ([architecture](../docs/architecture/README.md),
[guides](../docs/guides/README.md)) → the canonical doc. Do not index individual
docs here.

## Skills index

| Skill | Use when |
|-------|----------|
| `ngrx-page-state` | Adding/tuning pagination or page state in NgRx slices |
| `ngrx-details-store` | Building/reviewing a details page (entity load, tabs, child paged panels) |
| `ngrx-list-mutations` | Syncing create/update mutations into a paged-list slice |
| `ts-naming-conventions` | Writing/editing any TypeScript file (identifier naming) |
| `charts` | Adding or modifying any chart |
| `report-page-scaffold` | Creating/modifying `reports/<feat>` pages |
| `orders-testing` | Writing/changing specs under `features/orders/` |
| `products-list-layout` | Working on the products list page/filter panel |
| `maintaining-docs` | Introducing cross-cutting patterns or touching docs/skills |

## Stack

Angular 21 standalone, PrimeNG 21 + AuraInvoria preset, Tailwind v4 (CSS-first `@theme`), RxJS 7.8, NgRx 22 (`store`/`effects`/`router-store`), echarts 6 + ngx-echarts, Vitest, Prettier (100 cols, single quotes), TypeScript strict.

## Commands

- `ng serve` — dev server (localhost:4200)
- `npm run build` — runs `scripts/generate-production-env.mjs` (requires `API_URL` env var) → `ng build --configuration production`
- `ng test` — Vitest (not Karma/Jasmine); `npx ng test --watch=false --include "<glob>"` for a subset
- `npx tsc --noEmit -p tsconfig.app.json` / `-p tsconfig.spec.json` — typecheck
- `npx prettier --write <file>` — format **only touched files**; never run it tree-wide (the repo is intentionally not globally formatted)

## Hard constraints (details in the linked doc)

- **State pattern is a developer decision by complexity**: simple page → signals pattern (component-design.md §9); complex state → NgRx, CRUD-compatible with list mutation sync (component-design.md §2–3 + `ngrx-*` skills) — see overview.md §5
- **Presentational components** (`components/`): `input()`/`output()`/`model()` only — never inject API services, `Router`, `ActivatedRoute`, or `MessageService`
- **Shared before duplicate**: a primitive/constant needed by a second feature goes to `shared/ui`, `shared/models`, or `shared/utils` (overview.md §2/§8) — no copied markup
- **Charts/KPIs/lists/filters/settlement/steps** use the shared components (`app-chart-card`, `app-kpi-card`, `app-list-skeleton`, `app-name-filter-panel`, `app-settle-modal`, `app-status-steps`) — no local variants
- **Semantic tones only**: status/tone colors are `text-success` / `text-warning` / `text-danger` (no `emerald`/`amber`/`red` palette pairs); money via `shared/utils/format.ts` + `DEFAULT_CURRENCY_CODE` (EGP) — design-consistency.md, overview.md §8
- **Reactive Forms only** — no `ngModel`, no in-place input-array mutation; custom controls are `ControlValueAccessor` (`app-autosearch`)
- **Cross-feature imports are forbidden** except the documented exceptions (overview.md §7); shared code → `shared/` or `core/`
- **No barrel files in `models/`** — import `*.entity.ts` / `*.request.ts` directly (api-services-and-models.md)
- **PrimeNG first** for interactive primitives; **semantic Tailwind classes only** (no hardcoded hex/rgb, no component `styles: []` keyframes) — design-consistency.md
- **API services**: `providedIn: 'root'`, return `Observable<ApiResponse<T>>`, Swagger-aligned request types — api-services-and-models.md
- **No single-character identifiers** — `ts-naming-conventions` skill (component-design.md §8)
- **External templates** — `templateUrl: './<name>.component.html'` in a sibling file; never inline `template:` in production components (spec stubs exempt) — component-design.md §1
