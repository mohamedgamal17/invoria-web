import { createAction, props } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import type { Supplier } from '../../models/supplier.entity';

/**
 * State module for the suppliers list page:
 * URL-backed paging + name filter, and the current API page of suppliers.
 */
export const SUPPLIERS_LIST_ACTIONS = {
  /** Paging/filter values observed from the list-route query (`page` 1-based / `pageSize` / `q`); always concrete values. */
  setQueryFromUrl: createAction(
    '[Suppliers List] Set Query From Url',
    props<{ pageIndex: number; pageSize: number; nameFilter: string }>(),
  ),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadSuppliers: createAction('[Suppliers List] Load Suppliers'),

  loadSuppliersSuccess: createAction(
    '[Suppliers List] Load Suppliers Success',
    props<{ suppliers: Supplier[]; info: PagingInfo }>(),
  ),

  loadSuppliersFailure: createAction(
    '[Suppliers List] Load Suppliers Failure',
    props<{ error: unknown }>(),
  ),

  /** Local sync: a supplier was created via the API (form page); prepend silently, no refetch. */
  supplierCreated: createAction(
    '[Suppliers List] Supplier Created',
    props<{ supplier: Supplier }>(),
  ),

  /** Local sync: a supplier was updated via the API (form page); replace in place if present. */
  supplierUpdated: createAction(
    '[Suppliers List] Supplier Updated',
    props<{ supplier: Supplier }>(),
  ),
} as const;
