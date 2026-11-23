---
name: component-stories
description: Use when adding or modifying any presentational component or UI primitive — enforces colocated Storybook *.stories.ts files, proper decorators (PrimeNG, Router, ECharts), args variants (default, empty, loading), and story coverage checks.
---

# Skill: Component UI Stories & Testing

This skill provides step-by-step instructions and conventions for authoring and maintaining Storybook stories in Invoria Web.

## Hard Constraint: 100% Presentational Story Coverage

Every presentational component (`modules/*/src/components/**/*.component.ts` and `modules/ui/src/ui/**/*.component.ts`) **must have a colocated `.stories.ts` file**. Smart container pages (`pages/`) and layout components (`layout/`) are exempt.

Run coverage verification:

```bash
npm run check:stories
```

## Story File Conventions

### 1. Colocation & Naming

- Place stories in the exact same directory as the component:
  - Component: `src/components/product-list/product-list.component.ts`
  - Story: `src/components/product-list/product-list.component.stories.ts`
- File suffix must be `.component.stories.ts`.

### 2. Title Hierarchy

Group stories by module and component name:

- `@invoria/ui`: `UI/<ComponentName>` (e.g., `UI/KpiCard`, `UI/EmptyState`)
- Catalog: `Catalog/<ComponentName>` (e.g., `Catalog/ProductList`, `Catalog/ProductHeader`)
- Customers: `Customers/<ComponentName>` (e.g., `Customers/CustomerList`)
- Sales / Orders: `Sales/Orders/<ComponentName>` (e.g., `Sales/Orders/OrderList`)
- Sales / Returns: `Sales/Returns/<ComponentName>` (e.g., `Sales/Returns/ReturnList`)
- Sales / Invoices: `Sales/Invoices/<ComponentName>` (e.g., `Sales/Invoices/InvoiceList`)
- Procurement / Suppliers: `Procurement/Suppliers/<ComponentName>` (e.g., `Procurement/Suppliers/SupplierList`)
- Procurement / Purchase Orders: `Procurement/PurchaseOrders/<ComponentName>` (e.g., `Procurement/PurchaseOrders/PurchaseOrderList`)
- Inventory: `Inventory/<ComponentName>` (e.g., `Inventory/BatchList`, `Inventory/BatchForm`)
- Financial: `Financial/Payables/<ComponentName>` or `Financial/Receivables/<ComponentName>`

### 3. Autodocs Tag

Always include `tags: ['autodocs']` on the default export metadata:

```typescript
const meta: Meta<ProductListComponent> = {
  title: 'Catalog/ProductList',
  component: ProductListComponent,
  tags: ['autodocs'],
};
```

### 4. Required Variants per Component Type

For each component, provide meaningful stories covering realistic states:

- **Lists / Tables**: `Default` (with rows), `LoadingState`, `EmptyState`
- **Forms / Dialogs**: `CreateMode`, `EditMode`, `LoadingState` (or `Open`, `Saving`)
- **Headers / Profile Cards**: `Default`, `MinimalInfo` (or with/without optional tags/badges)
- **Status / Progress**: Each major status state (e.g., `Draft`, `Processing`, `Completed`, `Cancelled`)

### 5. Decorators for Injected Services

The global `.storybook/preview.ts` automatically configures:

- Animations (`provideAnimationsAsync()`)
- PrimeNG with Aura theme (`providePrimeNG({ theme: { preset: AuraInvoria, ... } })`)
- ECharts core (`provideEchartsCore(...)`)

If a component requires additional providers:

- **Router (`RouterLink`)**:

  ```typescript
  import { applicationConfig } from '@storybook/angular';
  import { provideRouter } from '@angular/router';

  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
  ```

- **Confirmation Service (`ConfirmationService`)**:

  ```typescript
  import { applicationConfig } from '@storybook/angular';
  import { ConfirmationService } from 'primeng/api';

  decorators: [
    applicationConfig({
      providers: [ConfirmationService],
    }),
  ],
  ```

## Verification Commands

```bash
# Verify 100% story coverage (all modules)
npm run check:stories

# Verify 100% story coverage for one module
npm run check:stories -- --module=sales

# Build Storybook bundle (verifies compilation of all stories + gallery docs)
npm run build-storybook

# Run Storybook locally for visual inspection (Gallery docs are under .storybook/gallery/)
npm run storybook

# Run a focused Storybook for one module only (per-module ports: ui 6101, catalog 6102,
# customers 6103, financial 6104, inventory 6105, procurement 6106, sales 6107)
npm run storybook:workspace -- @invoria/sales

# Regenerate global + per-module gallery pages after adding/renaming/removing stories
npm run gallery
```

### Component Gallery

Gallery pages live in `.storybook/gallery/` and are generated from the colocated
story files with `scripts/generate-storybook-gallery.mjs`. After adding, renaming, or
removing a presentational component's story, regenerate so `Gallery › Overview` stays
in sync:

```bash
node scripts/generate-storybook-gallery.mjs
npm run build-storybook
```

Every new presentational component must still add a colocated `.stories.ts` (see
section 3); the generator picks it up automatically on the next run.
