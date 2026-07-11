import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, of, take } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { ReturnsApiService } from '../../services/returns-api.service';
import type { Return } from '../../models/return.entity';
import { ReturnActionFacade, type ReturnTransitionAction } from '../../services/return-action.facade';
import {
  getAvailableReturnActions,
  getPrimaryReturnAction,
  RETURN_ACTION_UI,
  type ReturnActionKey
} from '../../models/return-actions';
import { returnStatusUserLabel } from '../../models/return-status.enum';
import { ReturnDetailsToolbarComponent } from '../../components/return-details-toolbar/return-details-toolbar.component';
import { ReturnDetailsInfoComponent } from '../../components/return-details-info/return-details-info.component';
import { ReturnDetailsLinesComponent } from '../../components/return-details-lines/return-details-lines.component';
import { ReturnProgressComponent } from '../../components/return-progress/return-progress.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-return-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    SkeletonModule,
    ToastModule,
    ReturnDetailsToolbarComponent,
    ReturnDetailsInfoComponent,
    ReturnDetailsLinesComponent,
    ReturnProgressComponent,
    PageHeaderComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './return-details-page.component.html',
  styles: [`
    @keyframes pulse-beat {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--p-primary-400), 0.4); }
      50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(var(--p-primary-400), 0); }
    }
    .pulse-beat {
      animation: pulse-beat 1.5s ease-in-out infinite;
    }
  `]
})
export class ReturnDetailsPageComponent {
  readonly currencyCode = 'EGP' as const;
  private readonly returnsApi = inject(ReturnsApiService);
  private readonly returnActionFacade = inject(ReturnActionFacade);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly returnId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  readonly actionSaving = signal(false);

  readonly returnResource = rxResource<Return | null, string>({
    params: () => this.returnId(),
    defaultValue: null,
    stream: ({ params: id }) => {
      if (!id) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Missing return id.' });
        return of(null);
      }
      return this.returnsApi.getReturn(id).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return null;
          }
          return res.result;
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(null);
        })
      );
    }
  });

  readonly displayReturn = linkedSignal({
    source: () => this.returnResource.value(),
    computation: (ret) => (ret ? { ...ret } : null)
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
    this.confirmationService.confirm({
      header: 'Confirm Action',
      message: `Are you sure you want to ${meta.label.replace(/[^a-zA-Z ]/g, '').trim().toLowerCase()} this return?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: meta.label, severity: meta.severity },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => this.executeAction(action)
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
        finalize(() => this.actionSaving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add(presentApiError(res.error).toast);
            return;
          }
          this.displayReturn.set(res.result);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${this.returnActionFacade.meta(action).label} action completed.`
          });
        },
        error: (err: unknown) => {
          this.messageService.add(presentApiError(err).toast);
        }
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
