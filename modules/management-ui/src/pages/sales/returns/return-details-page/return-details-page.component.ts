import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, of, take } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';

import { presentApiError } from '@invoria/core';
import { ReturnsApiService } from '@invoria/sales/returns/services/returns-api.service';
import type { Return } from '@invoria/sales/returns/models/return.entity';
import {
  ReturnActionFacade,
  type ReturnTransitionAction,
} from '@invoria/sales/returns/services/return-action.facade';
import {
  getAvailableReturnActions,
  getPrimaryReturnAction,
  RETURN_ACTION_UI,
  type ReturnActionKey,
} from '@invoria/sales/returns/models/return-actions';
import { returnStatusUserLabel } from '@invoria/sales/returns/models/return-status.enum';
import { DetailsToolbarComponent } from '@invoria/ui';
import { DetailsSkeletonComponent } from '@invoria/ui';
import { ErrorCardComponent } from '@invoria/ui';
import { ReturnDetailsInfoComponent } from '@invoria/sales/returns/components/return-details-info/return-details-info.component';
import { ReturnDetailsLinesComponent } from '@invoria/sales/returns/components/return-details-lines/return-details-lines.component';
import { ReturnProgressComponent } from '@invoria/sales/returns/components/return-progress/return-progress.component';
import { PageHeaderComponent } from '@invoria/ui';
import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';
import { ConfirmDialogService } from '@invoria/ui';

@Component({
  selector: 'app-return-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    DetailsSkeletonComponent,
    ErrorCardComponent,
    ToastModule,
    DetailsToolbarComponent,
    ReturnDetailsInfoComponent,
    ReturnDetailsLinesComponent,
    ReturnProgressComponent,
    PageHeaderComponent,
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './return-details-page.component.html',
})
export class ReturnDetailsPageComponent {
  readonly currencyCode = DEFAULT_CURRENCY_CODE;
  private readonly returnsApi = inject(ReturnsApiService);
  private readonly returnActionFacade = inject(ReturnActionFacade);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly returnId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  readonly actionSaving = signal(false);

  readonly returnResource = rxResource<Return | null, string>({
    params: () => this.returnId(),
    defaultValue: null,
    stream: ({ params: id }) => {
      if (!id) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Missing return id.',
        });
        return of(null);
      }
      return this.returnsApi.getReturn(id).pipe(
        map((response) => {
          if (!response.isSuccess || !response.result) {
            this.showApiError(response.error);
            return null;
          }
          return response.result;
        }),
        catchError((error: unknown) => {
          this.showApiError(error);
          return of(null);
        }),
      );
    },
  });

  readonly displayReturn = linkedSignal({
    source: () => this.returnResource.value(),
    computation: (returnedOrder) => (returnedOrder ? { ...returnedOrder } : null),
  });

  readonly error = computed<string>(() => {
    if (!this.returnId()) return 'Missing return id.';
    if (this.returnResource.isLoading()) return '';
    if (!this.displayReturn()) return 'Failed to load return.';
    return '';
  });

  readonly availableActions = computed(() => {
    const ret = this.displayReturn();
    if (!ret) return [];
    return getAvailableReturnActions(ret);
  });

  readonly pulseTarget = computed(() => {
    const ret = this.displayReturn();
    if (!ret) return null;
    return getPrimaryReturnAction(ret);
  });

  readonly RETURN_ACTION_UI = RETURN_ACTION_UI;
  readonly returnStatusUserLabel = returnStatusUserLabel;

  backToList(): void {
    void this.router.navigate(['/returns']);
  }

  onAction(action: ReturnActionKey): void {
    const meta = this.returnActionFacade.meta(action);
    this.confirmDialog
      .confirm({
        header: 'Confirm Action',
        message: `Are you sure you want to ${meta.label
          .replace(/[^a-zA-Z ]/g, '')
          .trim()
          .toLowerCase()} this return?`,
        severity: meta.severity,
        acceptLabel: meta.label,
      })
      .subscribe((accepted) => {
        if (accepted) {
          this.executeAction(action);
        }
      });
  }

  retry(): void {
    this.returnResource.reload();
  }

  private executeAction(action: ReturnTransitionAction): void {
    const id = this.returnId();
    if (!id) return;

    this.actionSaving.set(true);
    this.returnActionFacade
      .execute(action, id)
      .pipe(
        take(1),
        finalize(() => this.actionSaving.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (!response.isSuccess || !response.result) {
            this.messageService.add(presentApiError(response.error).toast);
            return;
          }
          this.displayReturn.set(response.result);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${this.returnActionFacade.meta(action).label} action completed.`,
          });
        },
        error: (error: unknown) => {
          this.messageService.add(presentApiError(error).toast);
        },
      });
  }

  private showApiError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
    if (presentation.routeTarget) {
      void this.router.navigate([presentation.routeTarget]);
    }
  }
}
