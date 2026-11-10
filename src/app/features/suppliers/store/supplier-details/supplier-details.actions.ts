import { createAction, props } from '@ngrx/store';

import type { Supplier } from '../../models/supplier.entity';
import type { SupplierDetailsTab } from './supplier-details.reducer';

/** State module for the supplier details page basics: `activeTab` + `supplier`. */
export const SUPPLIER_DETAILS_ACTIONS = {
  /** Triggered when the page loads (the `:id` route param). */
  loadSupplier: createAction('[Supplier Details] Load Supplier', props<{ supplierId: string }>()),

  loadSupplierSuccess: createAction(
    '[Supplier Details] Load Supplier Success',
    props<{ supplier: Supplier }>(),
  ),

  loadSupplierFailure: createAction(
    '[Supplier Details] Load Supplier Failure',
    props<{ error: unknown }>(),
  ),

  setActiveTab: createAction(
    '[Supplier Details] Set Active Tab',
    props<{ activeTab: SupplierDetailsTab }>(),
  ),
} as const;
