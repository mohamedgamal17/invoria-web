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
