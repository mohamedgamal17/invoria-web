import type { ModuleManifest } from '@invoria/core';
import { BarChart3, Receipt, ShoppingBag, Table2, TrendingUp, Wallet } from 'lucide-angular';

export const SALES_MANIFEST: ModuleManifest = {
  moduleId: 'sales',
  navigation: [
    {
      label: 'Sales',
      icon: TrendingUp,
      children: [
        { label: 'Orders', path: '/orders', icon: ShoppingBag },
        { label: 'Sales report', path: '/orders/reports/sales', icon: BarChart3 },
        { label: 'Sales metrics', path: '/orders/reports/sales/metrics', icon: Table2 },
        { label: 'Profit report', path: '/orders/reports/profit', icon: Wallet },
        { label: 'Profit metrics', path: '/orders/reports/profit/metrics', icon: Table2 },
        { label: 'Invoices', path: '/invoices', icon: Receipt },
      ],
    },
  ],
  routes: [
    {
      path: 'orders',
      loadChildren: () => import('./orders/orders.routes').then((module) => module.ORDERS_ROUTES),
    },
    {
      path: 'returns',
      loadChildren: () =>
        import('./returns/returns.routes').then((module) => module.RETURNS_ROUTES),
    },
    {
      path: 'invoices',
      loadChildren: () =>
        import('./invoices/invoices.routes').then((module) => module.INVOICES_ROUTES),
    },
  ],
};
