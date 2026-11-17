# Invoria Web — Antigravity Agent Configuration & Rules

Welcome to **Invoria Web**, an enterprise web application built on Angular 21 with Standalone Components, PrimeNG 21, Tailwind CSS v4, and dual state architecture (Signals for simple pages, NgRx for complex shared state).

This document serves as the persistent project-level rules and entry point for Google Antigravity agents working in this repository.

---

## 1. Tech Stack & Environment

| Layer          | Technology                  | Details                                                                                                |
| -------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Framework**  | Angular 21.2                | Standalone components exclusively, Signals-first, Reactive Forms, strict TypeScript 5.9                |
| **UI Library** | PrimeNG 21.1.3              | Styled via custom `AuraInvoria` preset (`src/styles/primeng/aura.preset.ts`)                           |
| **CSS System** | Tailwind CSS 4              | CSS-first `@theme` in `src/styles.css` using semantic tokens from `src/styles/tokens.css`              |
| **Icons**      | Lucide Angular & PrimeIcons | `lucide-angular` (^0.577.0) and `primeicons` (^7.0.0)                                                  |
| **Data Viz**   | ECharts 6 & ngx-echarts 21  | One-time tree-shaken setup in `app.config.ts`, wrapped in `app-chart-card`                             |
| **State**      | Signals & NgRx 22           | Component-local signals for simple pages; NgRx (`store`, `effects`, `router-store`) for complex slices |
| **Testing**    | Vitest 4                    | Run via Angular CLI (`ng test`), jsdom environment; Karma/Jasmine are not used                         |
| **Formatting** | Prettier                    | Single quotes, 100 column limit; format **touched files only**, never tree-wide                        |

---

## 2. Essential Commands

- **Development server**: `ng serve` (runs on `http://localhost:4200`)
- **Build production**: `npm run build` (requires `API_URL` environment variable to generate `environment.production.ts`)
- **Unit testing**: `ng test` (Vitest full run)
- **Focused test**: `npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"`
- **Type checking**: `npx tsc --noEmit -p tsconfig.app.json` and `npx tsc --noEmit -p tsconfig.spec.json`
- **Code formatting**: `npx prettier --write <touched-file>` (never run tree-wide; the repository is intentionally not globally formatted)

---

## 3. Core Hard Constraints

1. **State Management by Complexity (Developer Decision)**:
   - **Simple pages** (isolated lists/details/reports): Use component-local Signals (`rxResource` for data fetching, `linkedSignal` for display state, scoped `MessageService`). Reference: `orders`, `suppliers`.
   - **Complex pages** (shared state across slices, silent mutation sync, duplicate query prevention): Use NgRx feature store modules (`actions`, `reducer`, `selectors`, `effects`, and URL adapter). State must remain CRUD-compatible. Reference: `customers`, `products`.
2. **Component Separation of Concerns**:
   - **Smart Container Pages** (`pages/`): Handle state mapping, navigation, and URL writes (`page`, `pageSize`, `q`).
   - **Presentational Components** (`components/`): Handle UI/UX only. Must communicate strictly via Angular Signal APIs (`input()`, `output()`, `model()`). **Never inject API services, `Router`, `ActivatedRoute`, or `MessageService`.**
   - **External Templates**: Always use `templateUrl: './<name>.component.html'` in a sibling file. Never use inline `template:` in production components (only allowed for spec stubs).
3. **Strict Feature Isolation & Dependency Rules**:
   - Cross-feature imports are **forbidden** by default. Shared primitives live in `shared/` or `core/`.
   - Any exception must follow the documented whitelist (10 exceptions documented in `docs/architecture/overview.md §7`), using `import type` or typed API services only—never importing components, forms, or store modules across features.
4. **UI Design System Consistency**:
   - **PrimeNG First**: Always use PrimeNG components (`p-table`, `p-dialog`, `p-drawer`, `p-button`, `p-tag`, `p-toast`, etc.) before considering custom markup.
   - **Semantic Tokens Only**: Use semantic Tailwind classes (`bg-surface`, `text-foreground`, `border-border`, `text-success`, `text-warning`, `text-danger`). **Never use hardcoded hex/rgb colors or Tailwind raw color palette hues** (`text-emerald-600`, `bg-red-500`, etc.).
   - **Shared UI Primitives**: Reuse `app-chart-card`, `app-kpi-card`, `app-list-skeleton`, `app-details-toolbar`, `app-details-skeleton`, `app-empty-state`, `app-financial-obligation-list`, `app-financial-obligation-overview-card`, `app-report-period-filter-panel`, `app-name-filter-panel`, `app-status-steps`, `app-settle-modal`, `app-autosearch`, and `app-confirm-dialog`. Do not implement local variants.
   - **Currency & Formatting**: Always use `formatCurrency` / `formatNumber` from `src/app/shared/utils/format.ts` and `DEFAULT_CURRENCY_CODE` (`'EGP'`) from `src/app/shared/models/currency.ts`. Never hardcode `'USD'` or `'EGP'`.
5. **TypeScript Identifier Naming Standards**:
   - **Ban on single-character identifiers**: All variable, parameter, arrow callback (`.map()`, `.filter()`, `.reduce()`, `subscribe({ next, error })`), function, and method names must be **at least 2 characters** and describe their **role** (e.g. `customer`, `itemIndex`, `query`, `error`).
   - **Exemptions**: `_` for unused parameters, TypeScript generic parameters (`T`, `E`), and query string keys matching API/URL contracts (`'q'`).
6. **API Services & Models**:
   - API services must be `providedIn: 'root'`, inject `HttpClient`, and return `Observable<ApiResponse<T>>`.
   - Separate domain entities (`*.entity.ts`) from HTTP request shapes (`*.request.ts`).
   - **No barrel files** in `models/` (e.g., do not create `models/product.ts` that re-exports types; import direct file contracts).
7. **Confirmation Dialogs**:
   - Never render `<p-confirmDialog>` or inject `ConfirmationService` directly in feature components. Inject `ConfirmDialogService` and subscribe to the returned `Observable<boolean>`.
8. **Documentation Maintenance**:
   - Update architecture docs and index files in the **same PR** whenever introducing or altering cross-cutting patterns (refer to the `update-docs` workflow and `maintaining-docs` skill).

---

## 4. Antigravity Modular Rules & Workflows

Detailed, specialized guidelines and procedural runbooks are organized under `.agents/`:

### Specialized Project Rules (`rules/`)

- [Architecture & Boundaries](rules/architecture-boundaries.md): Feature isolation, 10 whitelisted exceptions, shared vs feature boundaries.
- [Coding Conventions & Naming](rules/coding-standards.md): Identifier naming, 2-character minimum, Prettier policy, import ordering.
- [Component Design & Forms](rules/component-design.md): Smart vs Presentational split, Signal I/O, Reactive Forms, CVA controls.
- [State Management](rules/state-management.md): Signals (`rxResource`, `linkedSignal`) vs NgRx feature store modules and URL adapters.
- [UI & Design System](rules/ui-design-system.md): PrimeNG primitives, Tailwind v4 semantic tokens, shared UI components, ECharts.
- [Testing & Quality](rules/testing-quality.md): Vitest patterns, HTTP client testing, mocked container specs, Orders fixtures.
- [Error Handling & Security](rules/error-handling-security.md): Centralized error presentation, sanitization, token security.

### Reusable Development Workflows (`workflows/` and `skills/`)

1. `/implement-feature` — [Implementing a New Feature](workflows/implement-feature.md): End-to-end guidance from API modeling to UI scaffolding.
2. `/refactor-code` — [Refactoring Existing Code](workflows/refactor-code.md): Safe, behavior-preserving refactoring with verification.
3. `/eliminate-redundancy` — [Eliminating Redundant Code](workflows/eliminate-redundancy.md): Identifying duplicate logic and migrating to `shared/`.
4. `/debug-issue` — [Debugging and Fixing Issues](workflows/debug-issue.md): Root cause isolation and regression prevention.
5. `/write-tests` — [Writing and Improving Tests](workflows/write-tests.md): Vitest spec authoring following repository patterns.
6. `/pre-commit-review` — [Reviewing Code Before Committing](workflows/pre-commit-review.md): Pre-flight checklist for coding rules, types, and tests.
7. `/update-docs` — [Updating Project Documentation](workflows/update-docs.md): Keeping 3-tier docs index aligned with code changes.

---

## 5. Canonical Reference Implementations

When designing new features or components, always inspect existing canonical implementations first:

- **NgRx CRUD Feature Reference**: `src/app/features/customers/` (pages, store slices, URL adapter, list sync)
- **Signals-Based Feature Reference**: `src/app/features/orders/` and `src/app/features/suppliers/`
- **Shared Primitives**: `src/app/shared/ui/` (`chart-card`, `kpi-card`, `list-skeleton`, `details-toolbar`, `details-skeleton`, `empty-state`, `financial-obligation-list`, `financial-obligation-overview-card`, `report-period-filter-panel`, `name-filter-panel`, `confirm-dialog`)
- **API Services & Request Models**: `src/app/features/customers/services/customers-api.service.ts` and `src/app/features/customers/models/`
- **Testing Specifications**: `src/app/features/orders/pages/orders-page/orders-page.component.spec.ts`

---

## 6. Documentation & Skills Navigation

Navigate docs through one chain: [docs/README.md](../docs/README.md) -> per-folder indexes ([architecture](../docs/architecture/README.md), [guides](../docs/guides/README.md)) -> the canonical doc. Do not index individual docs here.

| Skill | Use when |
| ----- | -------- |

|
grx-page-state | Adding/tuning pagination or page state in NgRx slices |
|
grx-details-store | Building/reviewing a details page (entity load, tabs, child paged panels) |
|
grx-list-mutations | Syncing create/update mutations into a paged-list slice |
| s-naming-conventions | Writing/editing any TypeScript file (identifier naming) |
| charts | Adding or modifying any chart |
|
eport-page-scaffold | Creating/modifying
eports/<feat> pages |
| orders-testing | Writing/changing specs under eatures/orders/ |
| products-list-layout | Working on the products list page/filter panel |
| maintaining-docs | Introducing cross-cutting patterns or touching docs/skills |
| implement-feature | Implementing a new feature or page |
|
efactor-code | Refactoring existing code |
| debug-issue | Diagnosing and fixing bugs/failing tests |
| write-tests | Authoring or improving unit tests |
| pre-commit-review | Pre-commit/pre-PR checklist |
| eliminate-redundancy | Consolidating duplicated code/UI/constants |
| update-docs | Maintaining the docs index |
