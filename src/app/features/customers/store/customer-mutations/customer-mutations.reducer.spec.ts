import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Customer } from '../../models/customer.entity';
import { CUSTOMER_MUTATIONS_ACTIONS } from './customer-mutations.actions';
import {
  CUSTOMER_MUTATIONS_INITIAL_STATE,
  customerMutationsReducer,
} from './customer-mutations.reducer';

const REQUEST = { Name: 'Alpha Customer' };
const CUSTOMER: Customer = {
  id: 'cus_1',
  name: 'Alpha Customer',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('customerMutationsReducer', () => {
  describe('create flow', () => {
    it('starts the create request and leaves the update fragment untouched', () => {
      const next = customerMutationsReducer(CUSTOMER_MUTATIONS_INITIAL_STATE, {
        ...CUSTOMER_MUTATIONS_ACTIONS.createCustomer({ request: REQUEST }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.createRequest.error).toBeNull();
      expect(next.updateRequest).toBe(CUSTOMER_MUTATIONS_INITIAL_STATE.updateRequest);
    });

    it('ignores a repeated create while one is in flight (same state reference)', () => {
      let state = customerMutationsReducer(CUSTOMER_MUTATIONS_INITIAL_STATE, {
        ...CUSTOMER_MUTATIONS_ACTIONS.createCustomer({ request: REQUEST }),
      });
      const next = customerMutationsReducer(state, {
        ...CUSTOMER_MUTATIONS_ACTIONS.createCustomer({ request: REQUEST }),
      });
      expect(next).toBe(state);
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loading);
    });

    it('marks the create request loaded on success', () => {
      let state = customerMutationsReducer(CUSTOMER_MUTATIONS_INITIAL_STATE, {
        ...CUSTOMER_MUTATIONS_ACTIONS.createCustomer({ request: REQUEST }),
      });
      const next = customerMutationsReducer(state, {
        ...CUSTOMER_MUTATIONS_ACTIONS.createCustomerSuccess({ customer: CUSTOMER }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loaded);
      expect(next.createRequest.error).toBeNull();
    });

    it('applies the failure to the create request', () => {
      let state = customerMutationsReducer(CUSTOMER_MUTATIONS_INITIAL_STATE, {
        ...CUSTOMER_MUTATIONS_ACTIONS.createCustomer({ request: REQUEST }),
      });
      const next = customerMutationsReducer(state, {
        ...CUSTOMER_MUTATIONS_ACTIONS.createCustomerFailure({ error: new Error('boom') }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Error);
      expect(next.createRequest.error).toBeTruthy();
      expect(next.createRequest.failureNonce).toBe(1);
      expect(next.updateRequest).toBe(CUSTOMER_MUTATIONS_INITIAL_STATE.updateRequest);
    });

    it('allows a new create after a failure and resets the inline error', () => {
      let state = customerMutationsReducer(CUSTOMER_MUTATIONS_INITIAL_STATE, {
        ...CUSTOMER_MUTATIONS_ACTIONS.createCustomer({ request: REQUEST }),
      });
      state = customerMutationsReducer(state, {
        ...CUSTOMER_MUTATIONS_ACTIONS.createCustomerFailure({ error: new Error('boom') }),
      });
      const next = customerMutationsReducer(state, {
        ...CUSTOMER_MUTATIONS_ACTIONS.createCustomer({ request: REQUEST }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.createRequest.error).toBeNull();
      expect(next.createRequest.failureNonce).toBe(1);
    });
  });

  describe('update flow', () => {
    it('starts the update request and leaves the create fragment untouched', () => {
      const next = customerMutationsReducer(CUSTOMER_MUTATIONS_INITIAL_STATE, {
        ...CUSTOMER_MUTATIONS_ACTIONS.updateCustomer({ id: 'cus_1', request: REQUEST }),
      });
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.createRequest).toBe(CUSTOMER_MUTATIONS_INITIAL_STATE.createRequest);
    });

    it('ignores a repeated update while one is in flight (same state reference)', () => {
      let state = customerMutationsReducer(CUSTOMER_MUTATIONS_INITIAL_STATE, {
        ...CUSTOMER_MUTATIONS_ACTIONS.updateCustomer({ id: 'cus_1', request: REQUEST }),
      });
      const next = customerMutationsReducer(state, {
        ...CUSTOMER_MUTATIONS_ACTIONS.updateCustomer({ id: 'cus_1', request: REQUEST }),
      });
      expect(next).toBe(state);
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Loading);
    });

    it('marks the update request loaded on success', () => {
      let state = customerMutationsReducer(CUSTOMER_MUTATIONS_INITIAL_STATE, {
        ...CUSTOMER_MUTATIONS_ACTIONS.updateCustomer({ id: 'cus_1', request: REQUEST }),
      });
      const next = customerMutationsReducer(state, {
        ...CUSTOMER_MUTATIONS_ACTIONS.updateCustomerSuccess({ customer: CUSTOMER }),
      });
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Loaded);
    });

    it('applies the failure to the update request', () => {
      let state = customerMutationsReducer(CUSTOMER_MUTATIONS_INITIAL_STATE, {
        ...CUSTOMER_MUTATIONS_ACTIONS.updateCustomer({ id: 'cus_1', request: REQUEST }),
      });
      const next = customerMutationsReducer(state, {
        ...CUSTOMER_MUTATIONS_ACTIONS.updateCustomerFailure({ error: new Error('boom') }),
      });
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Error);
      expect(next.updateRequest.failureNonce).toBe(1);
      expect(next.createRequest).toBe(CUSTOMER_MUTATIONS_INITIAL_STATE.createRequest);
    });
  });
});
