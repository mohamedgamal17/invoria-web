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
            (module) => module.ReceivablesPageComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/receivable-details-page/receivable-details-page.component').then(
            (module) => module.ReceivableDetailsPageComponent
          )
      }
    ]
  }
];
