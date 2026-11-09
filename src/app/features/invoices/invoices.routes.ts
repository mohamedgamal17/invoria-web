import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import {
  INVOICES_LIST_FEATURE_KEY,
  invoicesListReducer,
} from './store/invoices-list/invoices-list.reducer';
import { InvoicesListEffects } from './store/invoices-list/invoices-list.effects';
import { InvoicesListUrlEffects } from './store/invoices-list-url/invoices-list-url.effects';
import {
  INVOICE_DETAILS_FEATURE_KEY,
  invoiceDetailsReducer,
} from './store/invoice-details/invoice-details.reducer';
import { InvoiceDetailsEffects } from './store/invoice-details/invoice-details.effects';
import { InvoiceDetailsUrlEffects } from './store/invoice-details-url/invoice-details-url.effects';

const INVOICES_LIST_PROVIDERS = [
  provideState(INVOICES_LIST_FEATURE_KEY, invoicesListReducer),
  provideEffects(InvoicesListEffects, InvoicesListUrlEffects),
];

const INVOICE_DETAILS_PROVIDERS = [
  provideState(INVOICE_DETAILS_FEATURE_KEY, invoiceDetailsReducer),
  provideEffects(InvoiceDetailsEffects, InvoiceDetailsUrlEffects),
];

export const INVOICES_ROUTES: Routes = [
  {
    path: '',
    // List slice lives on the shell so it survives details navigation without
    // a refetch when returning from `/invoices/:id`.
    providers: [...INVOICES_LIST_PROVIDERS],
    loadComponent: () =>
      import('./pages/invoices-shell-page/invoices-shell-page.component').then(
        (module) => module.InvoicesShellPageComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/invoices-page/invoices-page.component').then(
            (module) => module.InvoicesPageComponent
          )
      },
      {
        path: ':id',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/invoice-details-page/invoice-details-page.component').then(
            (module) => module.InvoiceDetailsPageComponent
          ),
        // Details slice is scoped to the page so it resets when the page unmounts,
        // in line with the `order-details` registration.
        providers: [...INVOICE_DETAILS_PROVIDERS]
      }
    ]
  }
];
