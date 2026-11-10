import { createFeature, createReducer, on } from '@ngrx/store';

import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import type { Supplier } from '../../models/supplier.entity';
import { SUPPLIER_MUTATIONS_ACTIONS } from '../supplier-mutations/supplier-mutations.actions';
import { SUPPLIER_DETAILS_ACTIONS } from './supplier-details.actions';

export const SUPPLIER_DETAILS_FEATURE_KEY = 'supplierDetails';

/** Tabs of the supplier details page. Values double as URL query slugs. */
export enum SupplierDetailsTab {
  Profile = 'profile',
  PurchaseOrders = 'purchase-orders',
}

export interface SupplierDetailsState {
  supplierId: string | null;
  supplier: Supplier | null;
  activeTab: SupplierDetailsTab;
  request: AsyncRequestState;
}

export const SUPPLIER_DETAILS_INITIAL_STATE: SupplierDetailsState = {
  supplierId: null,
  supplier: null,
  activeTab: SupplierDetailsTab.Profile,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const supplierDetailsReducer = createReducer(
  SUPPLIER_DETAILS_INITIAL_STATE,

  on(SUPPLIER_DETAILS_ACTIONS.loadSupplier, (state, { supplierId }) => ({
    ...state,
    supplierId,
    supplier: null,
    request: startLoading(state.request),
  })),

  on(SUPPLIER_DETAILS_ACTIONS.loadSupplierSuccess, (state, { supplier }) => ({
    ...state,
    supplier,
    request: { ...state.request, status: 'loaded' as const, error: null },
  })),

  on(SUPPLIER_DETAILS_ACTIONS.loadSupplierFailure, (state, { error }) => ({
    ...state,
    supplier: null,
    request: applyFailure(state.request, error),
  })),

  on(SUPPLIER_DETAILS_ACTIONS.setActiveTab, (state, { activeTab }) =>
    activeTab === state.activeTab ? state : { ...state, activeTab },
  ),

  // Silent mutation sync: while the user edits this supplier, an update from
  // the mutations slice replaces the held entity in place — no refetch, no
  // loading flicker, no navigation. The details store is the single source of
  // truth for the currently held entity id.
  on(SUPPLIER_MUTATIONS_ACTIONS.updateSupplierSuccess, (state, { supplier }) =>
    state.supplier !== null && state.supplier.id === supplier.id ? { ...state, supplier } : state,
  ),
);

export const supplierDetailsFeature = createFeature({
  name: SUPPLIER_DETAILS_FEATURE_KEY,
  reducer: supplierDetailsReducer,
});
