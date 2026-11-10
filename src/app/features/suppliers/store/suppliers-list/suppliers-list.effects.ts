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
import type { ListSupplierRequest } from '../../models/list-supplier.request';
import { SuppliersApiService } from '../../services/suppliers-api.service';
import { SUPPLIERS_LIST_ACTIONS } from './suppliers-list.actions';
import { suppliersListFeature, type SuppliersListState } from './suppliers-list.reducer';

/**
 * Data-only effects for the suppliers list slice. URL application lives in the
 * `store/suppliers-list-url` effects; error presentation is owned by the
 * global `AppErrorEffects`.
 */
@Injectable()
export class SuppliersListEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly suppliersApi = inject(SuppliersApiService);

  /** Funnel: the URL application becomes the single `Load Suppliers` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SUPPLIERS_LIST_ACTIONS.setQueryFromUrl),
      map(() => SUPPLIERS_LIST_ACTIONS.loadSuppliers()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Suppliers` copies around the same in-flight query (their reducer pass
   *  no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchSuppliers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SUPPLIERS_LIST_ACTIONS.loadSuppliers),
      withLatestFrom(this.store.select(suppliersListFeature.selectSuppliersListState)),
      filter(([, state]) => state.request.status === LOAD_STATUS.Loading),
      distinctUntilChanged((prevSource, nextSource) =>
        sameFetchRound(prevSource[1], nextSource[1]),
      ),
      switchMap(([, state]) => this.executeFetch(state)),
    ),
  );

  private executeFetch(state: SuppliersListState) {
    const request: ListSupplierRequest = {
      Skip: state.pageIndex * state.pageSize,
      Length: state.pageSize,
      Name: state.nameFilter || null,
    };

    return this.suppliersApi.listSuppliers(request).pipe(
      mergeMap((res) => {
        if (res.isSuccess && res.result) {
          return of(
            SUPPLIERS_LIST_ACTIONS.loadSuppliersSuccess({
              suppliers: res.result.data,
              info: res.result.info,
            }),
          );
        }
        const error = res.error ?? new Error('Failed to load suppliers.');
        return of(
          SUPPLIERS_LIST_ACTIONS.loadSuppliersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        );
      }),
      catchError((error: unknown) =>
        of(
          SUPPLIERS_LIST_ACTIONS.loadSuppliersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Suppliers` keeps the current ones untouched. */
function sameFetchRound(left: SuppliersListState, right: SuppliersListState): boolean {
  return left === right;
}
