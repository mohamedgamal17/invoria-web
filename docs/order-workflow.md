# Order Workflow

Source: `src/app/features/orders/components/order-progress/order-progress.component.ts`
Actions: `src/app/features/orders/models/order-actions.ts`
Statuses: `src/app/features/orders/models/order.entity.ts`
Layout: `src/app/features/orders/pages/order-details-page/`

---

## Statuses

| enum              | value | user-facing label        |
|-------------------|-------|--------------------------|
| `Pending`         | 5     | Awaiting confirmation    |
| `Processing`      | 10    | Order in progress        |
| `Revision`        | 15    | Revision requested       |
| `Completed`       | 20    | Delivered & complete     |
| `Cancelled`       | 25    | Cancelled                |
| `RevisionPending` | 30    | Revision pending         |

---

## Progress Stepper (`app-order-progress`)

Full-width horizontal stepper with circles (w-11 h-11), connectors (h-1 flex-1), and uppercase labels.

### Normal flow (no revision)

```
Pending ── Processing ── Allocation ── Completed
 pi-clock   pi-sync      pi-verified    pi-check-circle
                          (or pi-spinner pi-spin)
```

### Revision flow (`RevisionPending` or `Revision`)

```
Pending ── Revision ── Processing ── Allocation ── Completed
 pi-clock  pi-hourglass  pi-sync      pi-verified    pi-check-circle
           or                          (or pi-spinner)
           pi-pen-to-square
```

The revision step is **hidden** (not in the array) unless status is `RevisionPending` or `Revision`.

### Cancelled flow

```
Pending ── Processing ── Allocation ── Cancelled
 pi-clock   pi-sync      pi-verified    pi-ban (severity: danger, red)
                           (or pi-spinner)
```

### Allocation dynamic

| condition | label | icon |
|-----------|-------|------|
| `status === Processing && !orderAllocated` | Allocating | `pi pi-spinner pi-spin` (animated pulse) |
| all other states | Allocated | `pi pi-verified` |

### Active step mapping

| order status | active step in stepper | how |
|-------------|------------------------|-----|
| `Pending` | Pending | findIndex by status |
| `Processing` | **Allocation** | special case — returns allocation step index |
| `Revision` | Revision | findIndex by status |
| `RevisionPending` | Revision | findIndex by status |
| `Completed` | Completed | findIndex by status |
| `Cancelled` | Cancelled | findIndex by status (last step) |
| no match | Pending (0) | fallback |

### Past steps

Past steps show `pi pi-check` icon instead of their own icon.

---

## Action Gating

Available actions depend on `order.status` and `orderAllocated`.

| action | button icon | severity | available when |
|--------|-------------|----------|----------------|
| **accept** | `pi pi-check` | info | Pending, Revision |
| **requestRevision** | `pi pi-pencil` | warn | Processing + allocated |
| **complete** | `pi pi-check-circle` | success | Processing/Revision + allocated |
| **cancel** | `pi pi-times` | danger | Pending, Processing, Revision |
| **edit** | — | secondary | Pending, Revision |
| **returnItems** | `pi pi-undo` | info | via `canReturnOrderItems()` |

### Primary action priority (beating/pulse animation)

1. Complete
2. Accept
3. Request Revision

The highest-priority available action gets `.pulse-beat` animation (only rendered in page header, not in stepper).

---

## Page Layout (`order-details-page`)

Components appear in this order:

```
p-toast / p-confirmDialog
[← Back to orders] button
┌─────────────────────────────────────────┐
│ page-header (eyebrowIcon="pi pi-receipt")│
│   eyebrow: "Order"                      │
│   title: orderNumber                    │
│   description: customerName + date      │
│   [Edit] [Accept] [Complete] [Cancel]   │
└─────────────────────────────────────────┘
order-progress (full-width, between header and summary)
order-summary-card (status tag, progress bar, financial grid, allocation badge)
p-tabs:
  - Overview tab (no duplicate order-progress)
  - Line items tab
  - Payment & Returns tab (merged from former payment-tab + return-items-tab)
```

### Key layout rules

- `order-progress` lives only at page level, NOT inside the overview tab
- `order-summary-card` does NOT repeat order number or customer name (they're in page-header)
- Payment tab handles both recording payments and return items
- Action buttons (`edit`, `accept`, `complete`, `cancel`) reside in page-header's `ng-content`

---

## Historical decisions

1. **Full-width stepper**: circles are `shrink-0`, connectors are `flex-1` between them — fills parent width
2. **Allocation as separate step**: sits between Processing and Completed; dynamic icon/label based on allocation state
3. **Revision as hidden step**: only inserted into the array when order is in revision flow; otherwise skipped
4. **Cancelled replaces Completed**: final step becomes "Cancelled" with danger styling when status is Cancelled
5. **Duplicate removal**: order-progress and summary-card header info were removed from overview tab and summary-card respectively to avoid duplication with page-header
