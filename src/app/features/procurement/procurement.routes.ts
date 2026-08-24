import { Routes } from '@angular/router';

export const PROCUREMENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/purchase-list-page/purchase-list-page.component').then(
            (m) => m.PurchaseListPageComponent
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/purchase-order-form-page/purchase-order-form-page.component').then(
            (m) => m.PurchaseOrderFormPageComponent
          ),
        data: { mode: 'create' }
      },
      {
        path: 'reports/sales',
        loadComponent: () =>
          import('./pages/purchase-sales-report-page/purchase-sales-report-page.component').then(
            (m) => m.PurchaseSalesReportPageComponent
          )
      },
      {
        path: 'reports/sales/metrics',
        loadComponent: () =>
          import('./pages/purchase-sales-metrics-page/purchase-sales-metrics-page.component').then(
            (m) => m.PurchaseSalesMetricsPageComponent
          )
      },
      {
        path: 'reports/completion',
        loadComponent: () =>
          import('./pages/purchase-completion-report-page/purchase-completion-report-page.component').then(
            (m) => m.PurchaseCompletionReportPageComponent
          )
      },
      {
        path: 'reports/completion/metrics',
        loadComponent: () =>
          import('./pages/purchase-completion-metrics-page/purchase-completion-metrics-page.component').then(
            (m) => m.PurchaseCompletionMetricsPageComponent
          )
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/purchase-order-form-page/purchase-order-form-page.component').then(
            (m) => m.PurchaseOrderFormPageComponent
          ),
        data: { mode: 'edit' }
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/purchase-order-details-page/purchase-order-details-page.component').then(
            (m) => m.PurchaseOrderDetailsPageComponent
          )
      }
    ]
  }
];
