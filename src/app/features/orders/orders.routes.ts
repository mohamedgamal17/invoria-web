import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import {
  ORDERS_LIST_FEATURE_KEY,
  ordersListReducer,
} from './store/orders-list/orders-list.reducer';
import { OrdersListEffects } from './store/orders-list/orders-list.effects';
import { OrdersListUrlEffects } from './store/orders-list-url/orders-list-url.effects';

const ORDERS_LIST_PROVIDERS = [
  provideState(ORDERS_LIST_FEATURE_KEY, ordersListReducer),
  provideEffects(OrdersListEffects, OrdersListUrlEffects),
];

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    // List slice lives on the shell so it survives form/details navigation:
    // the form/details mutation dispatches fold into the local list sync
    // (orderCreated/orderAccepted/.../orderUpdated) without a refetch.
    providers: [...ORDERS_LIST_PROVIDERS],
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
