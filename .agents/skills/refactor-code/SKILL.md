---
name: refactor-code
description: Use when refactoring existing code in Invoria Web — modernizes legacy Angular decorators to signals, extracts inline templates, enforces 2-character identifier naming, replaces raw palette colors with semantic tokens, and ensures behavior preservation through tests.
---

# Skill: Refactoring Existing Code

This skill guides refactoring of components, services, or state modules in Invoria Web while maintaining behavior.

## Step 1: Inspect Target Code & Establish Test Baseline
- Read target files and their callers/specs.
- Inspect canonical references (`src/app/features/customers/`, `src/app/shared/ui/`).
- Run the existing test suite before making changes:
  ```bash
  npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
  ```

## Step 2: Modernize & Align with Repository Standards
1. **Migrate Decorators**: Replace `@Input()`, `@Output()`, `@ViewChild()` with `input()`, `output()`, and `viewChild()`.
2. **External Templates**: Extract inline `template:` strings into sibling `.component.html` files.
3. **Identifier Naming**: Replace single-character variables or arrow parameters (`i`, `c`, `q`, `e`, `v`, `m`) with role-descriptive names (`itemIndex`, `customer`, `query`, `error`, `periodValue`).
4. **Semantic Tokens**: Replace hardcoded hex colors and Tailwind palette hues (`text-emerald-600`, `bg-red-500`) with semantic tokens (`text-success`, `text-danger`).
5. **PrimeNG & Shared UI**: Replace custom HTML controls with PrimeNG primitives or shared components (`app-list-skeleton`, `app-confirm-dialog`).
6. **Formatting**: Replace inline `Intl.NumberFormat` with `formatCurrency` or `formatNumber` from `src/app/shared/utils/format.ts`.

## Step 3: Verify Continuously
```bash
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.spec.json
npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
npx prettier --write <touched-file>
```
