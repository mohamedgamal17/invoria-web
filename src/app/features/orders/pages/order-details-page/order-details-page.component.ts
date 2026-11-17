import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import {
  canEditOrder,
  getAvailableOrderActions,
  getBeatingAction,
  ORDER_ACTION_UI,
  type OrderActionKey,
} from '../../models/order-actions';
import { OrderStatus } from '../../models/order.entity';
import { PaymentType } from '../../models/order-payment.enums';
import { OrderDetailsLineItemsTabComponent } from '../../components/order-details-line-items-tab/order-details-line-items-tab.component';
import { OrderDetailsPaymentTabComponent } from '../../components/order-details-payment-tab/order-details-payment-tab.component';
import { OrderDetailsReturnItemsTabComponent } from '../../components/order-details-return-items-tab/order-details-return-items-tab.component';
import { OrderSummaryCardComponent } from '../../components/order-summary-card/order-summary-card.component';
import { OrderProgressComponent } from '../../components/order-progress/order-progress.component';
import { RecordPaymentDialogComponent } from '../../components/record-payment-dialog/record-payment-dialog.component';
import { DetailsSkeletonComponent } from '../../../../shared/ui/details-skeleton/details-skeleton.component';
import { ErrorCardComponent } from '../../../../shared/ui/error-card/error-card.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { DetailsToolbarComponent } from '../../../../shared/ui/details-toolbar/details-toolbar.component';
import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { DEFAULT_CURRENCY_CODE } from '../../../../shared/models/currency';
import type { CompleteOrderRequest } from '../../models/complete-order.request';
import type { AddReturnItemsRequest } from '../../models/add-return-items.request';
import type { RecordOrderPaymentRequest } from '../../models/record-order-payment.request';
import type { OrderTransitionAction } from '../../services/order-action.facade';
import { OrderReturnItemsDialogComponent } from '../../components/order-return-items-dialog/order-return-items-dialog.component';
import { UrlStateService } from '../../../../shared/utils/url-state.service';
import { parseStringEnumTab } from '../../../../shared/navigation/query-param-parsers';
import { ORDER_DETAILS_ACTIONS } from '../../store/order-details/order-details.actions';
import { OrderDetailsTab } from '../../store/order-details/order-details.reducer';
import { orderDetailsSelectors } from '../../store/order-details/order-details.selectors';

/**
 * Smart page (container) for order details. It owns only:
 * - the NgRx state mapping (selectors ? signals),
 * - the URL write adapter (`tab` query param via `replaceUrl`),
 * - presentation glue (dialogs, revision-snapshot comparison, confirmations,
 *   success toasts).
 * The URL *read* side lives in the `store/order-details-url` effects (NgRx
 * Router Store); all API calls live in the `store/order-details` slice.
 */
@Component({
  selector: 'app-order-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    OrderDetailsLineItemsTabComponent,
    OrderDetailsPaymentTabComponent,
    OrderDetailsReturnItemsTabComponent,
    OrderReturnItemsDialogComponent,
    OrderSummaryCardComponent,
    OrderProgressComponent,
    PageHeaderComponent,
    DetailsToolbarComponent,
    RecordPaymentDialogComponent,
    RouterLink,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    DetailsSkeletonComponent,
    ErrorCardComponent,
    DetailsToolbarComponent,
    ToastModule,
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-details-page.component.html',
})
export class OrderDetailsPageComponent {
  readonly currencyCode = DEFAULT_CURRENCY_CODE;
  readonly tabs = OrderDetailsTab;
  private readonly store = inject(Store);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly messageService = inject(MessageService);
  private readonly urlState = inject(UrlStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly orderId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  // --- Details store (order + activeTab + transition requests) --------------
  readonly displayOrder = this.store.selectSignal(orderDetailsSelectors.selectOrder);
  readonly loading = this.store.selectSignal(orderDetailsSelectors.selectIsLoading);
  readonly errorDetail = this.store.selectSignal(orderDetailsSelectors.selectError);
  readonly activeTab = this.store.selectSignal(orderDetailsSelectors.selectActiveTab);
  readonly actionSaving = this.store.selectSignal(orderDetailsSelectors.selectIsSaving);

  private readonly savingSuccessNonce = this.store.selectSignal(
    orderDetailsSelectors.selectSuccessNonce,
  );
  private readonly lastAction = this.store.selectSignal(orderDetailsSelectors.selectLastAction);
  private readonly paymentSuccessNonce = this.store.selectSignal(
    orderDetailsSelectors.selectPaymentSuccessNonce,
  );

  // --- View-only signals ----------------------------------------------------
  readonly paymentDialogVisible = signal(false);
  readonly showCompleteOptionDialog = signal(false);
  readonly showReturnDialogOnComplete = signal(false);
  readonly returnSaving = signal(false);
  readonly paymentSaving = this.store.selectSignal(orderDetailsSelectors.selectIsPaymentSaving);

  readonly error = computed<string>(() => {
    if (!this.orderId()) return 'Missing order id.';
    if (this.loading()) return '';
    if (!this.displayOrder()) return this.errorDetail() || 'Failed to load order.';
    return '';
  });

  readonly availableActions = computed(() => {
    const order = this.displayOrder();
    if (!order) return [];
    return getAvailableOrderActions(order).filter(
      (action) => action !== 'edit' && action !== 'returnItems',
    );
  });

  readonly canRecordPayment = computed(() => {
    const order = this.displayOrder();
    return (
      !!order &&
      order.status === OrderStatus.Completed &&
      order.paymentType !== undefined &&
      order.paymentType !== null &&
      (order.amountOutstanding ?? 0) > 0.005
    );
  });

  private readonly revisionSnapshotKey = computed(
    () => `order_revision_snapshot_${this.orderId()}`,
  );

  readonly hasBeenEdited = computed(() => {
    const order = this.displayOrder();
    if (!order || order.status !== OrderStatus.Revision) return false;

    try {
      const raw = sessionStorage.getItem(this.revisionSnapshotKey());
      if (!raw) return false;
      const snapshot = JSON.parse(raw);

      if (order.netOfTotalOrderAmount !== snapshot.netOfTotalOrderAmount) return true;
      if (order.customerName !== snapshot.customerName) return true;
      if (order.items.length !== snapshot.items.length) return true;
      return order.items.some((item, index) => {
        const snapshotItem = snapshot.items[index];
        return (
          !snapshotItem ||
          item.quantity !== snapshotItem.quantity ||
          item.price !== snapshotItem.price
        );
      });
    } catch {
      return false;
    }
  });

  readonly returnSummary = computed(() => {
    const order = this.displayOrder();
    if (!order || order.status !== OrderStatus.Completed || !order.returnItems?.length) return null;
    return {
      count: order.returnItems.length,
      total: order.returnsTotal,
      returnId: order.returnId,
    };
  });

  readonly pulseTarget = computed(() => {
    const order = this.displayOrder();
    if (!order) return null;
    if (order.status === OrderStatus.Revision) {
      return this.hasBeenEdited() ? 'accept' : 'edit';
    }
    return getBeatingAction(order);
  });

  readonly canEdit = computed(() => {
    const order = this.displayOrder();
    return !!order && canEditOrder(order);
  });

  readonly actionUi = ORDER_ACTION_UI;

  constructor() {
    // Trigger the details state module whenever the `:id` param changes.
    effect(() => {
      const id = this.orderId();
      if (!id) {
        return;
      }
      untracked(() => this.store.dispatch(ORDER_DETAILS_ACTIONS.loadOrder({ orderId: id })));
    });

    effect(() => {
      const order = this.displayOrder();
      const key = this.revisionSnapshotKey();
      if (!order || !key) return;

      if (order.status === OrderStatus.Revision) {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(
            key,
            JSON.stringify({
              items: order.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
              })),
              netOfTotalOrderAmount: order.netOfTotalOrderAmount,
              customerName: order.customerName,
            }),
          );
        }
      } else {
        sessionStorage.removeItem(key);
      }
    });

    // Success presentation replay: once per `recordActionSuccess`.
    let presentedNonce = -1;
    effect(() => {
      const nonce = this.savingSuccessNonce();
      if (nonce === presentedNonce) {
        return;
      }
      presentedNonce = nonce;
      if (nonce === 0) {
        return;
      }
      const action = untracked(this.lastAction);
      if (action === 'complete') {
        this.showCompleteSuccess();
      } else if (action) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${ORDER_ACTION_UI[action].label} action completed.`,
        });
      }
    });

    // Payment success presentation: toast + close the record-payment dialog.
    let presentedPaymentNonce = -1;
    effect(() => {
      const nonce = this.paymentSuccessNonce();
      if (nonce === presentedPaymentNonce) {
        return;
      }
      presentedPaymentNonce = nonce;
      if (nonce === 0) {
        return;
      }
      this.paymentDialogVisible.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Payment recorded successfully.',
      });
    });
  }

  backToList(): void {
    void this.router.navigate(['/orders']);
  }

  goToReturn(returnId: string): void {
    void this.router.navigate(['/returns', returnId]);
  }

  goToEdit(): void {
    const order = this.displayOrder();
    if (!order || !canEditOrder(order)) return;
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onRecordPayment(): void {
    const order = this.displayOrder();
    if (!order) return;
    this.store.dispatch(ORDER_DETAILS_ACTIONS.setActiveTab({ activeTab: OrderDetailsTab.Payment }));
    setTimeout(() => this.paymentDialogVisible.set(true));
  }

  recordPayment(request: RecordOrderPaymentRequest): void {
    const id = this.orderId();
    if (!id) return;
    this.store.dispatch(ORDER_DETAILS_ACTIONS.recordPayment({ orderId: id, body: request }));
  }

  onAction(action: OrderActionKey): void {
    if (action === 'edit' || action === 'returnItems') return;

    if (action === 'complete') {
      this.showCompleteOptionDialog.set(true);
      return;
    }

    const meta = ORDER_ACTION_UI[action as OrderTransitionAction];
    this.confirmDialog
      .confirm({
        header: 'Confirm Action',
        message: `Are you sure you want to ${meta.label
          .replace(/[^a-zA-Z ]/g, '')
          .trim()
          .toLowerCase()} this order?`,
        severity: meta.severity,
        acceptLabel: meta.label,
      })
      .subscribe((accepted) => {
        if (accepted) {
          this.recordAction(action as OrderTransitionAction);
        }
      });
  }

  onCompleteIncludeReturns(): void {
    this.showCompleteOptionDialog.set(false);
    this.showReturnDialogOnComplete.set(true);
  }

  onCompleteWithoutReturns(): void {
    this.showCompleteOptionDialog.set(false);
    this.recordAction('complete');
  }

  retry(): void {
    this.loadOrder();
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const next =
      parseStringEnumTab(OrderDetailsTab, value, {
        overview: OrderDetailsTab.Summary,
        '': OrderDetailsTab.Summary,
      }) ?? OrderDetailsTab.Summary;
    this.store.dispatch(ORDER_DETAILS_ACTIONS.setActiveTab({ activeTab: next }));
    void this.urlState.replaceQueryParams(this.route, { tab: next });
  }

  loadOrder(): void {
    const id = this.orderId();
    if (!id) return;
    this.store.dispatch(ORDER_DETAILS_ACTIONS.refreshOrder({ orderId: id }));
  }

  onReturnSubmitComplete(request: AddReturnItemsRequest): void {
    this.showReturnDialogOnComplete.set(false);
    this.recordAction('complete', { ReturnItems: request.Items });
  }

  onReturnDialogCancel(): void {
    this.showReturnDialogOnComplete.set(false);
  }

  private recordAction(action: OrderTransitionAction, body?: CompleteOrderRequest): void {
    const id = this.orderId();
    if (!id) return;
    this.store.dispatch(ORDER_DETAILS_ACTIONS.recordAction({ action, orderId: id, body }));
  }

  private showCompleteSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Order Completed!',
      detail: 'The order has been delivered successfully!',
    });
  }
}
