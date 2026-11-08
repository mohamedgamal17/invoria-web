import { createAction, props } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import type { Customer } from '../../models/customer.entity';

/**
 * State module for the customers list page:
 * URL-backed paging + name filter, and the current API page of customers.
 */
export const CUSTOMERS_LIST_ACTIONS = {
  /** Paging/filter values observed from the list-route query (`page` 1-based / `pageSize` / `q`); always concrete values. */
  setQueryFromUrl: createAction(
    '[Customers List] Set Query From Url',
    props<{ pageIndex: number; pageSize: number; nameFilter: string }>(),
  ),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadCustomers: createAction('[Customers List] Load Customers'),

  loadCustomersSuccess: createAction(
    '[Customers List] Load Customers Success',
    props<{ customers: Customer[]; info: PagingInfo }>(),
  ),

  loadCustomersFailure: createAction(
    '[Customers List] Load Customers Failure',
    props<{ error: unknown }>(),
  ),

  /** Local sync: a customer was created via the API (form page); prepend silently, no refetch. */
  customerCreated: createAction(
    '[Customers List] Customer Created',
    props<{ customer: Customer }>(),
  ),

  /** Local sync: a customer was updated via the API (form page); replace in place if present. */
  customerUpdated: createAction(
    '[Customers List] Customer Updated',
    props<{ customer: Customer }>(),
  ),
} as const;
