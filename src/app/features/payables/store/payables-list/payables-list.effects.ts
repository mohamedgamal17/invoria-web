import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError,
  distinctUntilChanged,
  filter,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  withLatestFrom,
} from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ListPayableRequest } from '../../models/list-payable.request';
import type { Payable } from '../../models/payable.entity';
import { PayablesApiService } from '../../services/payables-api.service';
import { PayableReferenceResolverService } from '../../services/payable-reference-resolver.service';
import { hydratePayable } from '../../utils/hydrate-payable';
import { PAYABLES_LIST_ACTIONS } from './payables-list.actions';
import {
  payablesListFeature,
  type PayablesListState,
} from './payables-list.reducer';

/**
 * Data-only effects for the payables list slice. URL application lives in the
 * `store/payables-list-url` effects; error presentation is owned by the
 * global `AppErrorEffects`.
 */
@Injectable()
export class PayablesListEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly payablesApi = inject(PayablesApiService);
  private readonly referenceResolver = inject(PayableReferenceResolverService);

  /** Funnel: the URL application becomes the single `Load Payables` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PAYABLES_LIST_ACTIONS.setQueryFromUrl),
      map(() => PAYABLES_LIST_ACTIONS.loadPayables()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Payables` copies around the same in-flight query (their reducer pass
   *  no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchPayables$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PAYABLES_LIST_ACTIONS.loadPayables),
      withLatestFrom(this.store.select(payablesListFeature.selectPayablesListState)),
      filter(([, state]) => state.request.status === LOAD_STATUS.Loading),
      distinctUntilChanged((prevSource, nextSource) => sameFetchRound(prevSource[1], nextSource[1])),
      switchMap(([, state]) => this.executeFetch(state)),
    ),
  );

  private executeFetch(state: PayablesListState) {
    const request: ListPayableRequest = {
      Skip: state.pageIndex * state.pageSize,
      Length: state.pageSize,
      ...(state.supplierIdFilter ? { PartyId: state.supplierIdFilter } : {}),
      ...(state.sourceIdFilter ? { SourceId: state.sourceIdFilter } : {}),
      ...(state.isPaidFilter !== null ? { IsPaid: state.isPaidFilter } : {}),
    };

    return this.payablesApi.listPayables(request).pipe(
      mergeMap((res) => {
        if (!res.isSuccess || !res.result) {
          const error = res.error ?? new Error('Failed to load payables.');
          return of(
            PAYABLES_LIST_ACTIONS.loadPayablesFailure({ error }),
            APP_ERROR_ACTIONS.apiError({ error }),
          );
        }
        const page = res.result;
        // Enrich (hydrate) the raw page before it reaches the store — the
        // store only ever holds UI-ready payables.
        return from(this.enrichPage(page.data)).pipe(
          map((payables) => PAYABLES_LIST_ACTIONS.loadPayablesSuccess({ payables, info: page.info })),
        );
      }),
      catchError((error: unknown) =>
        of(
          PAYABLES_LIST_ACTIONS.loadPayablesFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }

  /** Resolves the distinct party/source refs of a page (session-cached, never rejects). */
  private async enrichPage(payables: Payable[]): Promise<Payable[]> {
    const partyIds = [...new Set(payables.map((payable) => payable.partyId))];
    const sourceIds = [...new Set(payables.map((payable) => payable.sourceId))];

    const [partyNames, sourceNumbers] = await Promise.all([
      Promise.all(partyIds.map((partyId) => this.referenceResolver.getPartyName(partyId))),
      Promise.all(sourceIds.map((sourceId) => this.referenceResolver.getPurchaseOrderNumber(sourceId))),
    ]);

    const partyNamesById = new Map(partyIds.map((partyId, index) => [partyId, partyNames[index]]));
    const sourceNumbersById = new Map(
      sourceIds.map((sourceId, index) => [sourceId, sourceNumbers[index]]),
    );

    return payables.map((payable) =>
      hydratePayable(
        payable,
        partyNamesById.get(payable.partyId),
        sourceNumbersById.get(payable.sourceId),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Payables` keeps the current ones untouched. */
function sameFetchRound(left: PayablesListState, right: PayablesListState): boolean {
  return left === right;
}
