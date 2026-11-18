# Coding Conventions & Naming Standards

This rule establishes coding conventions, strict naming standards, and formatting policies for **Invoria Web**.

---

## 1. Ban on Single-Character Identifiers

To ensure long-term maintainability and readability, **single-character identifiers are strictly prohibited** for:
- Variables (`const`, `let`, `var`)
- Function and method parameters
- **All arrow-callback parameters** (`.map()`, `.filter()`, `.find()`, `.some()`, `.reduce()`, `subscribe({ next, error })`, sort comparators)
- Function and method names

There are **no exceptions for short scopes**.

### Forbidden vs Required Examples

```ts
// ❌ BAD: Single-character identifiers
items.map(i => ({ id: i.id, qty: i.quantity }));
customers.filter(c => c.city === q);
subscribe({ next: v => this.handle(v), error: e => this.log(e) });

// ✅ GOOD: Role-descriptive identifiers
items.map(item => ({ id: item.id, quantity: item.quantity }));
customers.filter(customer => customer.city === query);
subscribe({
  next: response => this.handle(response),
  error: error => this.log(error)
});
```

### Approved Exemptions

Only the following patterns are exempt from this rule:
1. `_` as an explicitly unused parameter: `(_, index) => ...`
2. Standard TypeScript generic type parameters: `T`, `E`, `K` (e.g., `ApiResponse<T>`, `Paging<T>`)
3. String or URL query parameter keys required by backend contracts: `paramMap.get('q')`, `queryParams: { q: query }`

### Standard Role Vocabulary

| Role / Context | Required Name |
|---|---|
| Search / filter text (`q` query param) | `query`, `nameFilter`, `tabQuery` |
| Paging query parameters | `pageNumber`, `pageSize`, `pageIndex` |
| Iteration counters | `index`, `itemIndex`, `rowIndex` |
| Iterated domain item | `item`, `customer`, `order`, `product` |
| Errors in catch or callbacks | `error` (or `err` if nested in a scope that already defines `error`) |
| Comparators | `left`, `right` |
| Guarded type narrowing | `value` (e.g. `(value): value is OrderStatus => ...`) |
| Accumulator in reduce / fold | `accumulator`, `current`, `summary` |
| Chart data points | `point`, `periodValue`, `metric` |
| Route param map in lazy-load guards | `module` |

### Self-Audit Verification Command

Run this PowerShell command to audit changed files for accidental single-character variables or arrow parameters:
```powershell
$patterns = @('=>\s*[A-Za-z]\b', '\(\s*[A-Za-z]\s*\)\s*=>', '\b(?:const|let|var)\s+[A-Za-z]\s*[:=]')
Get-ChildItem -Path src/app -Recurse -Filter *.ts | ForEach-Object {
  $file = $_
  foreach ($pattern in $patterns) {
    Select-String -LiteralPath $file.FullName -Pattern $pattern |
      ForEach-Object { "$($file.FullName):$($_.LineNumber): $($_.Line.Trim())" }
  }
}
```

---

## 2. File & Directory Naming Conventions

- **Files**: All filenames must be `kebab-case.extension` (e.g., `customers-page.component.ts`, `customer.entity.ts`, `list-customer.request.ts`).
- **Classes**: `PascalCase` (e.g., `CustomersPageComponent`, `CustomersApiService`).
- **Interfaces / Types**: `PascalCase` (e.g., `Customer`, `ListCustomerRequest`).
- **Constants / Action Groups**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGE_SIZE`, `CUSTOMERS_ACTIONS`).
- **Properties & Methods**: `camelCase` (e.g., `loadCustomers`, `pageIndex`, `isSuccess`).
- **Direct Suffixes**:
  - Components: `*.component.ts` and `*.component.html`
  - Services: `*-api.service.ts` or `*.service.ts`
  - Entities: `*.entity.ts`
  - Requests: `[action]-[entity].request.ts`; shared create/update body: `<entity>-request.ts`
  - Specifications: `*.spec.ts`

---

## 3. Import Ordering

Maintain consistent import grouping separated by single empty lines:
1. **Angular core imports**: `@angular/core`, `@angular/common`, `@angular/router`, etc.
2. **RxJS imports**: `rxjs`, `rxjs/operators`
3. **Third-party libraries**: `primeng/*`, `@ngrx/*`, `echarts/*`, `lucide-angular`
4. **App Core & Shared imports**: `src/app/core/*`, `src/app/shared/*`
5. **Feature-local imports**: Feature `services/`, `models/`, `components/`, `store/`

---

## 4. Prettier Formatting Policy

- **Targeted Formatting Only**: Run `npx prettier --write <file>` **only on touched files**.
- **Never Run Globally**: Do not run `prettier --write .` or format unmodified files. The repository intentionally contains non-formatted regions to avoid breaking git blame and creating massive diffs.
- Configuration: Single quotes (`singleQuote: true`), 100 character print width (`printWidth: 100`).

---

## 5. TypeScript Strictness & Type Safety

- **No `any`**: Use explicit interfaces, unions, generics, or `unknown` with type guards.
- **`satisfies` Operator**: When defining request object literals at call sites, use `satisfies` to validate the shape without widening types:
  ```ts
  const request = {
    Name: this.nameFilter(),
    Skip: this.pageIndex() * this.pageSize(),
    Length: this.pageSize()
  } satisfies ListCustomerRequest;
  ```
- **Readonly Properties**: Component state mapped from NgRx selectors or signals must be declared `readonly`.
