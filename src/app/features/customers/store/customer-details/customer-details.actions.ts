import { createAction, props } from '@ngrx/store';

import type { Customer } from '../../models/customer.entity';
import type { CustomerDetailsTab } from './customer-details.reducer';

/** State module for the customer details page basics: `activeTab` + `customer`. */
export const CUSTOMER_DETAILS_ACTIONS = {
  /** Triggered when the page loads (the `:id` route param). */
  loadCustomer: createAction('[Customer Details] Load Customer', props<{ customerId: string }>()),

  loadCustomerSuccess: createAction(
    '[Customer Details] Load Customer Success',
    props<{ customer: Customer }>(),
  ),

  loadCustomerFailure: createAction(
    '[Customer Details] Load Customer Failure',
    props<{ error: unknown }>(),
  ),

  setActiveTab: createAction(
    '[Customer Details] Set Active Tab',
    props<{ activeTab: CustomerDetailsTab }>(),
  ),
} as const;
