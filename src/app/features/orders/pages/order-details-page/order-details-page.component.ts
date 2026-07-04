import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, linkedSignal, signal, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, of, take } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import {
  canEditOrder,
  getAvailableOrderActions,
  getBeatingAction,
  ORDER_ACTION_UI,
  orderStatusLabel,
  orderStatusEmoji,
  orderStatusUserLabel,
  type OrderActionKey
} from '../../models/order-actions';
import { OrderStatus } from '../../models/order.entity';
import { orderToUiOrder } from '../../models/order-ui.mapper';
import { OrderActionFacade, type OrderTransitionAction } from '../../services/order-action.facade';
import { OrderDetailsLineItemsTabComponent } from '../../components/order-details-line-items-tab/order-details-line-items-tab.component';
import { OrderDetailsOverviewTabComponent } from '../../components/order-details-overview-tab/order-details-overview-tab.component';
import { OrderDetailsPaymentTabComponent } from '../../components/order-details-payment-tab/order-details-payment-tab.component';
import { OrderSummaryCardComponent } from '../../components/order-summary-card/order-summary-card.component';
import { OrderProgressComponent } from '../../components/order-progress/order-progress.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import type { Order } from '../../models/order.entity';
import type { UiOrder } from '../../models/order-ui.model';
import { OrdersApiService } from '../../services/orders-api.service';

const TAB_SLUGS = ['overview', 'lineItems', 'payment'] as const;

function tabSlugToIndex(tab: string | null): number | null {
  if (tab === 'lineItems') return 1;
  if (tab === 'payment') return 2;
  if (tab === 'overview' || tab === null || tab === '') return 0;
  return null;
}

function indexToTabSlug(index: number): string {
  return TAB_SLUGS[index] ?? 'overview';
}

@Component({
  selector: 'app-order-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    OrderDetailsLineItemsTabComponent,
    OrderDetailsOverviewTabComponent,
    OrderDetailsPaymentTabComponent,
    OrderSummaryCardComponent,
    OrderProgressComponent,
    PageHeaderComponent,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    SkeletonModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './order-details-page.component.html',
  styles: [`
    @keyframes pulse-beat {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--p-primary-400), 0.4); }
      50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(var(--p-primary-400), 0); }
    }
    .pulse-beat {
      animation: pulse-beat 1.5s ease-in-out infinite;
    }
    @keyframes confetti-fall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
    }
    .confetti-piece {
      position: fixed;
      width: 8px;
      height: 8px;
      border-radius: 2px;
      animation: confetti-fall 1.5s ease-out forwards;
      z-index: 9999;
      pointer-events: none;
    }
  `]
})
export class OrderDetailsPageComponent {
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

  private readonly tabQuery = toSignal(
    this.route.queryParamMap.pipe(map((m) => m.get('tab'))),
    { initialValue: this.route.snapshot.queryParamMap.get('tab') }
  );

  readonly actionSaving = signal(false);
  readonly activeTab = signal(0);

  readonly orderResource = rxResource<UiOrder | null, string>({
    params: () => this.orderId(),
    defaultValue: null,
    stream: ({ params: id }) => {
      if (!id) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Missing order id.' });
        return of(null);
      }
      return this.ordersApi.getOrder(id).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return null;
          }
          return orderToUiOrder(res.result);
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(null);
        })
      );
    }
  });

  readonly displayOrder = linkedSignal({
    source: () => this.orderResource.value(),
    computation: (order) => (order ? { ...order } : null)
  });

  readonly error = computed<string>(() => {
    if (!this.orderId()) return 'Missing order id.';
    if (this.orderResource.isLoading()) return '';
    if (!this.displayOrder()) return 'Failed to load order.';
    return '';
  });

  readonly availableActions = computed(() => {
    const order = this.displayOrder();
    if (!order) return [];
    return getAvailableOrderActions(order).filter((action) => action !== 'edit');
  });

  private readonly revisionSnapshotKey = computed(
    () => `order_revision_snapshot_${this.orderId()}`
  );

  readonly hasBeenEdited = computed(() => {
    const order = this.displayOrder();
    if (!order || order.status !== OrderStatus.Revision) return false;

    try {
      const raw = sessionStorage.getItem(this.revisionSnapshotKey());
      if (!raw) return false;
      const snapshot = JSON.parse(raw);

      if (order.totalAmount !== snapshot.totalAmount) return true;
      if (order.netOfTotalOrderAmount !== snapshot.netOfTotalOrderAmount) return true;
      if (order.customerName !== snapshot.customerName) return true;
      if (order.items.length !== snapshot.items.length) return true;
      return order.items.some((item, i) => {
        const s = snapshot.items[i];
        return !s || item.quantity !== s.quantity || item.price !== s.price;
      });
    } catch {
      return false;
    }
  });

  readonly pulseTarget = computed(() => {
    const order = this.displayOrder();
    if (!order) return null;
    if (order.status === OrderStatus.Revision) {
      return this.hasBeenEdited() ? 'accept' : 'edit';
    }
    return getBeatingAction(order);
  });

  readonly ORDER_ACTION_UI = ORDER_ACTION_UI;
  readonly canEditOrder = canEditOrder;
  readonly orderStatusLabel = orderStatusLabel;
  readonly orderStatusEmoji = orderStatusEmoji;
  readonly orderStatusUserLabel = orderStatusUserLabel;

  constructor() {
    effect(() => {
      const tab = this.tabQuery();
      const loaded = this.displayOrder();
      if (!loaded || this.orderResource.isLoading()) {
        return;
      }
      untracked(() => {
        const idx = tabSlugToIndex(tab);
        if (idx !== null && this.activeTab() !== idx) {
          this.activeTab.set(idx);
        }
      });
    });

    effect(() => {
      const order = this.displayOrder();
      const key = this.revisionSnapshotKey();
      if (!order || !key) return;

      if (order.status === OrderStatus.Revision) {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, JSON.stringify({
            items: order.items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
            totalAmount: order.totalAmount,
            netOfTotalOrderAmount: order.netOfTotalOrderAmount,
            customerName: order.customerName
          }));
        }
      } else {
        sessionStorage.removeItem(key);
      }
    });
  }

  backToList(): void {
    void this.router.navigate(['/orders']);
  }

  goToEdit(): void {
    const order = this.displayOrder();
    if (!order || !canEditOrder(order)) return;
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onAction(action: OrderActionKey): void {
    if (action === 'edit' || action === 'returnItems') return;
    const meta = this.orderActionFacade.meta(action as OrderTransitionAction);

    this.confirmationService.confirm({
      header: 'Confirm Action',
      message: `Are you sure you want to ${meta.label.replace(/[^a-zA-Z ]/g, '').trim().toLowerCase()} this order?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: meta.label, severity: meta.severity },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => this.executeAction(action)
    });
  }

  retry(): void {
    this.orderResource.reload();
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const n = typeof value === 'number' ? value : Number(value);
    const next = Number.isFinite(n) ? n : 0;
    this.activeTab.set(next);
    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: { tab: indexToTabSlug(next) }
    });
  }

  onReturnItemsRecorded(event: { result: Order }): void {
    this.displayOrder.set(orderToUiOrder(event.result));
  }

  loadOrder(): void {
    this.orderResource.reload();
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
          const completed = action === 'complete';
          this.messageService.add({
            severity: 'success',
            summary: completed ? 'Order Completed!' : 'Success',
            detail: completed
              ? 'The order has been delivered successfully!'
              : `${this.orderActionFacade.meta(action).label} action completed.`
          });
          this.displayOrder.set(orderToUiOrder(res.result));
          if (completed) {
            this.spawnConfetti();
          }
        },
        error: (err: unknown) => {
          this.messageService.add(presentApiError(err).toast);
        }
      });
  }

  private spawnConfetti(): void {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#03a9f4', '#009688', '#8bc34a', '#ffeb3b', '#ff9800'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = '40vh';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (1 + Math.random() * 1) + 's';
      el.style.animationDelay = (Math.random() * 0.5) + 's';
      el.style.width = (4 + Math.random() * 8) + 'px';
      el.style.height = (4 + Math.random() * 8) + 'px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }
  }

  private showApiError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
    if (presentation.routeTarget) {
      void this.router.navigate([presentation.routeTarget]);
    }
  }
}
