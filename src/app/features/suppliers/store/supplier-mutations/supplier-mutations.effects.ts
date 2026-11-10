import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { catchError, exhaustMap, mergeMap, of, tap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { SUPPLIERS_LIST_ACTIONS } from '../suppliers-list/suppliers-list.actions';
import { SuppliersApiService } from '../../services/suppliers-api.service';
import { SUPPLIER_MUTATIONS_ACTIONS } from './supplier-mutations.actions';

/**
 * Store-owned create/update mutations for the supplier form page. Success
 * dispatches the local list-sync actions so the suppliers list (provided on
 * the same parent route) folds the returned entity in without refetching;
 * API errors are presented by the global `AppErrorEffects`.
 */
@Injectable()
export class SupplierMutationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly createSupplier$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SUPPLIER_MUTATIONS_ACTIONS.createSupplier),
      exhaustMap(({ request }) =>
        this.suppliersApi.createSupplier(request).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(
                SUPPLIER_MUTATIONS_ACTIONS.createSupplierSuccess({ supplier: res.result }),
                SUPPLIERS_LIST_ACTIONS.supplierCreated({ supplier: res.result }),
              );
            }
            const error = res.error ?? new Error('Failed to create the supplier.');
            return of(
              SUPPLIER_MUTATIONS_ACTIONS.createSupplierFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              SUPPLIER_MUTATIONS_ACTIONS.createSupplierFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Success presentation: toast, then land on the details page. */
  readonly presentCreateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SUPPLIER_MUTATIONS_ACTIONS.createSupplierSuccess),
        tap(({ supplier }) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Supplier created successfully.',
          });
          void this.router.navigate(['/suppliers', supplier.id]);
        }),
      ),
    { dispatch: false },
  );

  readonly updateSupplier$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SUPPLIER_MUTATIONS_ACTIONS.updateSupplier),
      exhaustMap(({ id, request }) =>
        this.suppliersApi.updateSupplier(id, request).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(
                SUPPLIER_MUTATIONS_ACTIONS.updateSupplierSuccess({ supplier: res.result }),
                SUPPLIERS_LIST_ACTIONS.supplierUpdated({ supplier: res.result }),
              );
            }
            const error = res.error ?? new Error('Failed to update the supplier.');
            return of(
              SUPPLIER_MUTATIONS_ACTIONS.updateSupplierFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              SUPPLIER_MUTATIONS_ACTIONS.updateSupplierFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Success presentation: toast, then land on the details page. */
  readonly presentUpdateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SUPPLIER_MUTATIONS_ACTIONS.updateSupplierSuccess),
        tap(({ supplier }) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Supplier updated successfully.',
          });
          void this.router.navigate(['/suppliers', supplier.id]);
        }),
      ),
    { dispatch: false },
  );
}
