---
name: refactor-code
description: Reusable workflow for refactoring existing code in Invoria Web to improve quality, modernize Angular patterns, and adhere to architecture rules while preserving behavior.
---

# Development Workflow: Refactoring Existing Code

This workflow provides a structured approach to refactoring code in Invoria Web while maintaining existing behavior and aligning with modern repository conventions.

---

## Step 1: Inspect Baseline Implementation & Existing Tests

1. **Examine Target Code**: Carefully read the target files and all direct consumers (imports, template references, route definitions).
2. **Review Canonical Reference**: Compare target code against canonical implementations:
   - For components: `src/app/features/customers/pages/` or `src/app/features/orders/pages/`.
   - For UI primitives: `src/app/shared/ui/`.
3. **Run Existing Test Suite**: Run the existing tests before modifying code to establish a clean baseline:
   ```bash
   npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
   ```
   If tests are missing or broken, address test coverage first before refactoring.

---

## Step 2: Identify Target Refactoring Areas

Audit target code for common legacy or non-compliant patterns:
- **Legacy Angular Decorators**: Replace `@Input()`, `@Output()`, `@ViewChild()` with `input()`, `output()`, and `viewChild()`.
- **Inline Templates**: Extract inline `template:` strings into sibling `<component-name>.component.html` files.
- **Identifier Naming Violations**: Identify single-character variables or arrow parameters (`i`, `c`, `q`, `e`, `v`, `m`) and replace them with role-descriptive names (`itemIndex`, `customer`, `query`, `error`, `periodValue`).
- **Styling & Design Tokens**: Replace hardcoded hex/rgb colors or raw Tailwind palette hues (`text-emerald-600`, `bg-red-500`) with semantic tokens (`text-success`, `text-danger`, `bg-surface`).
- **Custom Primitives**: Replace hand-rolled tables, loaders, or dialogs with PrimeNG components (`p-table`, `p-dialog`) or shared primitives (`app-list-skeleton`, `app-confirm-dialog`).
- **Formatting**: Replace ad-hoc `Intl.NumberFormat` with `formatCurrency` or `formatNumber` from `src/app/shared/utils/format.ts`.

---

## Step 3: Perform Incremental Refactoring

Execute refactoring in small, atomic steps:
1. **Preserve External API**: Keep public component inputs, outputs, and service method signatures backward-compatible unless explicitly coordinating a breaking change across consumers.
2. **Refactor Internal Logic**:
   - Modernize reactivity using `signal()`, `computed()`, and `linkedSignal()`.
   - Remove redundant local flags and derive state reactively.
   - Refactor arrow callbacks to use descriptive identifiers.
3. **Extract Shared Primitives**: If logic or markup is duplicated across features, extract it to `src/app/shared/` following the shared-before-duplicate principle.

---

## Step 4: Validate Behavior & Verify

After each incremental change:
1. **Typecheck**: Verify that no type regressions were introduced:
   ```bash
   npx tsc --noEmit -p tsconfig.app.json
   npx tsc --noEmit -p tsconfig.spec.json
   ```
2. **Run Tests**: Ensure all existing unit tests pass:
   ```bash
   npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
   ```
3. **Format Touched Files**: Run Prettier only on files modified during the refactor:
   ```bash
   npx prettier --write <path-to-refactored-file>
   ```
