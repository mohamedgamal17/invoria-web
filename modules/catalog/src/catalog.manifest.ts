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
        { label: 'Returns', path: '/returns', icon: Undo2 },
      ],
    },
  ],
  routes: [
    {
      path: 'products',
      loadChildren: () => import('./products.routes').then((module) => module.PRODUCTS_ROUTES),
    },
  ],
};
