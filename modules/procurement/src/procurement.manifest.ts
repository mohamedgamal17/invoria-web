import type { ModuleManifest } from '@invoria/core';
import { BarChart3, ClipboardList, ShoppingCart, Table2, Users, Wallet } from 'lucide-angular';

export const PROCUREMENT_MANIFEST: ModuleManifest = {
  moduleId: 'procurement',
  navigation: [
    {
      label: 'Procurement',
      icon: ShoppingCart,
      children: [
        { label: 'Purchase Orders', path: '/procurement', icon: ClipboardList },
        { label: 'Purchase sales report', path: '/procurement/reports/sales', icon: BarChart3 },
        {
          label: 'Purchase sales metrics',
          path: '/procurement/reports/sales/metrics',
          icon: Table2,
        },
        { label: 'Completion report', path: '/procurement/reports/completion', icon: Wallet },
        {
          label: 'Completion metrics',
          path: '/procurement/reports/completion/metrics',
          icon: Table2,
        },
        { label: 'Suppliers', path: '/suppliers', icon: Users },
      ],
    },
  ],
  routes: [
    {
      path: 'procurement',
      loadChildren: () =>
        import('./purchase-orders/procurement.routes').then((module) => module.PROCUREMENT_ROUTES),
    },
    {
      path: 'suppliers',
      loadChildren: () =>
        import('./suppliers/suppliers.routes').then((module) => module.SUPPLIERS_ROUTES),
    },
  ],
};
