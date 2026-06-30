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
  ORDER_ACTION_UI,
  orderStatusLabel,
  type OrderActionKey
} from '../../models/order-actions';
import { orderToUiOrder } from '../../models/order-ui.mapper';
import { OrderActionFacade, type OrderTransitionAction } from '../../services/order-action.facade';
import { OrderDetailsLineItemsTabComponent } from '../../components/order-details-line-items-tab/order-details-line-items-tab.component';
import { OrderDetailsOverviewTabComponent } from '../../components/order-details-overview-tab/order-details-overview-tab.component';
import { OrderDetailsPaymentTabComponent } from '../../components/order-details-payment-tab/order-details-payment-tab.component';
import { OrderDetailsReturnItemsTabComponent } from '../../components/order-details-return-items-tab/order-details-return-items-tab.component';
import { OrderSummaryCardComponent } from '../../components/order-summary-card/order-summary-card.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import type { Order } from '../../models/order.entity';
import type { UiOrder } from '../../models/order-ui.model';
import { OrdersApiService } from '../../services/orders-api.service';

const TAB_SLUGS = ['overview', 'lineItems', 'returnItems', 'payment'] as const;

function tabSlugToIndex(tab: string | null): number | null {
  if (tab === 'lineItems') return 1;
  if (tab === 'returnItems') return 2;
  if (tab === 'payment') return 3;
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
    OrderDetailsReturnItemsTabComponent,
    OrderSummaryCardComponent,
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

  private readonly tabQuery = toSignal(
    this.route.queryParamMap.pipe(map((m) => m.get('tab'))),
    { initialValue: this.route.snapshot.queryParamMap.get('tab') }
  );

  readonly actionSaving = signal(false);

  /** Tab index: 0 = overview, 1 = lineItems, 2 = returnItems, 3 = payment. */
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

  readonly ORDER_ACTION_UI = ORDER_ACTION_UI;
  readonly canEditOrder = canEditOrder;
  readonly orderStatusLabel = orderStatusLabel;

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
      message: `Are you sure you want to ${meta.label.toLowerCase()} this order?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: `Confirm ${meta.label}`, severity: meta.severity },
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
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${this.orderActionFacade.meta(action).label} action completed successfully.`
          });
          this.displayOrder.set(orderToUiOrder(res.result));
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
