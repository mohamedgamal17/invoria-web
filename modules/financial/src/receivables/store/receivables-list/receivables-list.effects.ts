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

import { APP_ERROR_ACTIONS } from '@invoria/utils';
import { LOAD_STATUS } from '@invoria/utils';
import type { ListReceivableRequest } from '@invoria/financial/receivables/models/list-receivable.request';
import type { Receivable } from '@invoria/financial/receivables/models/receivable.entity';
import { ReceivablesApiService } from '@invoria/financial/receivables/services/receivables-api.service';
import { RECEIVABLES_LIST_ACTIONS } from './receivables-list.actions';
import { receivablesListFeature, type ReceivablesListState } from './receivables-list.reducer';

/**
 * Data-only effects for the receivables list slice. URL application lives in the
 * `store/receivables-list-url` effects; error presentation is owned by the
 * global `AppErrorEffects`.
 */
@Injectable()
export class ReceivablesListEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly receivablesApi = inject(ReceivablesApiService);

  /** Funnel: the URL application becomes the single `Load Receivables` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RECEIVABLES_LIST_ACTIONS.setQueryFromUrl),
      map(() => RECEIVABLES_LIST_ACTIONS.loadReceivables()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Receivables` copies around the same in-flight query (their reducer pass
   *  no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchReceivables$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RECEIVABLES_LIST_ACTIONS.loadReceivables),
      withLatestFrom(this.store.select(receivablesListFeature.selectReceivablesListState)),
      filter(([, state]) => state.request.status === LOAD_STATUS.Loading),
      distinctUntilChanged((prevSource, nextSource) =>
        sameFetchRound(prevSource[1], nextSource[1]),
      ),
      switchMap(([, state]) => this.executeFetch(state)),
    ),
  );

  private executeFetch(state: ReceivablesListState) {
    const request: ListReceivableRequest = {
      skip: state.pageIndex * state.pageSize,
      length: state.pageSize,
      ...(state.partyIdFilter ? { partyId: state.partyIdFilter } : {}),
      ...(state.sourceIdFilter ? { sourceId: state.sourceIdFilter } : {}),
      ...(state.isPaidFilter !== null ? { isPaid: state.isPaidFilter } : {}),
    };

    return this.receivablesApi.listReceivables(request).pipe(
      mergeMap((response) => {
        if (!response.isSuccess || !response.result) {
          const error = response.error ?? new Error('Failed to load receivables.');
          return of(
            RECEIVABLES_LIST_ACTIONS.loadReceivablesFailure({ error }),
            APP_ERROR_ACTIONS.apiError({ error }),
          );
        }
        return of(
          RECEIVABLES_LIST_ACTIONS.loadReceivablesSuccess({
            receivables: response.result.data,
            info: response.result.info,
          }),
        );
      }),
      catchError((error: unknown) =>
        of(
          RECEIVABLES_LIST_ACTIONS.loadReceivablesFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Receivables` keeps the current ones untouched. */
function sameFetchRound(left: ReceivablesListState, right: ReceivablesListState): boolean {
  return left === right;
}
