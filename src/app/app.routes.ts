import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./layout/dashboard-shell/dashboard-shell.component').then(
        (m) => m.DashboardShellComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import(
            './features/dashboard/pages/dashboard-page/dashboard-page.component'
          ).then((m) => m.DashboardPageComponent)
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/pages/inventory-page/inventory-page.component').then(
            (m) => m.InventoryPageComponent
          )
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES)
      },
      {
        path: 'suppliers',
        loadChildren: () =>
          import('./features/suppliers/suppliers.routes').then((m) => m.SUPPLIERS_ROUTES)
      },
      {
        path: 'procurement',
        loadChildren: () =>
          import('./features/procurement/procurement.routes').then((m) => m.PROCUREMENT_ROUTES)
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customers/customers.routes').then((m) => m.CUSTOMERS_ROUTES)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/pages/reports-page/reports-page.component').then(
            (m) => m.ReportsPageComponent
          )
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/pages/settings-page/settings-page.component').then(
            (m) => m.SettingsPageComponent
          )
      }
    ]
  },
  { path: 'not-found', loadComponent: () => import('./features/error-pages/pages/not-found-page/not-found-page.component').then((m) => m.NotFoundPageComponent) },
  { path: 'internal-error', loadComponent: () => import('./features/error-pages/pages/internal-error-page/internal-error-page.component').then((m) => m.InternalErrorPageComponent) },
  { path: 'service-unavailable', loadComponent: () => import('./features/error-pages/pages/service-unavailable-page/service-unavailable-page.component').then((m) => m.ServiceUnavailablePageComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'not-found' }
];
