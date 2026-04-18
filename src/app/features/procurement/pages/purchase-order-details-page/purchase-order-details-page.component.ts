import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, Observable, take } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { formatApiError } from '../../../../core/http/api-error.format';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import {
  canEditPurchaseOrder,
  getPurchaseOrderTransitionActions,
  PURCHASE_ORDER_ACTION_UI,
  type PurchaseOrderTransitionAction
} from '../../models/purchase-order-actions';
import { purchaseStateLabel, purchaseStateSeverity } from '../../models/purchase-state.display';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import type { ApiResponse } from '../../../../core/models/api-response';

@Component({
  selector: 'app-purchase-order-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    ToastModule,
    TagModule,
    TableModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './purchase-order-details-page.component.html'
})
export class PurchaseOrderDetailsPageComponent {
  private readonly api = inject(PurchaseOrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly purchaseOrderId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  readonly loading = signal(true);
  readonly error = signal('');
  readonly purchaseOrder = signal<PurchaseOrder | null>(null);
  readonly transitionInProgress = signal(false);

  readonly stateLabel = purchaseStateLabel;
  readonly stateSeverity = purchaseStateSeverity;
  readonly actionUi = PURCHASE_ORDER_ACTION_UI;

  readonly availableTransitions = computed(() => {
    const po = this.purchaseOrder();
    if (!po) {
      return [];
    }
    return getPurchaseOrderTransitionActions(po.state);
  });

  readonly canEdit = computed(() => {
    const po = this.purchaseOrder();
    return po ? canEditPurchaseOrder(po.state) : false;
  });

  constructor() {
    this.loadPurchaseOrder();
  }

  backToList(): void {
    void this.router.navigate(['/dashboard', 'procurement']);
  }

  retry(): void {
    this.loadPurchaseOrder();
  }

  goToEdit(): void {
    if (!this.canEdit()) {
      return;
    }
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onTransition(action: PurchaseOrderTransitionAction): void {
    const id = this.purchaseOrderId();
    if (!id || this.transitionInProgress()) {
      return;
    }

    const run = () => this.invokeTransition(id, action);

    if (action === 'submit' || action === 'approve') {
      run();
      return;
    }

    const messages: Record<
      PurchaseOrderTransitionAction,
      { header: string; message: string; acceptClass?: string } | null
    > = {
      submit: null,
      approve: null,
      reject: {
        header: 'Reject purchase order',
        message: 'Reject this purchase order? It will be marked as rejected.',
        acceptClass: 'p-button-danger'
      },
      cancel: {
        header: 'Cancel purchase order',
        message: 'Cancel this purchase order?',
        acceptClass: 'p-button-danger'
      },
      complete: {
        header: 'Complete purchase order',
        message: 'Mark this purchase order as completed?'
      },
      reopen: {
        header: 'Reopen purchase order',
        message: 'Reopen this purchase order for changes?'
      }
    };

    const cfg = messages[action];
    if (!cfg) {
      run();
      return;
    }

    this.confirmationService.confirm({
      header: cfg.header,
      message: cfg.message,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: cfg.acceptClass,
      rejectButtonStyleClass: 'p-button-text',
      accept: run
    });
  }

  supplierLine(po: PurchaseOrder): string {
    const name = po.supplier?.name?.trim();
    if (name) {
      return name;
    }
    return po.supplierId;
  }

  private invokeTransition(id: string, action: PurchaseOrderTransitionAction): void {
    const req$ = this.transitionRequest(id, action);
    this.transitionInProgress.set(true);
    req$
      .pipe(
        take(1),
        finalize(() => this.transitionInProgress.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            const detail = formatApiError(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return;
          }
          this.purchaseOrder.set(res.result);
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Purchase order state was updated.'
          });
        },
        error: (err: unknown) => {
          const detail = formatApiError(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        }
      });
  }

  private transitionRequest(
    id: string,
    action: PurchaseOrderTransitionAction
  ): Observable<ApiResponse<PurchaseOrder>> {
    switch (action) {
      case 'submit':
        return this.api.submitPurchaseOrder(id);
      case 'approve':
        return this.api.approvePurchaseOrder(id);
      case 'reject':
        return this.api.rejectPurchaseOrder(id);
      case 'cancel':
        return this.api.cancelPurchaseOrder(id);
      case 'complete':
        return this.api.completePurchaseOrder(id);
      case 'reopen':
        return this.api.reopenPurchaseOrder(id);
    }
  }

  private loadPurchaseOrder(idParam?: string): void {
    const id = idParam ?? this.purchaseOrderId();
    if (!id) {
      this.loading.set(false);
      this.error.set('Missing purchase order id.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.api
      .getPurchaseOrder(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            const detail = formatApiError(res.error);
            this.error.set(detail);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return;
          }
          this.purchaseOrder.set(res.result);
        },
        error: (err: unknown) => {
          const detail = formatApiError(err);
          this.error.set(detail);
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        }
      });
  }
}
