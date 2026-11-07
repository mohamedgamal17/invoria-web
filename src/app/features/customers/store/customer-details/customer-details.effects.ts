import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, mergeMap, catchError, switchMap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { CustomersApiService } from '../../services/customers-api.service';
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
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(CUSTOMER_DETAILS_ACTIONS.loadCustomerSuccess({ customer: res.result }));
            }
            const error = res.error ?? new Error('Failed to load customer.');
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
