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
| `ngrx-list-mutations` | Syncing create/update mutations into a paged-list slice |
| `ts-naming-conventions` | Writing/editing any TypeScript file (identifier naming) |
| `charts` | Adding or modifying any chart |
| `report-page-scaffold` | Creating/modifying `reports/<feat>` pages |
| `orders-testing` | Writing/changing specs under `features/orders/` |
| `products-list-layout` | Working on the products list page/filter panel |
| `maintaining-docs` | Introducing cross-cutting patterns or touching docs/skills |

## Stack

Angular 21 standalone, PrimeNG 21 + AuraInvoria preset, Tailwind v4 (CSS-first `@theme`), RxJS 7.8, Vitest, Prettier (100 cols, single quotes), TypeScript strict.

## Commands

- `ng serve` — dev server (localhost:4200)
- `npm run build` — runs `scripts/generate-production-env.mjs` (requires `API_URL` env var) → `ng build --configuration production`
- `ng test` — Vitest (not Karma/Jasmine)
- `npx prettier --check src/app/` — check formatting

## Hard constraints (details in the linked doc)

- **State pattern is a developer decision by complexity**: simple page → signals pattern (component-design.md §9); complex state → NgRx, CRUD-compatible with list mutation sync (component-design.md §2–3 + `ngrx-*` skills) — see overview.md §5
- **Presentational components** (`components/`): `input()`/`output()`/`model()` only — never inject API services or the router
- **Cross-feature imports are forbidden** except the documented exceptions (overview.md §7); shared code → `shared/` or `core/`
- **No barrel files in `models/`** — import `*.entity.ts` / `*.request.ts` directly (api-services-and-models.md)
- **PrimeNG first** for interactive primitives; **semantic Tailwind classes only** (no hardcoded hex/rgb) — design-consistency.md
- **API services**: `providedIn: 'root'`, return `Observable<ApiResponse<T>>`, Swagger-aligned request types — api-services-and-models.md
- **No single-character identifiers** — `ts-naming-conventions` skill (component-design.md §8)
