import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import {
  PAYABLES_LIST_FEATURE_KEY,
  payablesListReducer,
} from './store/payables-list/payables-list.reducer';
import { PayablesListEffects } from './store/payables-list/payables-list.effects';
import { PayablesListUrlEffects } from './store/payables-list-url/payables-list-url.effects';
import {
  PAYABLES_MUTATIONS_FEATURE_KEY,
  payablesMutationsReducer,
} from './store/payables-mutations/payables-mutations.reducer';
import { PayablesMutationsEffects } from './store/payables-mutations/payables-mutations.effects';
import {
  PAYABLE_DETAILS_FEATURE_KEY,
  payableDetailsReducer,
} from './store/payable-details/payable-details.reducer';
import { PayableDetailsEffects } from './store/payable-details/payable-details.effects';
import { PayableDetailsUrlEffects } from './store/payable-details-url/payable-details-url.effects';

const PAYABLES_LIST_PROVIDERS = [
  provideState(PAYABLES_LIST_FEATURE_KEY, payablesListReducer),
  provideEffects(PayablesListEffects, PayablesListUrlEffects),
];

const PAYABLES_MUTATIONS_PROVIDERS = [
  provideState(PAYABLES_MUTATIONS_FEATURE_KEY, payablesMutationsReducer),
  provideEffects(PayablesMutationsEffects),
];

const PAYABLE_DETAILS_PROVIDERS = [
  provideState(PAYABLE_DETAILS_FEATURE_KEY, payableDetailsReducer),
  provideEffects(PayableDetailsEffects, PayableDetailsUrlEffects),
];

export const PAYABLES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/payables-page/payables-page.component').then(
            (module) => module.PayablesPageComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/payable-details-page/payable-details-page.component').then(
            (module) => module.PayableDetailsPageComponent
          ),
        providers: PAYABLE_DETAILS_PROVIDERS
      }
    ],
    // List + mutation slices live on the shell so they survive details
    // navigation: the settle mutation folds its result into the loaded list
    // (payableUpdated) without refetching, and the list keeps its page data.
    providers: [...PAYABLES_LIST_PROVIDERS, ...PAYABLES_MUTATIONS_PROVIDERS]
  }
];
