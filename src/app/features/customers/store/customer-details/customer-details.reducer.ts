import { createFeature, createReducer, on } from '@ngrx/store';

import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import type { Customer } from '../../models/customer.entity';
import { CUSTOMER_DETAILS_ACTIONS } from './customer-details.actions';

export const CUSTOMER_DETAILS_FEATURE_KEY = 'customerDetails';

/** Tabs of the customer details page. Values double as URL query slugs. */
export enum CustomerDetailsTab {
  Profile = 'profile',
  Orders = 'orders',
}

export interface CustomerDetailsState {
  customerId: string | null;
  customer: Customer | null;
  activeTab: CustomerDetailsTab;
  request: AsyncRequestState;
}

export const CUSTOMER_DETAILS_INITIAL_STATE: CustomerDetailsState = {
  customerId: null,
  customer: null,
  activeTab: CustomerDetailsTab.Profile,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const customerDetailsReducer = createReducer(
  CUSTOMER_DETAILS_INITIAL_STATE,

  on(CUSTOMER_DETAILS_ACTIONS.loadCustomer, (state, { customerId }) => ({
    ...state,
    customerId,
    customer: null,
    request: startLoading(state.request),
  })),

  on(CUSTOMER_DETAILS_ACTIONS.loadCustomerSuccess, (state, { customer }) => ({
    ...state,
    customer,
    request: { ...state.request, status: 'loaded' as const, error: null },
  })),

  on(CUSTOMER_DETAILS_ACTIONS.loadCustomerFailure, (state, { error }) => ({
    ...state,
    customer: null,
    request: applyFailure(state.request, error),
  })),

  on(CUSTOMER_DETAILS_ACTIONS.setActiveTab, (state, { activeTab }) =>
    activeTab === state.activeTab ? state : { ...state, activeTab },
  ),
);

export const customerDetailsFeature = createFeature({
  name: CUSTOMER_DETAILS_FEATURE_KEY,
  reducer: customerDetailsReducer,
});
