import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { catchError, exhaustMap, mergeMap, of, tap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { CUSTOMERS_LIST_ACTIONS } from '../customers-list/customers-list.actions';
import { CustomersApiService } from '../../services/customers-api.service';
import { CUSTOMER_MUTATIONS_ACTIONS } from './customer-mutations.actions';

/**
 * Store-owned create/update mutations for the customer form page. Success
 * dispatches the local list-sync actions so the customers list (provided on
 * the same parent route) folds the returned entity in without refetching;
 * API errors are presented by the global `AppErrorEffects`.
 */
@Injectable()
export class CustomerMutationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly customersApi = inject(CustomersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly createCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CUSTOMER_MUTATIONS_ACTIONS.createCustomer),
      exhaustMap(({ request }) =>
        this.customersApi.createCustomer(request).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(
                CUSTOMER_MUTATIONS_ACTIONS.createCustomerSuccess({ customer: res.result }),
                CUSTOMERS_LIST_ACTIONS.customerCreated({ customer: res.result }),
              );
            }
            const error = res.error ?? new Error('Failed to create the customer.');
            return of(
              CUSTOMER_MUTATIONS_ACTIONS.createCustomerFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              CUSTOMER_MUTATIONS_ACTIONS.createCustomerFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Success presentation: toast, then land on the details page. */
  readonly presentCreateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CUSTOMER_MUTATIONS_ACTIONS.createCustomerSuccess),
        tap(({ customer }) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Customer created successfully.',
          });
          void this.router.navigate(['/customers', customer.id]);
        }),
      ),
    { dispatch: false },
  );

  readonly updateCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CUSTOMER_MUTATIONS_ACTIONS.updateCustomer),
      exhaustMap(({ id, request }) =>
        this.customersApi.updateCustomer(id, request).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(
                CUSTOMER_MUTATIONS_ACTIONS.updateCustomerSuccess({ customer: res.result }),
                CUSTOMERS_LIST_ACTIONS.customerUpdated({ customer: res.result }),
              );
            }
            const error = res.error ?? new Error('Failed to update the customer.');
            return of(
              CUSTOMER_MUTATIONS_ACTIONS.updateCustomerFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              CUSTOMER_MUTATIONS_ACTIONS.updateCustomerFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Success presentation: toast, then land on the details page. */
  readonly presentUpdateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CUSTOMER_MUTATIONS_ACTIONS.updateCustomerSuccess),
        tap(({ customer }) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Customer updated successfully.',
          });
          void this.router.navigate(['/customers', customer.id]);
        }),
      ),
    { dispatch: false },
  );
}
