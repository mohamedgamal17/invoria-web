import type { Routes } from '@angular/router';
import type { LucideIconData } from 'lucide-angular';

/**
 * A navigation item that a feature module registers in the shell sidebar.
 */
export interface ModuleNavItem {
  /** Display label shown in the sidebar. */
  readonly label: string;
  /** Router path (absolute, e.g. '/orders'). */
  readonly path: string;
  /** Lucide icon for the sidebar. */
  readonly icon: LucideIconData;
}

/**
 * A navigation group that collects related nav items under a collapsible header.
 */
export interface ModuleNavGroup {
  /** Group header label. */
  readonly label: string;
  /** Lucide icon for the group header. */
  readonly icon: LucideIconData;
  /** Child navigation items within this group. */
  readonly children: readonly ModuleNavItem[];
}

/**
 * A single sidebar entry — either a standalone link or a collapsible group.
 */
export type ModuleNavEntry = ModuleNavItem | ModuleNavGroup;

/**
 * Standard manifest that every routable feature module must export.
 *
 * The shell consumes these manifests at build time to:
 * 1. Auto-generate the router configuration (lazy-loaded child routes).
 * 2. Auto-build the sidebar navigation entries.
 *
 * @example
 * ```typescript
 * // modules/sales/src/index.ts
 * export const SALES_MANIFEST: ModuleManifest = {
 *   moduleId: 'sales',
 *   navigation: [
 *     {
 *       label: 'Sales', icon: TrendingUp,
 *       children: [
 *         { label: 'Orders', path: '/orders', icon: ShoppingBag },
 *         { label: 'Invoices', path: '/invoices', icon: Receipt },
 *       ]
 *     }
 *   ],
 *   routes: [
 *     { path: 'orders', children: ORDERS_ROUTES },
 *     { path: 'invoices', children: INVOICES_ROUTES },
 *   ]
 * };
 * ```
 */
export interface ModuleManifest {
  /** Unique identifier for this module (e.g. 'catalog', 'sales'). */
  readonly moduleId: string;

  /**
   * Sidebar navigation entries this module contributes.
   * Can be a single item, a group with children, or an array mixing both.
   */
  readonly navigation: readonly ModuleNavEntry[];

  /**
   * Route definitions this module contributes to the shell's dashboard layout.
   * Each entry maps a URL path segment to the module's internal routes.
   * The shell wraps these inside the dashboard shell component as children.
   */
  readonly routes: Routes;
}
