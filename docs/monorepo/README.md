# Monorepo Architecture & Module Registration

Invoria Web is structured as an npm workspaces monorepo under `modules/`. Each domain and infrastructure slice lives in its own package with clear boundaries, independent TypeScript configs, and explicit public API barrels (`src/index.ts`).

---

## 1. Directory Structure

```text
invoria-web/
├── modules/
│   ├── core/           # Foundational HTTP interceptors, error normalization, base models & ModuleManifest
│   ├── utils/          # Shared utilities, formatting, validators, pagination helpers, app-error effects
│   ├── event-bus/      # In-memory reactive ServiceBus, cross-module domain event contracts & queries
│   ├── ui/             # Reusable presentational components (chart-card, kpi-card, autosearch, etc.)
│   ├── catalog/        # Products catalog feature module (manifest, pages, store, routes)
│   ├── customers/      # Customers CRM feature module (manifest, pages, store, routes)
│   ├── sales/          # Orders, Invoices, Returns feature module (manifest, pages, store, routes)
│   ├── procurement/    # Purchase orders, Suppliers feature module (manifest, pages, store, routes)
│   ├── financial/      # Receivables, Payables feature module (manifest, pages, store, routes)
│   ├── inventory/      # Batches management and shared components (consumed by catalog)
│   └── shell/          # Host application: bootstrap, app config, sidebar layout, dashboard, error pages
├── scripts/            # Build & deployment scripts (generate-production-env.mjs)
├── docs/               # Architecture & guide documentation
└── .agents/            # Antigravity agent configuration and rules
```

---

## 2. Module Manifest Registration Contract

To decouple the shell from feature module internals, `@invoria/core` provides the `ModuleManifest` contract:

```typescript
import type { Routes } from '@angular/router';
import type { LucideIconData } from 'lucide-angular';

export interface ModuleNavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: LucideIconData;
}

export interface ModuleNavGroup {
  readonly label: string;
  readonly icon: LucideIconData;
  readonly children: readonly ModuleNavItem[];
}

export type ModuleNavEntry = ModuleNavItem | ModuleNavGroup;

export interface ModuleManifest {
  readonly moduleId: string;
  readonly navigation: readonly ModuleNavEntry[];
  readonly routes: Routes;
}
```

### Implementing a Manifest in a Feature Module

Every routable feature module exports its manifest from `src/index.ts`:

```typescript
// modules/catalog/src/catalog.manifest.ts
import type { ModuleManifest } from '@invoria/core';
import { Package, Undo2, Warehouse } from 'lucide-angular';

export const CATALOG_MANIFEST: ModuleManifest = {
  moduleId: 'catalog',
  navigation: [
    {
      label: 'Inventory',
      icon: Warehouse,
      children: [
        { label: 'Products', path: '/products', icon: Package },
        { label: 'Returns', path: '/returns', icon: Undo2 }
      ]
    }
  ],
  routes: [
    {
      path: 'products',
      loadChildren: () =>
        import('./products.routes').then((module) => module.PRODUCTS_ROUTES)
    }
  ]
};
```

### Shell Consumption

The shell orchestrates all modules in `modules/shell/src/app/modules.config.ts`:

```typescript
import type { ModuleManifest } from '@invoria/core';
import { CATALOG_MANIFEST } from '@invoria/catalog';
import { CUSTOMERS_MANIFEST } from '@invoria/customers';
import { FINANCIAL_MANIFEST } from '@invoria/financial';
import { PROCUREMENT_MANIFEST } from '@invoria/procurement';
import { SALES_MANIFEST } from '@invoria/sales';

export const APP_MODULE_MANIFESTS: readonly ModuleManifest[] = [
  CATALOG_MANIFEST,
  SALES_MANIFEST,
  PROCUREMENT_MANIFEST,
  FINANCIAL_MANIFEST,
  CUSTOMERS_MANIFEST
];
```

- **Routes**: `app.routes.ts` maps `APP_MODULE_MANIFESTS.flatMap(m => m.routes)` into the dashboard child routes.
- **Navigation**: `dashboard-sidebar.component.ts` maps `APP_MODULE_MANIFESTS.flatMap(m => m.navigation)` directly into sidebar entries.
