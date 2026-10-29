import { Routes } from '@angular/router';

export const PAYABLES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/payables-page/payables-page.component').then(
            (m) => m.PayablesPageComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/payable-details-page/payable-details-page.component').then(
            (m) => m.PayableDetailsPageComponent
          )
      }
    ]
  }
];
