import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import type { Receivable } from '../../models/receivable.entity';
import { ReceivablesApiService } from '../../services/receivables-api.service';
import { RECEIVABLE_DETAILS_ACTIONS } from './receivable-details.actions';

/** Data-only effects: success/failure branching. Presentation is owned by the global `AppErrorEffects`. */
@Injectable()
export class ReceivableDetailsEffects {
  private readonly actions$ = inject(Actions);
  private readonly receivablesApi = inject(ReceivablesApiService);

  /**
   * Fires when the page loads or navigates to another `:id` (`loadReceivable`);
   * `switchMap` keeps only the latest.
   */
  readonly loadReceivable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RECEIVABLE_DETAILS_ACTIONS.loadReceivable),
      switchMap(({ receivableId }) =>
        this.receivablesApi.getReceivable(receivableId).pipe(
          mergeMap((res) => {
            if (!res.isSuccess || !res.result) {
              const error = res.error ?? new Error('Failed to load the receivable.');
              return of(
                RECEIVABLE_DETAILS_ACTIONS.loadReceivableFailure({ error }),
                APP_ERROR_ACTIONS.apiError({ error }),
              );
            }
            return of(RECEIVABLE_DETAILS_ACTIONS.loadReceivableSuccess({ receivable: res.result }));
          }),
          catchError((error: unknown) =>
            of(
              RECEIVABLE_DETAILS_ACTIONS.loadReceivableFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );
}
