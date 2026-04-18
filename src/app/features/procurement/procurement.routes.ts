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
