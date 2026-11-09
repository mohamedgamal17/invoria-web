import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  of,
  switchMap,
  withLatestFrom,
} from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ListInvoiceRequest } from '../../models/list-invoice.request';
import { InvoicesApiService } from '../../services/invoices-api.service';
import { INVOICES_LIST_ACTIONS } from './invoices-list.actions';
import {
  invoicesListFeature,
  type InvoicesListState,
} from './invoices-list.reducer';

/**
 * Data-only effects for the invoices list slice. URL application lives in the
 * `store/invoices-list-url` effects; error presentation is owned by the
 * global `AppErrorEffects`.
 */
@Injectable()
export class InvoicesListEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly invoicesApi = inject(InvoicesApiService);

  /** Funnel: the URL application becomes the single `Load Invoices` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(INVOICES_LIST_ACTIONS.setQueryFromUrl),
      map(() => INVOICES_LIST_ACTIONS.loadInvoices()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Invoices` copies around the same in-flight query (their reducer pass
   *  no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchInvoices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(INVOICES_LIST_ACTIONS.loadInvoices),
      withLatestFrom(this.store.select(invoicesListFeature.selectInvoicesListState)),
      filter(([, state]) => state.request.status === LOAD_STATUS.Loading),
      distinctUntilChanged((prevSource, nextSource) => sameFetchRound(prevSource[1], nextSource[1])),
      switchMap(([, state]) => this.executeFetch(state)),
    ),
  );

  private executeFetch(state: InvoicesListState) {
    const request: ListInvoiceRequest = {
      Skip: state.pageIndex * state.pageSize,
      Length: state.pageSize,
      ...(state.customerIdFilter ? { CustomerId: state.customerIdFilter } : {}),
      ...(state.orderIdFilter ? { OrderId: state.orderIdFilter } : {}),
    };

    return this.invoicesApi.listInvoices(request).pipe(
      mergeMap((res) => {
        if (res.isSuccess && res.result) {
          return of(
            INVOICES_LIST_ACTIONS.loadInvoicesSuccess({
              invoices: res.result.data,
              info: res.result.info,
            }),
          );
        }
        const error = res.error ?? new Error('Failed to load invoices.');
        return of(
          INVOICES_LIST_ACTIONS.loadInvoicesFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        );
      }),
      catchError((error: unknown) =>
        of(
          INVOICES_LIST_ACTIONS.loadInvoicesFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Invoices` keeps the current ones untouched. */
function sameFetchRound(left: InvoicesListState, right: InvoicesListState): boolean {
  return left === right;
}
