import { Routes } from '@angular/router';

export const RETURNS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./returns-page/returns-page.component').then(
            (module) => module.ReturnsPageComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./return-details-page/return-details-page.component').then(
            (module) => module.ReturnDetailsPageComponent,
          ),
      },
    ],
  },
];
