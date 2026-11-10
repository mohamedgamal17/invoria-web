import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, mergeMap, catchError, switchMap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { SuppliersApiService } from '../../services/suppliers-api.service';
import { SUPPLIER_DETAILS_ACTIONS } from './supplier-details.actions';

/** Data-only effects: success/failure branching. Presentation is owned by the global `AppErrorEffects`. */
@Injectable()
export class SupplierDetailsEffects {
  private readonly actions$ = inject(Actions);
  private readonly suppliersApi = inject(SuppliersApiService);

  /** Fires once the page mounts (or navigates to another `:id`); `switchMap` keeps only the latest id. */
  readonly loadSupplier$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SUPPLIER_DETAILS_ACTIONS.loadSupplier),
      switchMap(({ supplierId }) =>
        this.suppliersApi.getSupplier(supplierId).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(SUPPLIER_DETAILS_ACTIONS.loadSupplierSuccess({ supplier: res.result }));
            }
            const error = res.error ?? new Error('Failed to load supplier.');
            return of(
              SUPPLIER_DETAILS_ACTIONS.loadSupplierFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              SUPPLIER_DETAILS_ACTIONS.loadSupplierFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );
}
