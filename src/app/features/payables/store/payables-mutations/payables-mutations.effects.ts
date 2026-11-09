import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { catchError, exhaustMap, from, mergeMap, of, tap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { PAYABLE_CURRENCY_CODE } from '../../models/payable-currency';
import type { Payable } from '../../models/payable.entity';
import { PayablesApiService } from '../../services/payables-api.service';
import { PayableReferenceResolverService } from '../../services/payable-reference-resolver.service';
import { hydratePayable } from '../../utils/hydrate-payable';
import { PAYABLES_LIST_ACTIONS } from '../payables-list/payables-list.actions';
import { PAYABLES_MUTATIONS_ACTIONS } from './payables-mutations.actions';

/**
 * Store-owned settle mutation for the payable details page. Success
 * dispatches the local list-sync action so the payables list (provided on
 * the same shell route) folds the returned entity in without refetching;
 * API errors are presented by the global `AppErrorEffects`.
 */
@Injectable()
export class PayablesMutationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly payablesApi = inject(PayablesApiService);
  private readonly referenceResolver = inject(PayableReferenceResolverService);
  private readonly messageService = inject(MessageService);

  readonly settlePayable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PAYABLES_MUTATIONS_ACTIONS.settlePayable),
      exhaustMap(({ payableId, amount }) =>
        this.payablesApi.settlePayable(payableId, { Amount: amount }).pipe(
          mergeMap((res) => {
            if (!res.isSuccess || !res.result) {
              const error = res.error ?? new Error('Failed to settle the payable.');
              return of(
                PAYABLES_MUTATIONS_ACTIONS.settlePayableFailure({ error }),
                APP_ERROR_ACTIONS.apiError({ error }),
              );
            }
            // Enrich the returned entity before any slice folds it in, so the
            // list row and the details view keep their resolved party/source refs.
            return from(this.enrichPayable(res.result)).pipe(
              mergeMap((payable) =>
                of(
                  PAYABLES_MUTATIONS_ACTIONS.settlePayableSuccess({ payable, amount }),
                  PAYABLES_LIST_ACTIONS.payableUpdated({ payable }),
                ),
              ),
            );
          }),
          catchError((error: unknown) =>
            of(
              PAYABLES_MUTATIONS_ACTIONS.settlePayableFailure({ error }),
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
        ofType(PAYABLES_MUTATIONS_ACTIONS.settlePayableSuccess),
        tap(({ amount }) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Settlement of ${PAYABLE_CURRENCY_CODE} ${amount.toFixed(2)} recorded.`,
          });
        }),
      ),
    { dispatch: false },
  );

  /** Resolves the server-omitted party/source refs (session-cached, never rejects). */
  private async enrichPayable(payable: Payable): Promise<Payable> {
    const [partyName, purchaseNumber] = await Promise.all([
      this.referenceResolver.getPartyName(payable.partyId),
      this.referenceResolver.getPurchaseOrderNumber(payable.sourceId),
    ]);
    return hydratePayable(payable, partyName, purchaseNumber);
  }
}
