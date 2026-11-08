import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { BatchState, type Batch } from '../../../inventory/models/batch.entity';
import { PRODUCT_BATCHES_ACTIONS } from './product-details-batches.actions';
import {
  PRODUCT_BATCHES_INITIAL_STATE,
  productBatchesReducer,
  DEFAULT_BATCHES_PAGE_SIZE,
  type ProductBatchesState,
} from './product-details-batches.reducer';

/** Initial state with the product context and the tab gate open — preconditions for any fetch. */
function primedState(): ProductBatchesState {
  return productBatchesReducer(
    productBatchesReducer(PRODUCT_BATCHES_INITIAL_STATE, {
      ...PRODUCT_BATCHES_ACTIONS.reset({ productId: 'prd_1' }),
    }),
    { ...PRODUCT_BATCHES_ACTIONS.batchesTabOpened() },
  );
}

describe('productBatchesReducer', () => {
  describe('pageChange', () => {
    it('returns the same state object when paging values are identical', () => {
      const primed = { ...primedState(), pageIndex: 2, pageSize: 50 };
      const next = productBatchesReducer(primed, {
        ...PRODUCT_BATCHES_ACTIONS.pageChange({ pageIndex: 2, pageSize: 50 }),
      });
      expect(next).toBe(primed);
    });

    it('updates on a real change', () => {
      const primed = { ...primedState(), pageIndex: 0, pageSize: 25 };
      const next = productBatchesReducer(primed, {
        ...PRODUCT_BATCHES_ACTIONS.pageChange({ pageIndex: 1, pageSize: 25 }),
      });
      expect(next).not.toBe(primed);
      expect(next.pageIndex).toBe(1);
    });
  });

  describe('setPagingFromUrl', () => {
    it('applies the paging values and no-ops when nothing changes', () => {
      const primed = { ...primedState(), pageIndex: 2, pageSize: 50 };
      const next = productBatchesReducer(primed, {
        ...PRODUCT_BATCHES_ACTIONS.setPagingFromUrl({ pageIndex: 2, pageSize: 50 }),
      });
      expect(next).toBe(primed);
      expect(next.pageIndex).toBe(2);
      expect(next.pageSize).toBe(50);
    });

    it('replaces both paging values from the query', () => {
      const primed = { ...primedState(), pageIndex: 0, pageSize: 25 };
      const next = productBatchesReducer(primed, {
        ...PRODUCT_BATCHES_ACTIONS.setPagingFromUrl({ pageIndex: 3, pageSize: 50 }),
      });
      expect(next.pageIndex).toBe(3);
      expect(next.pageSize).toBe(50);
    });
  });

  describe('loadBatches (the state decides whether the API is called)', () => {
    it('stays idle when the tab gate is closed', () => {
      const primed = productBatchesReducer(PRODUCT_BATCHES_INITIAL_STATE, {
        ...PRODUCT_BATCHES_ACTIONS.reset({ productId: 'prd_1' }),
      });
      const next = productBatchesReducer(primed, {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      expect(next).toBe(primed);
      expect(next.request.status).toBe(LOAD_STATUS.Idle);
    });

    it('stays idle while the product context is unknown', () => {
      let state = PRODUCT_BATCHES_INITIAL_STATE;
      state = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.batchesTabOpened(),
      });
      const next = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Idle);
    });

    it('starts loading on the first trigger', () => {
      const primed = primedState();
      const next = productBatchesReducer(primed, {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(DEFAULT_BATCHES_PAGE_SIZE);
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = productBatchesReducer(primedState(), {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      state = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.loadBatchesSuccess({
          batches: [],
          info: { length: 0, skip: 0, totalCount: 0 },
        }),
      });
      const next = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = productBatchesReducer(primedState(), {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      const next = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when the query actually changed', () => {
      let state = productBatchesReducer(primedState(), {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      state = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.loadBatchesSuccess({
          batches: [],
          info: { length: 0, skip: 0, totalCount: 0 },
        }),
      });
      state = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.pageChange({ pageIndex: 1, pageSize: 25 }),
      });
      const next = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(1);
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = productBatchesReducer(primedState(), {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      state = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.loadBatchesFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      const next = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('create/update batch mutations', () => {
    it('starts the save request and blocks parallel submits while in flight', () => {
      let state = productBatchesReducer(primedState(), {
        ...PRODUCT_BATCHES_ACTIONS.createBatch({ payload: { quantity: 3, purchasePrice: 10 } }),
      });
      expect(state.saveRequest.status).toBe(LOAD_STATUS.Loading);

      const repeated = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.createBatch({ payload: { quantity: 4, purchasePrice: 11 } }),
      });
      expect(repeated).toBe(state);

      const updateAttempt = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.updateBatch({
          id: 'bat_1',
          payload: { quantity: 4, purchasePrice: 11 },
        }),
      });
      expect(updateAttempt).toBe(state);
    });

    it('marks the save round as loaded on success (list refresh funnels separately)', () => {
      let state = productBatchesReducer(primedState(), {
        ...PRODUCT_BATCHES_ACTIONS.createBatch({ payload: { quantity: 3, purchasePrice: 10 } }),
      });
      const batch: Batch = {
        id: 'bat_new',
        createdAt: '',
        productId: 'prd_1',
        quantity: 3,
        reservedQuantity: 0,
        state: BatchState.Active,
        purchasePrice: 10,
      };
      state = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.createBatchSuccess({ batch }),
      });
      expect(state.saveRequest.status).toBe(LOAD_STATUS.Loaded);
    });

    it('applies the failure to the save fragment', () => {
      let state = productBatchesReducer(primedState(), {
        ...PRODUCT_BATCHES_ACTIONS.updateBatch({
          id: 'bat_1',
          payload: { quantity: 3, purchasePrice: 10 },
        }),
      });
      state = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.updateBatchFailure({ error: new Error('boom') }),
      });
      expect(state.saveRequest.status).toBe(LOAD_STATUS.Error);
      expect(state.saveRequest.error).not.toBeNull();
      expect(state.saveRequest.failureNonce).toBe(1);
    });
  });

  describe('reset', () => {
    it('clears the slice for the incoming product id', () => {
      let state = productBatchesReducer(primedState(), {
        ...PRODUCT_BATCHES_ACTIONS.loadBatches(),
      });
      state = productBatchesReducer(state, {
        ...PRODUCT_BATCHES_ACTIONS.reset({ productId: 'prd_2' }),
      });
      expect(state.productId).toBe('prd_2');
      expect(state.batchesTabOpened).toBe(false);
      expect(state.fetchedQuery).toBeNull();
      expect(state.pageIndex).toBe(0);
      expect(state.pageSize).toBe(DEFAULT_BATCHES_PAGE_SIZE);
      expect(state.request.status).toBe(LOAD_STATUS.Idle);
      expect(state.saveRequest.status).toBe(LOAD_STATUS.Idle);
    });
  });
});
