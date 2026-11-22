import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '@invoria/utils';
import { productDetailsFeature } from '../product-details/product-details.reducer';
import { productDetailsSelectors } from '../product-details/product-details.selectors';
import { productOrdersFeature } from './product-details-orders.reducer';

export const productOrdersSelectors = {
  selectProductId: productOrdersFeature.selectProductId,
  selectOrdersTabOpened: productOrdersFeature.selectOrdersTabOpened,
  selectRows: productOrdersFeature.selectRows,
  selectAggregate: productOrdersFeature.selectAggregate,
  selectLoadedProductId: productOrdersFeature.selectLoadedProductId,
  selectRequest: productOrdersFeature.selectRequest,

  selectIsLoading: createSelector(
    productOrdersFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectHasRows: createSelector(productOrdersFeature.selectRows, (rows) => rows.length > 0),

  /** Cross-store read: the loaded product entity (request building needs its `id`). */
  selectProduct: productDetailsFeature.selectProduct,
  selectDetailsIsLoading: productDetailsSelectors.selectIsLoading,
} as const;
