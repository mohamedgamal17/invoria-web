import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@invoria/management-ui').then((module) => module.MANAGEMENT_UI_ROUTES),
  },
];
