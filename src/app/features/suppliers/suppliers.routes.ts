import { Routes } from '@angular/router';

export const SUPPLIERS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/suppliers-page/suppliers-page.component').then((module) => module.SuppliersPageComponent)
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/supplier-form-page/supplier-form-page.component').then(
            (module) => module.SupplierFormPageComponent
          ),
        data: { mode: 'create' }
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/supplier-form-page/supplier-form-page.component').then(
            (module) => module.SupplierFormPageComponent
          ),
        data: { mode: 'edit' }
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/supplier-details-page/supplier-details-page.component').then(
            (module) => module.SupplierDetailsPageComponent
          )
      }
    ]
  }
];
