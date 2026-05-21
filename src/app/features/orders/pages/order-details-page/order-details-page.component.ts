import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { presentApiError } from '../../../../core/http/api-error.presenter';
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
import { OrderDetailsHistoryTabComponent } from '../../components/order-details-history-tab/order-details-history-tab.component';
import { OrderDetailsLineItemsTabComponent } from '../../components/order-details-line-items-tab/order-details-line-items-tab.component';
import { OrderDetailsOverviewTabComponent } from '../../components/order-details-overview-tab/order-details-overview-tab.component';
import { OrderDetailsPaymentTabComponent } from '../../components/order-details-payment-tab/order-details-payment-tab.component';
import { OrderReasonDialogComponent } from '../../components/order-reason-dialog/order-reason-dialog.component';
import { OrderStatus } from '../../models/order.entity';
import {
  PaymentStatus,
  PaymentType,
  paymentStatusLabel,
  paymentTypeLabel
} from '../../models/order-payment.enums';
import type { UiOrder, UiOrderFailureDetailRow } from '../../models/order-ui.model';

const PAYMENT_SUMMARY_EPS = 0.02;
import { OrdersApiService } from '../../services/orders-api.service';

@Component({
  selector: 'app-order-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    OrderDetailsHistoryTabComponent,
    OrderDetailsLineItemsTabComponent,
    OrderDetailsOverviewTabComponent,
    OrderDetailsPaymentTabComponent,
    OrderReasonDialogComponent,
    TagModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
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

  /** Active tab index: 0 Overview, 1 Line items, 2 Payment, 3 History. */
  readonly activeTab = signal(0);

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

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const n = typeof value === 'number' ? value : Number(value);
    this.activeTab.set(Number.isFinite(n) ? n : 0);
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

  statusSeverity(
    status: string
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'ACCEPTED':
        return 'info';
      case 'SHIPPED':
        return 'contrast';
      case 'REOPENED':
        return 'warn';
      case 'CANCELLED':
      case 'REFUSED':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  paymentTypeDisplay(type: PaymentType | undefined): string {
    return type !== undefined ? paymentTypeLabel(type) : '—';
  }

  paymentStatusDisplay(status: PaymentStatus | undefined): string {
    return status !== undefined ? paymentStatusLabel(status) : '—';
  }

  getPaymentStatusSeverity(
    status: PaymentStatus | undefined
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
    if (status === undefined) return 'secondary';
    switch (status) {
      case PaymentStatus.Paid:
        return 'success';
      case PaymentStatus.Partial:
        return 'warn';
      case PaymentStatus.Unpaid:
      default:
        return 'secondary';
    }
  }

  getPaymentTypeSeverity(type: PaymentType | undefined): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
    if (type === undefined) return 'secondary';
    switch (type) {
      case PaymentType.Immediate:
        return 'info';
      case PaymentType.Debt:
        return 'warn';
      default:
        return 'secondary';
    }
  }

  paidPercentOfTotal(order: UiOrder): number | null {
    if (
      order.amountPaid === undefined ||
      order.amountPaid === null ||
      !Number.isFinite(order.totalAmount) ||
      order.totalAmount <= 0
    ) {
      return null;
    }
    return (order.amountPaid / order.totalAmount) * 100;
  }

  paymentTotalsAligned(order: UiOrder): boolean {
    if (order.amountPaid == null || order.amountOutstanding == null) {
      return true;
    }
    return Math.abs(order.amountPaid + order.amountOutstanding - order.totalAmount) <= PAYMENT_SUMMARY_EPS;
  }

  orderStatusLabel = orderStatusLabel;
  friendlyFullfillmentStatusLabel = friendlyFullfillmentStatusLabel;
  ORDER_ACTION_UI = ORDER_ACTION_UI;
  canEditOrder = canEditOrder;

  loadOrder(): void {
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
            const presentation = presentApiError(res.error);
            const detail = presentation.toast.detail ?? 'Failed to load order.';
            this.error.set(detail);
            this.order.set(null);
            this.messageService.add(presentation.toast);
            if (presentation.routeTarget) {
              void this.router.navigate([presentation.routeTarget]);
            }
            return;
          }
          this.order.set(orderToUiOrder(res.result));
        },
        error: (err: unknown) => {
          const presentation = presentApiError(err);
          const detail = presentation.toast.detail ?? 'Failed to load order.';
          this.error.set(detail);
          this.order.set(null);
          this.messageService.add(presentation.toast);
          if (presentation.routeTarget) {
            void this.router.navigate([presentation.routeTarget]);
          }
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
            this.messageService.add(presentApiError(res.error).toast);
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
          this.messageService.add(presentApiError(err).toast);
        }
      });
  }

  private actionToOrderStatus(action: OrderTransitionAction): OrderStatus {
    switch (action) {
      case 'accept':
        return OrderStatus.Accepted;
      case 'dispatch':
        return OrderStatus.Accepted;
      case 'ship':
        return OrderStatus.Shipped;
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
