import { Routes } from '@angular/router';

export const MANAGEMENT_UI_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/dashboard-shell/dashboard-shell.component').then(
        (module) => module.DashboardShellComponent,
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.routes').then((module) => module.DASHBOARD_ROUTES),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./pages/catalog/products.routes').then((module) => module.PRODUCTS_ROUTES),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./pages/sales/orders/orders.routes').then((module) => module.ORDERS_ROUTES),
      },
      {
        path: 'returns',
        loadChildren: () =>
          import('./pages/sales/returns/returns.routes').then((module) => module.RETURNS_ROUTES),
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('./pages/sales/invoices/invoices.routes').then((module) => module.INVOICES_ROUTES),
      },
      {
        path: 'procurement',
        loadChildren: () =>
          import('./pages/procurement/purchase-orders/procurement.routes').then(
            (module) => module.PROCUREMENT_ROUTES,
          ),
      },
      {
        path: 'suppliers',
        loadChildren: () =>
          import('./pages/procurement/suppliers/suppliers.routes').then(
            (module) => module.SUPPLIERS_ROUTES,
          ),
      },
      {
        path: 'receivables',
        loadChildren: () =>
          import('./pages/financial/receivables/receivables.routes').then(
            (module) => module.RECEIVABLES_ROUTES,
          ),
      },
      {
        path: 'payables',
        loadChildren: () =>
          import('./pages/financial/payables/payables.routes').then(
            (module) => module.PAYABLES_ROUTES,
          ),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./pages/customers/customers.routes').then((module) => module.CUSTOMERS_ROUTES),
      },
    ],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/error-pages/not-found-page/not-found-page.component').then(
        (module) => module.NotFoundPageComponent,
      ),
  },
  {
    path: 'internal-error',
    loadComponent: () =>
      import('./pages/error-pages/internal-error-page/internal-error-page.component').then(
        (module) => module.InternalErrorPageComponent,
      ),
  },
  {
    path: 'service-unavailable',
    loadComponent: () =>
      import('./pages/error-pages/service-unavailable-page/service-unavailable-page.component').then(
        (module) => module.ServiceUnavailablePageComponent,
      ),
  },
  { path: '**', redirectTo: 'not-found' },
];
