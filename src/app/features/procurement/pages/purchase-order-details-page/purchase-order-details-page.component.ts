import { CommonModule, formatDate } from '@angular/common';
import { Component, computed, inject, LOCALE_ID, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, forkJoin, map, Observable, of, take } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TimelineModule } from 'primeng/timeline';

import { formatApiError } from '../../../../core/http/api-error.format';
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStateTransition } from '../../models/purchase-order.entity';
import {
  canEditPurchaseOrder,
  getPurchaseOrderTransitionActions,
  PURCHASE_ORDER_ACTION_UI,
  type PurchaseOrderTransitionAction
} from '../../models/purchase-order-actions';
import { purchaseStateLabel, purchaseStateSeverity } from '../../models/purchase-state.display';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import type { ApiResponse } from '../../../../core/models/api-response';

type PurchaseOrderStateTimelineRow = {
  fromLabel: string;
  toLabel: string;
  severity: ReturnType<typeof purchaseStateSeverity>;
  changedAt: string;
  reason?: string | null;
};

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
    ConfirmDialogModule,
    TimelineModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './purchase-order-details-page.component.html'
})
/** Detail view mirrors API totals: tax and discount are separate `PurchaseOrder` fields. */
export class PurchaseOrderDetailsPageComponent {
  /** Display currency for monetary fields on this page (aligned with procurement UI). */
  readonly currencyCode = 'EGP' as const;

  private readonly api = inject(PurchaseOrdersApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);

  private readonly purchaseOrderId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  readonly loading = signal(true);
  readonly error = signal('');
  readonly purchaseOrder = signal<PurchaseOrder | null>(null);
  /** Resolved catalog names keyed by `productId` when the line item has no `productName`. */
  private readonly productNamesById = signal<ReadonlyMap<string, string>>(new Map());
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

  /** Chronological state transitions (oldest first) for the timeline. */
  readonly stateTimelineEvents = computed((): PurchaseOrderStateTimelineRow[] => {
    const po = this.purchaseOrder();
    const raw = po?.stateHistory;
    if (!raw?.length) {
      return [];
    }
    const sorted = [...raw].sort(
      (a, b) => this.transitionInstantMs(a) - this.transitionInstantMs(b)
    );
    return sorted.map((entry) => ({
        fromLabel: entry?.fromState != null ? purchaseStateLabel(entry.fromState) : '—',
        toLabel: purchaseStateLabel(entry.toState),
        severity: purchaseStateSeverity(entry.toState),
        changedAt: entry.changedAt,
        reason: entry.reason
      }));
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

  /** Optional supplier code for display when the API includes it. */
  supplierCodeLine(po: PurchaseOrder): string | null {
    const code = po.supplier?.supplierCode?.trim();
    return code ? code : null;
  }

  /** Medium date for schedule fields, or an em dash when missing or invalid. */
  formatDateOrDash(value: string | null | undefined): string {
    if (!value?.trim()) {
      return '—';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return '—';
    }
    return formatDate(d, 'medium', this.locale);
  }

  /** Prefer API line `productName`, then catalog lookup, then `productId`. */
  productLineLabel(line: PurchaseOrderItem): string {
    const embedded = line.productName?.trim();
    if (embedded) {
      return embedded;
    }
    return this.productNamesById().get(line.productId) ?? line.productId;
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
          this.resolveProductNames(res.result);
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
    this.productNamesById.set(new Map());

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
          this.resolveProductNames(res.result);
        },
        error: (err: unknown) => {
          const detail = formatApiError(err);
          this.error.set(detail);
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        }
      });
  }

  private transitionInstantMs(e: PurchaseOrderStateTransition): number {
    const t = Date.parse(e.changedAt);
    return Number.isNaN(t) ? 0 : t;
  }

  private resolveProductNames(po: PurchaseOrder): void {
    const items = po.purchaseOrderItems ?? [];
    const uniqueIds = [...new Set(items.map((i) => i.productId))];
    const fromLines = new Map<string, string>();
    for (const id of uniqueIds) {
      const line = items.find((x) => x.productId === id);
      const name = line?.productName?.trim();
      if (name) {
        fromLines.set(id, name);
      }
    }
    const toFetch = uniqueIds.filter((id) => !fromLines.has(id));
    if (toFetch.length === 0) {
      this.productNamesById.set(fromLines);
      return;
    }

    forkJoin(
      toFetch.map((productId) =>
        this.productsApi.getProduct(productId).pipe(
          map((res) => {
            const name =
              res.isSuccess && res.result?.name?.trim() ? res.result.name.trim() : productId;
            return { productId, name };
          }),
          catchError(() => of({ productId, name: productId }))
        )
      )
    )
      .pipe(take(1))
      .subscribe((rows) => {
        const merged = new Map(fromLines);
        for (const { productId, name } of rows) {
          merged.set(productId, name);
        }
        this.productNamesById.set(merged);
      });
  }
}
