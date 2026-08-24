import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orders-shell-page/orders-shell-page.component').then(
        (m) => m.OrdersShellPageComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/orders-page/orders-page.component').then((m) => m.OrdersPageComponent)
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/order-form-page/order-form-page.component').then(
            (m) => m.OrderFormPageComponent
          ),
        data: { mode: 'create' }
      },
      {
        path: 'reports/sales',
        loadComponent: () =>
          import('./pages/order-sales-report-page/order-sales-report-page.component').then(
            (m) => m.OrderSalesReportPageComponent
          )
      },
      {
        path: 'reports/sales/metrics',
        loadComponent: () =>
          import('./pages/order-sales-metrics-page/order-sales-metrics-page.component').then(
            (m) => m.OrderSalesMetricsPageComponent
          )
      },
      {
        path: 'reports/profit',
        loadComponent: () =>
          import('./pages/order-profit-report-page/order-profit-report-page.component').then(
            (m) => m.OrderProfitReportPageComponent
          )
      },
      {
        path: 'reports/profit/metrics',
        loadComponent: () =>
          import('./pages/order-profit-metrics-page/order-profit-metrics-page.component').then(
            (m) => m.OrderProfitMetricsPageComponent
          )
      },
      {
        path: ':id',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/order-details-page/order-details-page.component').then(
            (m) => m.OrderDetailsPageComponent
          )
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/order-form-page/order-form-page.component').then(
            (m) => m.OrderFormPageComponent
          ),
        data: { mode: 'edit' }
      }
    ]
  }
];
