import { Routes } from '@angular/router';

export const INVOICES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/invoices-page/invoices-page.component').then((m) => m.InvoicesPageComponent)
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/invoice-details-page/invoice-details-page.component').then(
            (m) => m.InvoiceDetailsPageComponent
          )
      }
    ]
  }
];
