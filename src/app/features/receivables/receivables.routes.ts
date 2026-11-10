import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import {
  RECEIVABLES_LIST_FEATURE_KEY,
  receivablesListReducer,
} from './store/receivables-list/receivables-list.reducer';
import { ReceivablesListEffects } from './store/receivables-list/receivables-list.effects';
import { ReceivablesListUrlEffects } from './store/receivables-list-url/receivables-list-url.effects';
import {
  RECEIVABLES_MUTATIONS_FEATURE_KEY,
  receivablesMutationsReducer,
} from './store/receivables-mutations/receivables-mutations.reducer';
import { ReceivablesMutationsEffects } from './store/receivables-mutations/receivables-mutations.effects';
import {
  RECEIVABLE_DETAILS_FEATURE_KEY,
  receivableDetailsReducer,
} from './store/receivable-details/receivable-details.reducer';
import { ReceivableDetailsEffects } from './store/receivable-details/receivable-details.effects';
import { ReceivableDetailsUrlEffects } from './store/receivable-details-url/receivable-details-url.effects';

const RECEIVABLES_LIST_PROVIDERS = [
  provideState(RECEIVABLES_LIST_FEATURE_KEY, receivablesListReducer),
  provideEffects(ReceivablesListEffects, ReceivablesListUrlEffects),
];

const RECEIVABLES_MUTATIONS_PROVIDERS = [
  provideState(RECEIVABLES_MUTATIONS_FEATURE_KEY, receivablesMutationsReducer),
  provideEffects(ReceivablesMutationsEffects),
];

const RECEIVABLE_DETAILS_PROVIDERS = [
  provideState(RECEIVABLE_DETAILS_FEATURE_KEY, receivableDetailsReducer),
  provideEffects(ReceivableDetailsEffects, ReceivableDetailsUrlEffects),
];

export const RECEIVABLES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/receivables-page/receivables-page.component').then(
            (module) => module.ReceivablesPageComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/receivable-details-page/receivable-details-page.component').then(
            (module) => module.ReceivableDetailsPageComponent,
          ),
        providers: RECEIVABLE_DETAILS_PROVIDERS,
      },
    ],
    // List + mutation slices live on the shell so they survive details
    // navigation: the settle mutation folds its result into the loaded list
    // (receivableUpdated) without refetching, and the list keeps its page data.
    providers: [...RECEIVABLES_LIST_PROVIDERS, ...RECEIVABLES_MUTATIONS_PROVIDERS],
  },
];
