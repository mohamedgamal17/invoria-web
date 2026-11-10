import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { catchError, exhaustMap, mergeMap, of, tap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { RECEIVABLE_CURRENCY_CODE } from '../../models/receivable-currency';
import { ReceivablesApiService } from '../../services/receivables-api.service';
import { RECEIVABLES_LIST_ACTIONS } from '../receivables-list/receivables-list.actions';
import { RECEIVABLES_MUTATIONS_ACTIONS } from './receivables-mutations.actions';

/**
 * Store-owned settle mutation for the receivable details page. Success
 * dispatches the local list-sync action so the receivables list (provided on
 * the same shell route) folds the returned entity in without refetching;
 * API errors are presented by the global `AppErrorEffects`.
 */
@Injectable()
export class ReceivablesMutationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly receivablesApi = inject(ReceivablesApiService);
  private readonly messageService = inject(MessageService);

  readonly settleReceivable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RECEIVABLES_MUTATIONS_ACTIONS.settleReceivable),
      exhaustMap(({ receivableId, amount }) =>
        this.receivablesApi.settleReceivable(receivableId, { Amount: amount }).pipe(
          mergeMap((res) => {
            if (!res.isSuccess || !res.result) {
              const error = res.error ?? new Error('Failed to settle the receivable.');
              return of(
                RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableFailure({ error }),
                APP_ERROR_ACTIONS.apiError({ error }),
              );
            }
            return of(
              RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableSuccess({
                receivable: res.result,
                amount,
              }),
              RECEIVABLES_LIST_ACTIONS.receivableUpdated({ receivable: res.result }),
            );
          }),
          catchError((error: unknown) =>
            of(
              RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Success presentation: toast on the shell `p-toast`; the details store closes the modal. */
  readonly presentSettleSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableSuccess),
        tap(({ amount }) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Settlement of ${RECEIVABLE_CURRENCY_CODE} ${amount.toFixed(2)} recorded.`,
          });
        }),
      ),
    { dispatch: false },
  );
}
