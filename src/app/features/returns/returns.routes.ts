import { Routes } from '@angular/router';

export const RETURNS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/returns-page/returns-page.component').then((m) => m.ReturnsPageComponent)
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/return-details-page/return-details-page.component').then(
            (m) => m.ReturnDetailsPageComponent
          )
      }
    ]
  }
];
