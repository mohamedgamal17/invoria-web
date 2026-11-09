import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import {
  PURCHASE_ORDERS_LIST_FEATURE_KEY,
  purchaseOrdersListReducer,
} from './store/purchase-orders-list/purchase-orders-list.reducer';
import { PurchaseOrdersListEffects } from './store/purchase-orders-list/purchase-orders-list.effects';
import { PurchaseOrdersListUrlEffects } from './store/purchase-orders-list-url/purchase-orders-list-url.effects';
import {
  PURCHASE_ORDERS_MUTATIONS_FEATURE_KEY,
  purchaseOrdersMutationsReducer,
} from './store/purchase-orders-mutations/purchase-orders-mutations.reducer';
import { PurchaseOrdersMutationsEffects } from './store/purchase-orders-mutations/purchase-orders-mutations.effects';
import {
  PURCHASE_ORDER_DETAILS_FEATURE_KEY,
  purchaseOrderDetailsReducer,
} from './store/purchase-order-details/purchase-order-details.reducer';
import { PurchaseOrderDetailsEffects } from './store/purchase-order-details/purchase-order-details.effects';
import { PurchaseOrderDetailsUrlEffects } from './store/purchase-order-details-url/purchase-order-details-url.effects';

const PURCHASE_ORDERS_LIST_PROVIDERS = [
  provideState(PURCHASE_ORDERS_LIST_FEATURE_KEY, purchaseOrdersListReducer),
  provideEffects(PurchaseOrdersListEffects, PurchaseOrdersListUrlEffects),
];

const PURCHASE_ORDERS_MUTATIONS_PROVIDERS = [
  provideState(PURCHASE_ORDERS_MUTATIONS_FEATURE_KEY, purchaseOrdersMutationsReducer),
  provideEffects(PurchaseOrdersMutationsEffects),
];

const PURCHASE_ORDER_DETAILS_PROVIDERS = [
  provideState(PURCHASE_ORDER_DETAILS_FEATURE_KEY, purchaseOrderDetailsReducer),
  provideEffects(PurchaseOrderDetailsEffects, PurchaseOrderDetailsUrlEffects),
];

export const PROCUREMENT_ROUTES: Routes = [
  {
    path: '',
    // List + mutation slices live on the parent route so they survive
    // form/details navigation: the mutation effects funnel transition
    // successes into the list local-sync (purchaseOrderUpdated) without a refetch.
    providers: [...PURCHASE_ORDERS_LIST_PROVIDERS, ...PURCHASE_ORDERS_MUTATIONS_PROVIDERS],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/purchase-list-page/purchase-list-page.component').then(
            (module) => module.PurchaseListPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/purchase-order-form-page/purchase-order-form-page.component').then(
            (module) => module.PurchaseOrderFormPageComponent,
          ),
        data: { mode: 'create' },
      },
      {
        path: 'reports/sales',
        loadComponent: () =>
          import('./pages/purchase-sales-report-page/purchase-sales-report-page.component').then(
            (module) => module.PurchaseSalesReportPageComponent,
          ),
      },
      {
        path: 'reports/sales/metrics',
        loadComponent: () =>
          import('./pages/purchase-sales-metrics-page/purchase-sales-metrics-page.component').then(
            (module) => module.PurchaseSalesMetricsPageComponent,
          ),
      },
      {
        path: 'reports/completion',
        loadComponent: () =>
          import('./pages/purchase-completion-report-page/purchase-completion-report-page.component').then(
            (module) => module.PurchaseCompletionReportPageComponent,
          ),
      },
      {
        path: 'reports/completion/metrics',
        loadComponent: () =>
          import('./pages/purchase-completion-metrics-page/purchase-completion-metrics-page.component').then(
            (module) => module.PurchaseCompletionMetricsPageComponent,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/purchase-order-form-page/purchase-order-form-page.component').then(
            (module) => module.PurchaseOrderFormPageComponent,
          ),
        data: { mode: 'edit' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/purchase-order-details-page/purchase-order-details-page.component').then(
            (module) => module.PurchaseOrderDetailsPageComponent,
          ),
        providers: PURCHASE_ORDER_DETAILS_PROVIDERS,
      },
    ],
  },
];
