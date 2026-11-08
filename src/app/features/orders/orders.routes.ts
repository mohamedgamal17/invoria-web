import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orders-shell-page/orders-shell-page.component').then(
        (module) => module.OrdersShellPageComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/orders-page/orders-page.component').then(
            (module) => module.OrdersPageComponent
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/order-form-page/order-form-page.component').then(
            (module) => module.OrderFormPageComponent
          ),
        data: { mode: 'create' }
      },
      {
        path: 'reports/sales',
        loadComponent: () =>
          import('./pages/order-sales-report-page/order-sales-report-page.component').then(
            (module) => module.OrderSalesReportPageComponent
          )
      },
      {
        path: 'reports/sales/metrics',
        loadComponent: () =>
          import('./pages/order-sales-metrics-page/order-sales-metrics-page.component').then(
            (module) => module.OrderSalesMetricsPageComponent
          )
      },
      {
        path: 'reports/profit',
        loadComponent: () =>
          import('./pages/order-profit-report-page/order-profit-report-page.component').then(
            (module) => module.OrderProfitReportPageComponent
          )
      },
      {
        path: 'reports/profit/metrics',
        loadComponent: () =>
          import('./pages/order-profit-metrics-page/order-profit-metrics-page.component').then(
            (module) => module.OrderProfitMetricsPageComponent
          )
      },
      {
        path: ':id',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/order-details-page/order-details-page.component').then(
            (module) => module.OrderDetailsPageComponent
          )
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/order-form-page/order-form-page.component').then(
            (module) => module.OrderFormPageComponent
          ),
        data: { mode: 'edit' }
      }
    ]
  }
];
