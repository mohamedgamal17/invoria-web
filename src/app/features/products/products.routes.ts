import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products-shell-page/products-shell-page.component').then(
        (m) => m.ProductsShellPageComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/products-page/products-page.component').then((m) => m.ProductsPageComponent)
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/product-form-page/product-form-page.component').then(
            (m) => m.ProductFormPageComponent
          ),
        data: { mode: 'create' }
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/product-form-page/product-form-page.component').then(
            (m) => m.ProductFormPageComponent
          ),
        data: { mode: 'edit' }
      },
      {
        path: ':id/batches',
        loadComponent: () =>
          import('./pages/product-batches-page/product-batches-page.component').then(
            (m) => m.ProductBatchesPageComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/product-details-page/product-details-page.component').then(
            (m) => m.ProductDetailsPageComponent
          )
      }
    ]
  }
];
