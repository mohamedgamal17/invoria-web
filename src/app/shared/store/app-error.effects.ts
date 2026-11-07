import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { presentApiError } from '../../core/http/api-error.presenter';
import { APP_ERROR_ACTIONS } from './app-error.actions';

/**
 * Root-level error presentation. Lives in the app injector (see
 * `app.config.ts`) so it can inject the shared `MessageService` and present
 * one toast/navigation per failed API interaction — regardless of which
 * feature or store produced the error.
 */
@Injectable()
export class AppErrorEffects {
  private readonly actions$ = inject(Actions);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly presentError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(APP_ERROR_ACTIONS.apiError),
        tap(({ error }) => {
          const presentation = presentApiError(error);
          this.messageService.add(presentation.toast);
          if (presentation.routeTarget) {
            void this.router.navigate([presentation.routeTarget]);
          }
        }),
      ),
    { dispatch: false },
  );
}
