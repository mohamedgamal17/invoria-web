import { createAction, props } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import type { Product } from '../../models/product.entity';

/**
 * State module for the products list page:
 * URL-backed paging + name filter, and the current API page of products.
 */
export const PRODUCTS_LIST_ACTIONS = {
  /** Paging/filter values observed from the list-route query (`page` 1-based / `pageSize` / `name`); always concrete values. */
  setQueryFromUrl: createAction(
    '[Products List] Set Query From Url',
    props<{ pageIndex: number; pageSize: number; nameFilter: string }>(),
  ),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadProducts: createAction('[Products List] Load Products'),

  loadProductsSuccess: createAction(
    '[Products List] Load Products Success',
    props<{ products: Product[]; info: PagingInfo }>(),
  ),

  loadProductsFailure: createAction(
    '[Products List] Load Products Failure',
    props<{ error: unknown }>(),
  ),

  /** Local sync: a product was created via the API (form page); prepend silently, no refetch. */
  productCreated: createAction('[Products List] Product Created', props<{ product: Product }>()),

  /** Local sync: a product was updated via the API (form page); replace in place if present. */
  productUpdated: createAction('[Products List] Product Updated', props<{ product: Product }>()),
} as const;
