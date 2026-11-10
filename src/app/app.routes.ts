import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/dashboard-shell/dashboard-shell.component').then(
        (module) => module.DashboardShellComponent
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (module) => module.DASHBOARD_ROUTES
          )
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.routes').then((module) => module.ORDERS_ROUTES)
      },
      {
        path: 'suppliers',
        loadChildren: () =>
          import('./features/suppliers/suppliers.routes').then((module) => module.SUPPLIERS_ROUTES)
      },
      {
        path: 'procurement',
        loadChildren: () =>
          import('./features/procurement/procurement.routes').then(
            (module) => module.PROCUREMENT_ROUTES
          )
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customers/customers.routes').then((module) => module.CUSTOMERS_ROUTES)
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then((module) => module.PRODUCTS_ROUTES)
      },
      {
        path: 'returns',
        loadChildren: () =>
          import('./features/returns/returns.routes').then((module) => module.RETURNS_ROUTES)
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('./features/invoices/invoices.routes').then((module) => module.INVOICES_ROUTES)
      },
      {
        path: 'receivables',
        loadChildren: () =>
          import('./features/receivables/receivables.routes').then(
            (module) => module.RECEIVABLES_ROUTES
          )
      },
      {
        path: 'payables',
        loadChildren: () =>
          import('./features/payables/payables.routes').then((module) => module.PAYABLES_ROUTES)
      }
    ]
  },
  { path: 'not-found', loadComponent: () => import('./features/error-pages/pages/not-found-page/not-found-page.component').then((module) => module.NotFoundPageComponent) },
  { path: 'internal-error', loadComponent: () => import('./features/error-pages/pages/internal-error-page/internal-error-page.component').then((module) => module.InternalErrorPageComponent) },
  { path: 'service-unavailable', loadComponent: () => import('./features/error-pages/pages/service-unavailable-page/service-unavailable-page.component').then((module) => module.ServiceUnavailablePageComponent) },
  { path: '**', redirectTo: 'not-found' }
];
