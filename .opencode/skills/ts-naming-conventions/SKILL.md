---
name: ts-naming-conventions
description: Use when writing or editing any TypeScript file in this repo — identifiers must be descriptive; every variable, parameter (including all arrow-callback params), function, and method name must be at least 2 characters; catches and fixes lazy names like `m`, `n`, `q`, `v`, `e`, `d`, `o`, `s`, `p`, `t`, `r`, `a`, `b`, `c`, `i`, `f` in callbacks, effects, reducers, services, and specs.
compatibility: Invoria Web (Angular 21, TypeScript strict, Vitest)
---

# TypeScript identifier naming

Ban on single-character identifiers for variables, parameters, functions, and methods.
Every name must describe its **role**, not just its type. Applies to **all** code including
arrow-callback parameters in `.map()`, `.filter()`, `.find()`, `.some()`, `.compareTo`,
`subscribe({ next, error })`, reducers, effects, services, specs — **no exceptions for
"short scopes".**

## 1. The rule

```ts
// BAD
list.filter(c => c.city === q)
items.map(i => ({ id: i.id, qty: i.quantity }))
subscribe({	next: (v) => ..., error: (e) => ... })

// GOOD
customers.filter((customer) => customer.city === query)
items.map((item) => ({ id: item.id, quantity: item.quantity }))
subscribe({
  next: (service) => ...,
  error: (err) => ...
})
```

## 2. Exemptions (the only ones)

| Pattern | Why |
| --- | --- |
| `_` as unused placeholder | `(_, index) => ...` |
| Generic type parameters `T`, `E` | TS idiom (`ApiResponse<T>`, `Paging<T>`) |
| **String/URL keys** named `q` | `paramMap.get('q')`, `queryParams: { q: ... }` match the backend/URL contract — do NOT rename |
| Regex flags / string contents | `/^[...]+$/i`, literal text |

## 3. Role → name mapping (use this vocabulary)

| If it is… | Name it… |
| --- | --- |
| `route.paramMap` / `queryParamMap` in `.then((m) => …)` lazy-load guards | `module` (route files) |
| Map/Set update callback accumulator | `current` |
| Day-1/day-7 parsed query params (page…) | `pageNumber` |
| Search/filter text (the `q` query param) | `query`, `nameFilter`, `tabQuery` |
| Guarded type-narrowing value (`(v) => v is X`) | `value` (type-guard param keeps the same name: `(value): value is OrderPaymentMethod`) |
| Chart series day value | `periodValue`, `point` (for chart data items) |
| Caught error / `error:` callback param | `error` (or `err` if outer variable is also `error`) |
| Numeric enum map helper result | `enumMap`, `numericEnumValues` |
| Item in a paginated-list item iteration | `itemIndex` (or `row`, `draftLine` by role) |
| Iteration counter / skeleton index | `index` |
| Retry-loop counter | `attempt` |
| Snapshot item paired in `some((item, index) => …)` | `snapshotItem` |
| Comparators for `sameQuery`/`sameFetchRound`/`sort` | `left`, `right` |
| Test fixture variable | `fixture` |
| Chart data point / date-like value | `point`, `date`, `reference` |

If none of these fit, use full role-descriptive words — never short-circuit to letters.

## 4. Self-audit before submitting

PowerShell (scan arrow params + declarations):

```powershell
Get-ChildItem -Path src\app -Recurse -Filter *.ts | ForEach-Object {
  Select-String -Path $_.FullName -Pattern '\b[a-z]\s*:\s*[A-Z]|=>\s*\([a-zA-Z]\b|,\s*[a-z]\)\s*=>|\([a-z]\)\s*=>|function\s+\w\(|\bfunction\s_[a-z])\b'
}
```

Also scan **template-literal interpolations** (`${...}`) — regex scans miss them:

```
${o.name}, ${v.kind} — grep for `${` and eyeball each interpolation
```

Fix with whole-word, context-aware edits; when `e` → `error` collides with an outer
`error` variable, use `err`. After any rename wider than one file, run:
`npx tsc --noEmit -p tsconfig.app.json` and the affected test suite
(`npx ng test --watch=false`).

## 5. Prettier interplay

Never run `prettier --write` on the whole tree to "fit" long lines after renames — the
repo is deliberately not fully prettier-clean; hand-wrap over-100-col lines instead,
matching local style (no trailing commas unless surrounding code uses them).
