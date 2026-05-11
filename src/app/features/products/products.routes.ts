import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router, type Routes } from '@angular/router';

/** Legacy `/products/:id/batches` → `/products/:id?tab=batches` (+ optional page / pageSize). */
export const redirectProductBatchesToDetailsTab: CanActivateFn = (route) => {
  const router = inject(Router);
  const id = route.paramMap.get('id');
  const page = route.queryParamMap.get('page');
  const pageSize = route.queryParamMap.get('pageSize');

  const queryParams: Record<string, string> = { tab: 'batches' };
  if (page) {
    queryParams['page'] = page;
  }
  if (pageSize) {
    queryParams['pageSize'] = pageSize;
  }

  if (!id) {
    return router.createUrlTree(['/dashboard', 'products']);
  }

  return router.createUrlTree(['/dashboard', 'products', id], { queryParams });
};

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products-shell-page/products-shell-page.component').then(
        (m) => m.ProductsShellPageComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/products-page/products-page.component').then(
            (m) => m.ProductsPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/product-form-page/product-form-page.component').then(
            (m) => m.ProductFormPageComponent,
          ),
        data: { mode: 'create' },
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/product-form-page/product-form-page.component').then(
            (m) => m.ProductFormPageComponent,
          ),
        data: { mode: 'edit' },
      },
      {
        path: ':id/batches',
        canActivate: [redirectProductBatchesToDetailsTab],
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/product-details-page/product-details-page.component').then(
            (m) => m.ProductDetailsPageComponent,
          ),
      },
    ],
  },
];
