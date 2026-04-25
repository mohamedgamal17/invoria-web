import { CommonModule, formatDate } from '@angular/common';
import { Component, computed, inject, LOCALE_ID, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, take } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';

import { formatApiError } from '../../../../core/http/api-error.format';
import {
  canEditOrder,
  getAvailableOrderActions,
  ORDER_ACTION_UI,
  orderStatusLabel,
  type OrderActionKey
} from '../../models/order-actions';
import { friendlyFullfillmentStatusLabel } from '../../models/order-actions';
import { orderToUiOrder } from '../../models/order-ui.mapper';
import { OrderActionFacade, type OrderTransitionAction } from '../../services/order-action.facade';
import { OrderReasonDialogComponent } from '../../components/order-reason-dialog/order-reason-dialog.component';
import { OrderStatus } from '../../models/order.entity';
import type { UiOrder, UiOrderFailureDetailRow, UiOrderItem } from '../../models/order-ui.model';
import { OrdersApiService } from '../../services/orders-api.service';

@Component({
  selector: 'app-order-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    OrderReasonDialogComponent,
    TagModule,
    TimelineModule,
    SkeletonModule,
    TableModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './order-details-page.component.html'
})
export class OrderDetailsPageComponent {
  /** Display currency for monetary fields (aligned with procurement UI). */
  readonly currencyCode = 'EGP' as const;

  private readonly ordersApi = inject(OrdersApiService);
  private readonly orderActionFacade = inject(OrderActionFacade);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);

  private readonly orderId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  readonly loading = signal(true);
  readonly error = signal('');
  readonly order = signal<UiOrder | null>(null);
  readonly actionSaving = signal(false);
  readonly reasonModalVisible = signal(false);
  readonly reasonText = signal('');
  readonly reasonTarget = signal<OrderTransitionAction | null>(null);

  readonly availableActions = computed(() => {
    const order = this.order();
    if (!order) return [];
    return getAvailableOrderActions(order).filter((action) => action !== 'edit');
  });

  readonly isFailedOrder = computed(() => {
    const order = this.order();
    if (!order) return false;
    return order.status === OrderStatus.Cancelled || order.status === OrderStatus.Refused;
  });

  readonly failureDetails = computed((): UiOrderFailureDetailRow[] => {
    const order = this.order();
    return order?.failureDetails ?? [];
  });

  readonly reasonTransitionTarget = computed(() => {
    const order = this.order();
    const action = this.reasonTarget();
    if (!order || !action) return null;
    return {
      order,
      state: this.actionToOrderStatus(action)
    };
  });

  constructor() {
    this.loadOrder();
  }

  backToList(): void {
    void this.router.navigate(['../'], { relativeTo: this.route });
  }

  goToEdit(): void {
    const order = this.order();
    if (!order || !canEditOrder(order)) return;
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onAction(action: OrderActionKey): void {
    if (action === 'edit') return;
    const meta = this.orderActionFacade.meta(action);

    if (meta.requiresReason) {
      this.reasonTarget.set(action);
      this.reasonText.set('');
      this.reasonModalVisible.set(true);
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirm Action',
      message: `Are you sure you want to ${meta.label.toLowerCase()} this order?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: `Confirm ${meta.label}`, severity: meta.severity },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => this.executeAction(action)
    });
  }

  retry(): void {
    this.loadOrder();
  }

  submitReasonAction(): void {
    const action = this.reasonTarget();
    if (!action || !this.reasonText().trim()) return;
    this.reasonModalVisible.set(false);
    this.executeAction(action);
  }

  /** Outlined destructive actions (parity with purchase order reject/cancel). */
  actionOutlined(action: OrderActionKey): boolean {
    return action === 'cancel' || action === 'refuse';
  }

  statusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'ACCEPTED':
        return 'info';
      case 'REOPENED':
        return 'warn';
      case 'CANCELLED':
      case 'REFUSED':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  lineTotal(item: UiOrderItem): number {
    return item.price * item.quantity;
  }

  subtotal(o: UiOrder): number {
    return o.items.reduce((acc, item) => acc + this.lineTotal(item), 0);
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

  orderStatusLabel = orderStatusLabel;
  friendlyFullfillmentStatusLabel = friendlyFullfillmentStatusLabel;
  ORDER_ACTION_UI = ORDER_ACTION_UI;
  canEditOrder = canEditOrder;

  private loadOrder(): void {
    const id = this.orderId();
    if (!id) {
      this.loading.set(false);
      this.error.set('Missing order id.');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error() });
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.ordersApi
      .getOrder(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            const detail = formatApiError(res.error);
            this.error.set(detail);
            this.order.set(null);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return;
          }
          this.order.set(orderToUiOrder(res.result));
        },
        error: (err: unknown) => {
          const detail = formatApiError(err);
          this.error.set(detail);
          this.order.set(null);
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        }
      });
  }

  private executeAction(action: OrderTransitionAction): void {
    const id = this.orderId();
    if (!id) return;

    this.actionSaving.set(true);
    this.orderActionFacade
      .execute(action, id)
      .pipe(
        take(1),
        finalize(() => this.actionSaving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(res.error) });
            return;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${this.orderActionFacade.meta(action).label} action completed successfully.`
          });
          this.order.set(orderToUiOrder(res.result));
        },
        error: (err: unknown) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(err) });
        }
      });
  }

  private actionToOrderStatus(action: OrderTransitionAction): OrderStatus {
    switch (action) {
      case 'accept':
        return OrderStatus.Accepted;
      case 'dispatch':
        return OrderStatus.Accepted;
      case 'complete':
        return OrderStatus.Completed;
      case 'cancel':
        return OrderStatus.Cancelled;
      case 'reopen':
        return OrderStatus.Reopened;
      case 'refuse':
        return OrderStatus.Refused;
      default:
        return OrderStatus.Pending;
    }
  }
}
