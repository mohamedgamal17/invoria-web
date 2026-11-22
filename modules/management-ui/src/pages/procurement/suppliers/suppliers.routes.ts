import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import {
  SUPPLIERS_LIST_FEATURE_KEY,
  suppliersListReducer,
} from '@invoria/procurement/suppliers/store/suppliers-list/suppliers-list.reducer';
import { SuppliersListEffects } from '@invoria/procurement/suppliers/store/suppliers-list/suppliers-list.effects';
import { SuppliersListUrlEffects } from '@invoria/procurement/suppliers/store/suppliers-list-url/suppliers-list-url.effects';
import {
  SUPPLIER_MUTATIONS_FEATURE_KEY,
  supplierMutationsReducer,
} from '@invoria/procurement/suppliers/store/supplier-mutations/supplier-mutations.reducer';
import { SupplierMutationsEffects } from '@invoria/procurement/suppliers/store/supplier-mutations/supplier-mutations.effects';
import {
  SUPPLIER_DETAILS_FEATURE_KEY,
  supplierDetailsReducer,
} from '@invoria/procurement/suppliers/store/supplier-details/supplier-details.reducer';
import { SupplierDetailsEffects } from '@invoria/procurement/suppliers/store/supplier-details/supplier-details.effects';
import {
  SUPPLIER_PURCHASE_ORDERS_FEATURE_KEY,
  supplierPurchaseOrdersReducer,
} from '@invoria/procurement/suppliers/store/supplier-details-purchase-orders/supplier-details-purchase-orders.reducer';
import { SupplierPurchaseOrdersEffects } from '@invoria/procurement/suppliers/store/supplier-details-purchase-orders/supplier-details-purchase-orders.effects';
import { SupplierDetailsUrlEffects } from '@invoria/procurement/suppliers/store/supplier-details-url/supplier-details-url.effects';

const SUPPLIERS_LIST_PROVIDERS = [
  provideState(SUPPLIERS_LIST_FEATURE_KEY, suppliersListReducer),
  provideEffects(SuppliersListEffects, SuppliersListUrlEffects),
];

const SUPPLIER_MUTATIONS_PROVIDERS = [
  provideState(SUPPLIER_MUTATIONS_FEATURE_KEY, supplierMutationsReducer),
  provideEffects(SupplierMutationsEffects),
];

const SUPPLIER_DETAILS_PROVIDERS = [
  provideState(SUPPLIER_DETAILS_FEATURE_KEY, supplierDetailsReducer),
  provideState(SUPPLIER_PURCHASE_ORDERS_FEATURE_KEY, supplierPurchaseOrdersReducer),
  provideEffects(SupplierDetailsEffects, SupplierPurchaseOrdersEffects, SupplierDetailsUrlEffects),
];

export const SUPPLIERS_ROUTES: Routes = [
  {
    path: '',
    // List + mutation slices live on the parent route so they survive
    // form/details navigation: the mutation effects receive form submissions
    // and fire the local-create/update sync (supplierCreated/supplierUpdated)
    // into the list.
    providers: [...SUPPLIERS_LIST_PROVIDERS, ...SUPPLIER_MUTATIONS_PROVIDERS],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./suppliers-page/suppliers-page.component').then(
            (module) => module.SuppliersPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./supplier-form-page/supplier-form-page.component').then(
            (module) => module.SupplierFormPageComponent,
          ),
        data: { mode: 'create' },
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./supplier-form-page/supplier-form-page.component').then(
            (module) => module.SupplierFormPageComponent,
          ),
        data: { mode: 'edit' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./supplier-details-page/supplier-details-page.component').then(
            (module) => module.SupplierDetailsPageComponent,
          ),
        providers: SUPPLIER_DETAILS_PROVIDERS,
      },
    ],
  },
];
