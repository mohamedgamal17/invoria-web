import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, mergeMap, of, switchMap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { InvoicesApiService } from '../../services/invoices-api.service';
import { INVOICE_DETAILS_ACTIONS } from './invoice-details.actions';

/**
 * Data-only effects: success/failure branching. Presentation is owned by the
 * global `AppErrorEffects`; the URL `tab` application lives in the
 * `store/invoice-details-url` effects.
 */
@Injectable()
export class InvoiceDetailsEffects {
  private readonly actions$ = inject(Actions);
  private readonly invoicesApi = inject(InvoicesApiService);

  /**
   * Fires when the page loads or navigates to another `:id` (`loadInvoice`), or
   * on a background refetch (`refreshInvoice`, the retry button); `switchMap`
   * keeps only the latest.
   */
  readonly loadInvoice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        INVOICE_DETAILS_ACTIONS.loadInvoice,
        INVOICE_DETAILS_ACTIONS.refreshInvoice,
      ),
      switchMap(({ invoiceId }) =>
        this.invoicesApi.getInvoice(invoiceId).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(
                INVOICE_DETAILS_ACTIONS.loadInvoiceSuccess({ invoice: res.result }),
              );
            }
            const error = res.error ?? new Error('Failed to load the invoice.');
            return of(
              INVOICE_DETAILS_ACTIONS.loadInvoiceFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              INVOICE_DETAILS_ACTIONS.loadInvoiceFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );
}
