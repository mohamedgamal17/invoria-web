import { inject } from '@angular/core';
import { Router, type RedirectFunction, type Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import {
  PRODUCTS_LIST_FEATURE_KEY,
  productsListReducer,
} from './store/products-list/products-list.reducer';
import { ProductsListEffects } from './store/products-list/products-list.effects';
import { ProductsListUrlEffects } from './store/products-list-url/products-list-url.effects';
import {
  PRODUCTS_MUTATIONS_FEATURE_KEY,
  productsMutationsReducer,
} from './store/products-mutations/products-mutations.reducer';
import { ProductsMutationsEffects } from './store/products-mutations/products-mutations.effects';

const PRODUCTS_LIST_PROVIDERS = [
  provideState(PRODUCTS_LIST_FEATURE_KEY, productsListReducer),
  provideEffects(ProductsListEffects, ProductsListUrlEffects),
];

const PRODUCTS_MUTATIONS_PROVIDERS = [
  provideState(PRODUCTS_MUTATIONS_FEATURE_KEY, productsMutationsReducer),
  provideEffects(ProductsMutationsEffects),
];

/** Legacy `/products/:id/batches` → `/products/:id?tab=batches` (+ optional page / pageSize). */
export const redirectProductBatchesToDetailsTab: RedirectFunction = (route) => {
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
    return router.createUrlTree(['/products']);
  }

  return router.createUrlTree(['/products', id], { queryParams });
};

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    // List + mutation slices live on the shell so they survive form/details
    // navigation: the mutation effects receive form submissions and fire the
    // local-create/update sync (productCreated/productUpdated) into the list.
    providers: [...PRODUCTS_LIST_PROVIDERS, ...PRODUCTS_MUTATIONS_PROVIDERS],
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
        redirectTo: redirectProductBatchesToDetailsTab,
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
