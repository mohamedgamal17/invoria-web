import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import {
  CUSTOMER_DETAILS_FEATURE_KEY,
  customerDetailsReducer,
} from './store/customer-details/customer-details.reducer';
import { CustomerDetailsEffects } from './store/customer-details/customer-details.effects';
import {
  CUSTOMER_ORDERS_FEATURE_KEY,
  customerOrdersReducer,
} from './store/customer-details-orders/customer-details-orders.reducer';
import { CustomerOrdersEffects } from './store/customer-details-orders/customer-details-orders.effects';
import { CustomerDetailsUrlEffects } from './store/customer-details-url/customer-details-url.effects';
import {
  CUSTOMERS_LIST_FEATURE_KEY,
  customersListReducer,
} from './store/customers-list/customers-list.reducer';
import { CustomersListEffects } from './store/customers-list/customers-list.effects';
import { CustomersListUrlEffects } from './store/customers-list-url/customers-list-url.effects';
import {
  CUSTOMER_MUTATIONS_FEATURE_KEY,
  customerMutationsReducer,
} from './store/customer-mutations/customer-mutations.reducer';
import { CustomerMutationsEffects } from './store/customer-mutations/customer-mutations.effects';

const CUSTOMERS_LIST_PROVIDERS = [
  provideState(CUSTOMERS_LIST_FEATURE_KEY, customersListReducer),
  provideEffects(CustomersListEffects, CustomersListUrlEffects),
];

const CUSTOMER_MUTATIONS_PROVIDERS = [
  provideState(CUSTOMER_MUTATIONS_FEATURE_KEY, customerMutationsReducer),
  provideEffects(CustomerMutationsEffects),
];

const CUSTOMER_DETAILS_PROVIDERS = [
  provideState(CUSTOMER_DETAILS_FEATURE_KEY, customerDetailsReducer),
  provideState(CUSTOMER_ORDERS_FEATURE_KEY, customerOrdersReducer),
  provideEffects(CustomerDetailsEffects, CustomerOrdersEffects, CustomerDetailsUrlEffects),
];

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    // List + mutation slices live on the parent route so they survive
    // form/details navigation: the mutation effects receive form submissions
    // and fire the local-create/update sync (customerCreated/customerUpdated)
    // into the list.
    providers: [...CUSTOMERS_LIST_PROVIDERS, ...CUSTOMER_MUTATIONS_PROVIDERS],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/customers-page/customers-page.component').then(
            (m) => m.CustomersPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/customer-form-page/customer-form-page.component').then(
            (m) => m.CustomerFormPageComponent,
          ),
        data: { mode: 'create' },
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/customer-form-page/customer-form-page.component').then(
            (m) => m.CustomerFormPageComponent,
          ),
        data: { mode: 'edit' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/customer-details-page/customer-details-page.component').then(
            (m) => m.CustomerDetailsPageComponent,
          ),
        providers: CUSTOMER_DETAILS_PROVIDERS,
      },
    ],
  },
];
