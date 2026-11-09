import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, from, map, mergeMap, of, switchMap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import type { Payable } from '../../models/payable.entity';
import { PayablesApiService } from '../../services/payables-api.service';
import { PayableReferenceResolverService } from '../../services/payable-reference-resolver.service';
import { hydratePayable } from '../../utils/hydrate-payable';
import { PAYABLE_DETAILS_ACTIONS } from './payable-details.actions';

/** Data-only effects: success/failure branching. Presentation is owned by the global `AppErrorEffects`. */
@Injectable()
export class PayableDetailsEffects {
  private readonly actions$ = inject(Actions);
  private readonly payablesApi = inject(PayablesApiService);
  private readonly referenceResolver = inject(PayableReferenceResolverService);

  /**
   * Fires when the page loads or navigates to another `:id` (`loadPayable`);
   * `switchMap` keeps only the latest.
   */
  readonly loadPayable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PAYABLE_DETAILS_ACTIONS.loadPayable),
      switchMap(({ payableId }) =>
        this.payablesApi.getPayable(payableId).pipe(
          mergeMap((res) => {
            if (!res.isSuccess || !res.result) {
              const error = res.error ?? new Error('Failed to load the payable.');
              return of(
                PAYABLE_DETAILS_ACTIONS.loadPayableFailure({ error }),
                APP_ERROR_ACTIONS.apiError({ error }),
              );
            }
            // Enrich (hydrate) the server-omitted party/source refs before the
            // entity reaches the store — the store only holds UI-ready payables.
            return from(this.enrichPayable(res.result)).pipe(
              map((payable) => PAYABLE_DETAILS_ACTIONS.loadPayableSuccess({ payable })),
            );
          }),
          catchError((error: unknown) =>
            of(
              PAYABLE_DETAILS_ACTIONS.loadPayableFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
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
