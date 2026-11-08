import { createAction, props } from '@ngrx/store';

import type { Customer } from '../../models/customer.entity';
import type { CreateCustomerRequest } from '../../models/create-customer.request';
import type { UpdateCustomerRequest } from '../../models/update-customer.request';

/**
 * State module for the customer form page: store-owned create/update mutations.
 * Success actions funnel into `CUSTOMERS_LIST_ACTIONS.customerCreated` /
 * `customerUpdated` (see `customer-mutations.effects`) so the loaded list page
 * syncs silently without refetching.
 */
export const CUSTOMER_MUTATIONS_ACTIONS = {
  /** Form submit: start a create request; the body is already validated by the form. */
  createCustomer: createAction(
    '[Customers] Create Customer',
    props<{ request: CreateCustomerRequest }>(),
  ),

  createCustomerSuccess: createAction(
    '[Customers] Create Customer Success',
    props<{ customer: Customer }>(),
  ),

  createCustomerFailure: createAction(
    '[Customers] Create Customer Failure',
    props<{ error: unknown }>(),
  ),

  /** Form submit: start an update request for the edited customer. */
  updateCustomer: createAction(
    '[Customers] Update Customer',
    props<{ id: string; request: UpdateCustomerRequest }>(),
  ),

  updateCustomerSuccess: createAction(
    '[Customers] Update Customer Success',
    props<{ customer: Customer }>(),
  ),

  updateCustomerFailure: createAction(
    '[Customers] Update Customer Failure',
    props<{ error: unknown }>(),
  ),
} as const;
