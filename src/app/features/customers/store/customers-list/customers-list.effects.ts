import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, distinctUntilChanged, filter, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ListCustomerRequest } from '../../models/list-customer.request';
import { CustomersApiService } from '../../services/customers-api.service';
import { CUSTOMERS_LIST_ACTIONS } from './customers-list.actions';
import {
  customersListFeature,
  type CustomersListState,
} from './customers-list.reducer';

/**
 * Data-only effects for the customers list slice. URL application lives in the
 * `store/customers-list-url` effects; error presentation is owned by the
 * global `AppErrorEffects`.
 */
@Injectable()
export class CustomersListEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly customersApi = inject(CustomersApiService);

  /** Funnel: the URL application becomes the single `Load Customers` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CUSTOMERS_LIST_ACTIONS.setQueryFromUrl),
      map(() => CUSTOMERS_LIST_ACTIONS.loadCustomers()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Customers` copies around the same in-flight query (their reducer pass
   *  no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CUSTOMERS_LIST_ACTIONS.loadCustomers),
      withLatestFrom(this.store.select(customersListFeature.selectCustomersListState)),
      filter(([, state]) => state.request.status === LOAD_STATUS.Loading),
      distinctUntilChanged((prevSource, nextSource) => sameFetchRound(prevSource[1], nextSource[1])),
      switchMap(([, state]) => this.executeFetch(state)),
    ),
  );

  private executeFetch(state: CustomersListState) {
    const request: ListCustomerRequest = {
      Skip: state.pageIndex * state.pageSize,
      Length: state.pageSize,
      Name: state.nameFilter || null,
    };

    return this.customersApi.listCustomers(request).pipe(
      mergeMap((res) => {
        if (res.isSuccess && res.result) {
          return of(
            CUSTOMERS_LIST_ACTIONS.loadCustomersSuccess({
              customers: res.result.data,
              info: res.result.info,
            }),
          );
        }
        const error = res.error ?? new Error('Failed to load customers.');
        return of(
          CUSTOMERS_LIST_ACTIONS.loadCustomersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        );
      }),
      catchError((error: unknown) =>
        of(
          CUSTOMERS_LIST_ACTIONS.loadCustomersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Customers` keeps the current ones untouched. */
function sameFetchRound(a: CustomersListState, b: CustomersListState): boolean {
  return a === b;
}
