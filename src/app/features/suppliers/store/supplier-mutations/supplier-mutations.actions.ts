import { createAction, props } from '@ngrx/store';

import type { Supplier } from '../../models/supplier.entity';
import type { SupplierRequest } from '../../models/supplier-request';

/**
 * State module for the supplier form page: store-owned create/update mutations.
 * Success actions funnel into `SUPPLIERS_LIST_ACTIONS.supplierCreated` /
 * `supplierUpdated` (see `supplier-mutations.effects`) so the loaded list page
 * syncs silently without refetching.
 */
export const SUPPLIER_MUTATIONS_ACTIONS = {
  /** Form submit: start a create request; the body is already validated by the form. */
  createSupplier: createAction(
    '[Suppliers] Create Supplier',
    props<{ request: SupplierRequest }>(),
  ),

  createSupplierSuccess: createAction(
    '[Suppliers] Create Supplier Success',
    props<{ supplier: Supplier }>(),
  ),

  createSupplierFailure: createAction(
    '[Suppliers] Create Supplier Failure',
    props<{ error: unknown }>(),
  ),

  /** Form submit: start an update request for the edited supplier. */
  updateSupplier: createAction(
    '[Suppliers] Update Supplier',
    props<{ id: string; request: SupplierRequest }>(),
  ),

  updateSupplierSuccess: createAction(
    '[Suppliers] Update Supplier Success',
    props<{ supplier: Supplier }>(),
  ),

  updateSupplierFailure: createAction(
    '[Suppliers] Update Supplier Failure',
    props<{ error: unknown }>(),
  ),
} as const;
