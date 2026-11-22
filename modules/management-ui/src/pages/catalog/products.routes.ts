import { inject } from '@angular/core';
import { Router, type RedirectFunction, type Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import {
  PRODUCTS_LIST_FEATURE_KEY,
  productsListReducer,
} from '@invoria/catalog/store/products-list/products-list.reducer';
import { ProductsListEffects } from '@invoria/catalog/store/products-list/products-list.effects';
import { ProductsListUrlEffects } from '@invoria/catalog/store/products-list-url/products-list-url.effects';
import {
  PRODUCTS_MUTATIONS_FEATURE_KEY,
  productsMutationsReducer,
} from '@invoria/catalog/store/products-mutations/products-mutations.reducer';
import { ProductsMutationsEffects } from '@invoria/catalog/store/products-mutations/products-mutations.effects';
import {
  PRODUCT_DETAILS_FEATURE_KEY,
  productDetailsReducer,
} from '@invoria/catalog/store/product-details/product-details.reducer';
import { ProductDetailsEffects } from '@invoria/catalog/store/product-details/product-details.effects';
import {
  PRODUCT_BATCHES_FEATURE_KEY,
  productBatchesReducer,
} from '@invoria/catalog/store/product-details-batches/product-details-batches.reducer';
import { ProductBatchesEffects } from '@invoria/catalog/store/product-details-batches/product-details-batches.effects';
import {
  PRODUCT_ORDERS_FEATURE_KEY,
  productOrdersReducer,
} from '@invoria/catalog/store/product-details-orders/product-details-orders.reducer';
import { ProductOrdersEffects } from '@invoria/catalog/store/product-details-orders/product-details-orders.effects';
import { ProductDetailsUrlEffects } from '@invoria/catalog/store/product-details-url/product-details-url.effects';

const PRODUCTS_LIST_PROVIDERS = [
  provideState(PRODUCTS_LIST_FEATURE_KEY, productsListReducer),
  provideEffects(ProductsListEffects, ProductsListUrlEffects),
];

const PRODUCTS_MUTATIONS_PROVIDERS = [
  provideState(PRODUCTS_MUTATIONS_FEATURE_KEY, productsMutationsReducer),
  provideEffects(ProductsMutationsEffects),
];

const PRODUCT_DETAILS_PROVIDERS = [
  provideState(PRODUCT_DETAILS_FEATURE_KEY, productDetailsReducer),
  provideState(PRODUCT_BATCHES_FEATURE_KEY, productBatchesReducer),
  provideState(PRODUCT_ORDERS_FEATURE_KEY, productOrdersReducer),
  provideEffects(
    ProductDetailsEffects,
    ProductBatchesEffects,
    ProductOrdersEffects,
    ProductDetailsUrlEffects,
  ),
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
      import('./products-shell-page/products-shell-page.component').then(
        (module) => module.ProductsShellPageComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./products-page/products-page.component').then(
            (module) => module.ProductsPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./product-form-page/product-form-page.component').then(
            (module) => module.ProductFormPageComponent,
          ),
        data: { mode: 'create' },
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./product-form-page/product-form-page.component').then(
            (module) => module.ProductFormPageComponent,
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
          import('./product-details-page/product-details-page.component').then(
            (module) => module.ProductDetailsPageComponent,
          ),
        providers: PRODUCT_DETAILS_PROVIDERS,
      },
    ],
  },
];
