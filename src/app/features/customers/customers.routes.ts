import { Routes } from '@angular/router';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/customers-page/customers-page.component').then((m) => m.CustomersPageComponent)
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/customer-form-page/customer-form-page.component').then(
            (m) => m.CustomerFormPageComponent
          ),
        data: { mode: 'create' }
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/customer-form-page/customer-form-page.component').then(
            (m) => m.CustomerFormPageComponent
          ),
        data: { mode: 'edit' }
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/customer-details-page/customer-details-page.component').then(
            (m) => m.CustomerDetailsPageComponent
          )
      }
    ]
  }
];

