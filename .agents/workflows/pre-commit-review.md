---
name: pre-commit-review
description: Reusable workflow for performing a comprehensive pre-commit quality review, verifying coding rules, architectural boundaries, formatting, and tests before committing changes.
---

# Development Workflow: Reviewing Code Before Committing

This workflow serves as the mandatory pre-commit checklist for all changes in Invoria Web. Execute this workflow before committing or submitting a pull request.

---

## Step 1: Inspect Changes & Affected Areas

1. Review the git diff to identify every modified, added, or deleted file:
   ```bash
   git status
   git diff --stat
   ```
2. For each changed file, inspect whether it touches core rules or cross-cutting patterns.

---

## Step 2: Quality & Architectural Boundaries Checklist

Verify that every modified file passes the repository rules:

### 1. Architecture & Boundaries
- [ ] No unauthorized cross-feature imports (only the 10 whitelist exceptions in `docs/architecture/overview.md §7` are permitted).
- [ ] No barrel files added to `models/` (entities and requests must be imported from direct file paths).
- [ ] Shared-before-duplicate: If a primitive is used across features, is it in `src/app/shared/`?
- [ ] No circular dependencies introduced.

### 2. Component Design & Templates
- [ ] Every production component uses `templateUrl: './<name>.component.html'`. No inline `template:` strings.
- [ ] Presentational components use Signal I/O (`input()`, `output()`, `model()`) without legacy `@Input()`/`@Output()`.
- [ ] Presentational components **do not inject** API services, `Router`, `ActivatedRoute`, or `MessageService`.
- [ ] Non-trivial forms use Reactive Forms (no `[(ngModel)]`, no in-place mutation).
- [ ] Confirmation dialogs use `ConfirmDialogService` (no `<p-confirmDialog>` in feature templates).

### 3. UI Design System & Styling
- [ ] PrimeNG components used for interactive primitives (`p-table`, `p-dialog`, `p-button`, `p-tag`).
- [ ] Semantic Tailwind tokens used exclusively (`bg-surface`, `text-foreground`, `border-border`, `text-success`, `text-warning`, `text-danger`).
- [ ] **Zero raw palette hues** (`emerald`, `amber`, `red`, `blue`, etc.) in component markup.
- [ ] No component-level `@keyframes` (shared animations live in `src/styles.css`).
- [ ] Currency formatted via `formatCurrency()` with `DEFAULT_CURRENCY_CODE` (`'EGP'`). No hardcoded `'USD'` or `'EGP'`.
- [ ] Shared UI primitives reused (`app-chart-card`, `app-kpi-card`, `app-list-skeleton`, `app-name-filter-panel`, `app-status-steps`, `app-settle-modal`, `app-autosearch`).

### 4. Coding Conventions & Naming
- [ ] **No single-character identifiers**: All variables, parameters, and arrow callbacks have at least 2 characters.
  - Run the audit command:
    ```powershell
    $patterns = @('=>\s*[A-Za-z]\b', '\(\s*[A-Za-z]\s*\)\s*=>', '\b(?:const|let|var)\s+[A-Za-z]\s*[:=]')
    git diff --name-only | Where-Object { $_ -match '\.ts$' } | ForEach-Object {
      $file = $_
      foreach ($pattern in $patterns) {
        Select-String -LiteralPath $file -Pattern $pattern | ForEach-Object { "$file:$($_.LineNumber): $($_.Line.Trim())" }
      }
    }
    ```
- [ ] Correct import ordering: Angular → RxJS → Third-Party → Core/Shared → Feature-local.

---

## Step 3: Verification Commands

Execute the full verification suite:

```bash
# 1. Typecheck application and specs
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.spec.json

# 2. Run unit tests on modified features
npx ng test --watch=false

# 3. Format ONLY touched files
git diff --name-only | Where-Object { $_ -match '\.(ts|html|css|json|md)$' } | ForEach-Object {
  npx prettier --write $_
}
```

---

## Step 4: Documentation Synchronization

- [ ] If a cross-cutting pattern, convention, or boundary exception was introduced or modified, is the relevant doc in `docs/` and its folder index updated in the same commit? (See `/update-docs` workflow).
