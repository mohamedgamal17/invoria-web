---
name: pre-commit-review
description: Use before committing code or submitting a PR in Invoria Web — runs pre-flight checklist covering architectural boundaries, 2-character identifier naming, semantic tokens, external templates, typechecking, and tests.
---

# Skill: Reviewing Code Before Committing

This skill executes a complete pre-flight review to ensure changes adhere to all repository rules.

## Step 1: Inspect Changes
```bash
git status
git diff --stat
```

## Step 2: Verification Checklist

1. **Architecture & Boundaries**:
   - [ ] No unauthorized cross-feature imports (only the 10 whitelist exceptions in `docs/architecture/overview.md §7`).
   - [ ] No barrel files in `models/`.
   - [ ] Shared primitives extracted to `src/app/shared/`.
2. **Component Design**:
   - [ ] External templates only (`templateUrl: './<name>.component.html'`). No inline `template:`.
   - [ ] Presentational components use Signal I/O (`input()`, `output()`) and do NOT inject API services, Router, or MessageService.
   - [ ] Reactive Forms only (no `[(ngModel)]`).
   - [ ] Confirmation dialogs use `ConfirmDialogService` (no `<p-confirmDialog>`).
3. **UI & Styling**:
   - [ ] PrimeNG components used for interactive elements.
   - [ ] Semantic Tailwind tokens only (`bg-surface`, `text-foreground`, `text-success`, `text-danger`).
   - [ ] Zero raw palette hues (`emerald`, `amber`, `red`, `blue`).
   - [ ] Currency formatted via `formatCurrency()` with `DEFAULT_CURRENCY_CODE` (`'EGP'`).
4. **Naming Standards**:
   - [ ] No single-character identifiers in variables, parameters, arrow callbacks, or tests.
   - Audit command:
     ```powershell
     $patterns = @('=>\s*[A-Za-z]\b', '\(\s*[A-Za-z]\s*\)\s*=>', '\b(?:const|let|var)\s+[A-Za-z]\s*[:=]')
     git diff --name-only | Where-Object { $_ -match '\.ts$' } | ForEach-Object {
       $file = $_
       foreach ($pattern in $patterns) {
         Select-String -LiteralPath $file -Pattern $pattern | ForEach-Object { "$file:$($_.LineNumber): $($_.Line.Trim())" }
       }
     }
     ```

## Step 3: Run Verification Suite
```bash
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.spec.json
npx ng test --watch=false
git diff --name-only | Where-Object { $_ -match '\.(ts|html|css|json|md)$' } | ForEach-Object { npx prettier --write $_ }
```
