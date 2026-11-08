import { createAction, props } from '@ngrx/store';

import type { Product } from '../../models/product.entity';
import type { ProductDetailsTab } from './product-details.reducer';

/** State module for the product details page basics: `product` + `activeTab`. */
export const PRODUCT_DETAILS_ACTIONS = {
  /** Triggered when the page loads (the `:id` route param). */
  loadProduct: createAction('[Product Details] Load Product', props<{ productId: string }>()),

  /**
   * Background re-fetch of the same `:id` (e.g. after a batches mutation changed
   * the product aggregates). Keeps the loaded entity visible, unlike `loadProduct`.
   */
  refreshProduct: createAction('[Product Details] Refresh Product', props<{ productId: string }>()),

  loadProductSuccess: createAction(
    '[Product Details] Load Product Success',
    props<{ product: Product }>(),
  ),

  loadProductFailure: createAction(
    '[Product Details] Load Product Failure',
    props<{ error: unknown }>(),
  ),

  setActiveTab: createAction(
    '[Product Details] Set Active Tab',
    props<{ activeTab: ProductDetailsTab }>(),
  ),
} as const;
