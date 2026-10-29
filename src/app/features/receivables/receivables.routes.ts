import { Routes } from '@angular/router';

export const RECEIVABLES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/receivables-page/receivables-page.component').then(
            (m) => m.ReceivablesPageComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/receivable-details-page/receivable-details-page.component').then(
            (m) => m.ReceivableDetailsPageComponent
          )
      }
    ]
  }
];
