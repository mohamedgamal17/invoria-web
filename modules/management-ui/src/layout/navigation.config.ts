import type { ModuleNavEntry } from '@invoria/core';
import {
  Banknote,
  BarChart3,
  ClipboardList,
  ContactRound,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Table2,
  TrendingUp,
  Undo2,
  User,
  Users,
  Wallet,
  Warehouse,
} from 'lucide-angular';

/**
 * Centralized sidebar navigation entries for the management UI.
 */
export const MANAGEMENT_NAV_ENTRIES: readonly ModuleNavEntry[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  {
    label: 'Inventory',
    icon: Warehouse,
    children: [
      { label: 'Products', path: '/products', icon: Package },
      { label: 'Returns', path: '/returns', icon: Undo2 },
    ],
  },
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
  {
    label: 'Procurement',
    icon: ShoppingCart,
    children: [
      { label: 'Purchase Orders', path: '/procurement', icon: ClipboardList },
      { label: 'Purchase sales report', path: '/procurement/reports/sales', icon: BarChart3 },
      { label: 'Purchase sales metrics', path: '/procurement/reports/sales/metrics', icon: Table2 },
      { label: 'Completion report', path: '/procurement/reports/completion', icon: Wallet },
      {
        label: 'Completion metrics',
        path: '/procurement/reports/completion/metrics',
        icon: Table2,
      },
      { label: 'Suppliers', path: '/suppliers', icon: Users },
    ],
  },
  {
    label: 'Financial',
    icon: Wallet,
    children: [
      { label: 'Receivables', path: '/receivables', icon: Receipt },
      { label: 'Payables', path: '/payables', icon: Banknote },
    ],
  },
  {
    label: 'CRM',
    icon: ContactRound,
    children: [{ label: 'Customers', path: '/customers', icon: User }],
  },
];
