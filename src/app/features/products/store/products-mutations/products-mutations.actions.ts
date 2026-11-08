import { createAction, props } from '@ngrx/store';

import type { CreateProductRequest } from '../../models/create-product.request';
import type { Product } from '../../models/product.entity';
import type { UpdateProductRequest } from '../../models/update-product.request';

/**
 * State module for the product form page: store-owned create/update mutations.
 * Success actions funnel into `PRODUCTS_LIST_ACTIONS.productCreated` /
 * `productUpdated` (see `products-mutations.effects`) so the loaded list page
 * syncs silently without refetching.
 */
export const PRODUCT_MUTATIONS_ACTIONS = {
  /** Form submit: start a create request; the body is already validated by the form. */
  createProduct: createAction(
    '[Products] Create Product',
    props<{ request: CreateProductRequest }>(),
  ),

  createProductSuccess: createAction(
    '[Products] Create Product Success',
    props<{ product: Product }>(),
  ),

  createProductFailure: createAction(
    '[Products] Create Product Failure',
    props<{ error: unknown }>(),
  ),

  /** Form submit: start an update request for the edited product. */
  updateProduct: createAction(
    '[Products] Update Product',
    props<{ id: string; request: UpdateProductRequest }>(),
  ),

  updateProductSuccess: createAction(
    '[Products] Update Product Success',
    props<{ product: Product }>(),
  ),

  updateProductFailure: createAction(
    '[Products] Update Product Failure',
    props<{ error: unknown }>(),
  ),

  /** Details-page confirmation dialog accepted: start a delete request. */
  deleteProduct: createAction('[Products] Delete Product', props<{ id: string }>()),

  deleteProductSuccess: createAction('[Products] Delete Product Success', props<{ id: string }>()),

  deleteProductFailure: createAction(
    '[Products] Delete Product Failure',
    props<{ error: unknown }>(),
  ),
} as const;
