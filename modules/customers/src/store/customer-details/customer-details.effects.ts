import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, mergeMap, catchError, switchMap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '@invoria/utils';
import { CustomersApiService } from '@invoria/customers/services/customers-api.service';
import { CUSTOMER_DETAILS_ACTIONS } from './customer-details.actions';

/** Data-only effects: success/failure branching. Presentation is owned by the global `AppErrorEffects`. */
@Injectable()
export class CustomerDetailsEffects {
  private readonly actions$ = inject(Actions);
  private readonly customersApi = inject(CustomersApiService);

  /** Fires once the page mounts (or navigates to another `:id`); `switchMap` keeps only the latest id. */
  readonly loadCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CUSTOMER_DETAILS_ACTIONS.loadCustomer),
      switchMap(({ customerId }) =>
        this.customersApi.getCustomer(customerId).pipe(
          mergeMap((response) => {
            if (response.isSuccess && response.result) {
              return of(CUSTOMER_DETAILS_ACTIONS.loadCustomerSuccess({ customer: response.result }));
            }
            const error = response.error ?? new Error('Failed to load customer.');
            return of(
              CUSTOMER_DETAILS_ACTIONS.loadCustomerFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              CUSTOMER_DETAILS_ACTIONS.loadCustomerFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );
}
