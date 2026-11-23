# Storybook UI Component Testing & Story Development

Invoria Web uses [Storybook](https://storybook.js.org/) for component-driven UI development, visual verification, and isolated presentational component testing across all modules.

---

## 1. Principles & Architectural Role

1. **Isolation Verification**: Presentational components (`modules/*/src/components/` and `modules/ui/src/ui/`) must be renderable in complete isolation without dependencies on parent container pages, NgRx stores, or live backend APIs.
2. **100% Coverage Enforced**: Every presentational component must have a colocated `.stories.ts` file. CI enforces this via `npm run check:stories`.
3. **Smart Pages vs Presentational**:
   - **Presentational Components** (`components/`): Require stories. They take `input()` signals and emit `output()` events.
   - **Smart Container Pages** (`pages/`) and **Layout Shells** (`layout/`): Exempt from stories; they handle routing, store effects, and navigation.

---

## 2. Directory & Story Naming Conventions

Stories are colocated with their target component:

```
modules/catalog/src/components/product-list/
├── product-list.component.ts
├── product-list.component.html
├── product-list.component.spec.ts
└── product-list.component.stories.ts
```

### Story Title Hierarchy

| Module                        | Story Title Prefix                       | Example                                        |
| ----------------------------- | ---------------------------------------- | ---------------------------------------------- | ---------------------------------- |
| `@invoria/ui`                 | `UI/<Component>`                         | `UI/KpiCard`, `UI/EmptyState`                  |
| Catalog                       | `Catalog/<Component>`                    | `Catalog/ProductList`, `Catalog/ProductHeader` |
| Customers                     | `Customers/<Component>`                  | `Customers/CustomerList`                       |
| Sales / Orders                | `Sales/Orders/<Component>`               | `Sales/Orders/OrderList`                       |
| Sales / Returns               | `Sales/Returns/<Component>`              | `Sales/Returns/ReturnList`                     |
| Sales / Invoices              | `Sales/Invoices/<Component>`             | `Sales/Invoices/InvoiceList`                   |
| Procurement / Suppliers       | `Procurement/Suppliers/<Component>`      | `Procurement/Suppliers/SupplierList`           |
| Procurement / Purchase Orders | `Procurement/PurchaseOrders/<Component>` | `Procurement/PurchaseOrders/PurchaseOrderList` |
| Inventory                     | `Inventory/<Component>`                  | `Inventory/BatchList`                          |
| Financial                     | `Financial/<Payables                     | Receivables>/<Component>`                      | `Financial/Payables/PayableHeader` |

---

## 3. Story Implementation Pattern

### Basic Story

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { ProductListComponent } from './product-list.component';
import type { Product } from '../../models/product.entity';

const sampleProducts: Product[] = [
  /* ... mock data ... */
];

const meta: Meta<ProductListComponent> = {
  title: 'Catalog/ProductList',
  component: ProductListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ProductListComponent>;

export const Default: Story = {
  args: {
    products: sampleProducts,
    totalRecords: sampleProducts.length,
    loading: false,
  },
};

export const LoadingState: Story = {
  args: {
    products: [],
    totalRecords: 0,
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    products: [],
    totalRecords: 0,
    loading: false,
  },
};
```

### Injected Dependencies (Decorators)

Global setup in `.storybook/preview.ts` automatically configures:

- Animations (`provideAnimationsAsync()`)
- PrimeNG with Aura theme (`providePrimeNG({ theme: { preset: AuraInvoria } })`)
- ECharts core (`provideEchartsCore(...)`)

If a component uses routing or confirmation services:

```typescript
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';

const meta: Meta<OrderSummaryCardComponent> = {
  title: 'Sales/Orders/OrderSummaryCard',
  component: OrderSummaryCardComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};
```

---

## 4. Commands & CI Enforcement

| Command                   | Purpose                                                                          |
| ------------------------- | -------------------------------------------------------------------------------- |
| `npm run check:stories`   | Checks 100% story coverage for all presentational components                     |
| `npm run storybook`       | Starts the global Storybook dev server on `http://localhost:6006` (all modules)  |
| `npm run storybook:workspace -- @invoria/<module>` | Starts a focused Storybook for only `<module>` on its own port — e.g. `npm run storybook:workspace -- @invoria/sales` → `http://localhost:6107` (native: `npm run storybook -w @invoria/sales`) |
| `npm run gallery`         | Regenerates the global and per-module gallery MDX pages (`node scripts/generate-storybook-gallery.mjs`) |
| `npm run build-storybook` | Builds the global static Storybook bundle to `dist/storybook/` (verifies build compilation) |

## 5. Component Gallery

Invoria ships a Storybook component gallery exposed under `docs/Gallery` in the Storybook sidebar. It is generated from the colocated `*.component.stories.ts` files with `scripts/generate-storybook-gallery.mjs`.

- **`Gallery › Overview`** — every presentational component rendered with its primary story in a responsive card grid, grouped by module. Reviewers can scan all components at a glance.
- **`Gallery › Overlays`** — dialog/modal components (`appendTo="body"`) shown one per iframe (`inline={false}`) so open modals stay contained instead of covering the page.

Regenerate the gallery whenever stories are added, renamed, or removed:

```bash
node scripts/generate-storybook-gallery.mjs
npm run build-storybook
```

CI enforces 100% story coverage via `npm run check:stories`. Every new presentational component must add a colocated `.stories.ts`; the generator picks it up automatically on the next run.

## 6. Per-module Storybooks

Each feature module team can run a focused Storybook containing only its own components (no sibling modules) on a dedicated port, so teams don't distract each other with unrelated stories:

| Module | Command | URL |
| ------ | ------- | --- |
| `@invoria/ui` | `npm run storybook:workspace -- @invoria/ui` | http://localhost:6101 |
| Catalog | `npm run storybook:workspace -- @invoria/catalog` | http://localhost:6102 |
| Customers | `npm run storybook:workspace -- @invoria/customers` | http://localhost:6103 |
| Financial | `npm run storybook:workspace -- @invoria/financial` | http://localhost:6104 |
| Inventory | `npm run storybook:workspace -- @invoria/inventory` | http://localhost:6105 |
| Procurement | `npm run storybook:workspace -- @invoria/procurement` | http://localhost:6106 |
| Sales | `npm run storybook:workspace -- @invoria/sales` | http://localhost:6107 |

Each instance reuses the shared `.storybook/preview.ts` providers (animations, PrimeNG Aura preset, ECharts) but reads only `<module>/src/**/*.stories.ts` plus a per-module gallery generated from that module's stories:

- `.storybook/modules/<module>/main.ts` — story glob for one module only.
- `.storybook/modules/<module>/preview.ts` — re-exports the shared preview.
- `.storybook/modules/<module>/gallery/overview.mdx` (+ `overlays.mdx`) — module-scoped gallery, regenerated with `npm run gallery`.

The global instance (`npm run storybook`, port 6006) still shows every module and is unchanged. Coverage is still enforced globally via `npm run check:stories` and per-module via `npm run check:stories -- --module=<module>`.

To add Storybook access for a new module that has stories:

1. Create `.storybook/modules/<module>/main.ts` and `.storybook/modules/<module>/preview.ts` following an existing module's example.
2. Add `storybook` and `build-storybook` scripts to `modules/<module>/package.json` with a free port (see existing module examples).
3. Run `npm run gallery` to generate that module's gallery pages.
4. Run `npm run storybook:workspace -- @invoria/<module>` (native: `npm run storybook -w @invoria/<module>`).
