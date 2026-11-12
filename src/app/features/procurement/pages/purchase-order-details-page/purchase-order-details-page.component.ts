import { CommonModule, formatDate } from '@angular/common';
import { Component, computed, effect, inject, LOCALE_ID, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { UrlStateService } from '../../../../shared/utils/url-state.service';
import { ConfirmDialogService, type ConfirmDialogSeverity } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStateTransition,
} from '../../models/purchase-order.entity';
import {
  canEditPurchaseOrder,
  getPurchaseOrderTransitionActions,
  PURCHASE_ORDER_ACTION_UI,
  type PurchaseOrderTransitionAction,
} from '../../models/purchase-order-actions';
import { purchaseStateLabel, purchaseStateSeverity } from '../../models/purchase-state.display';
import { PURCHASE_ORDERS_MUTATIONS_ACTIONS } from '../../store/purchase-orders-mutations/purchase-orders-mutations.actions';
import { purchaseOrdersMutationsFeature } from '../../store/purchase-orders-mutations/purchase-orders-mutations.reducer';
import { PURCHASE_ORDER_DETAILS_ACTIONS } from '../../store/purchase-order-details/purchase-order-details.actions';
import { PurchaseOrderDetailsTab } from '../../store/purchase-order-details/purchase-order-details.reducer';
import { purchaseOrderDetailsSelectors } from '../../store/purchase-order-details/purchase-order-details.selectors';
import { toPurchaseOrderDetailsTab } from '../../utils/purchase-order-details-tab';
import { PurchaseOrderDetailsOverviewTabComponent } from '../../components/purchase-order-details-overview-tab/purchase-order-details-overview-tab.component';
import { PurchaseOrderDetailsLinesTabComponent } from '../../components/purchase-order-details-lines-tab/purchase-order-details-lines-tab.component';
import {
  PurchaseOrderDetailsHistoryTabComponent,
  type PurchaseOrderStateTimelineRow,
} from '../../components/purchase-order-details-history-tab/purchase-order-details-history-tab.component';

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
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    PurchaseOrderDetailsOverviewTabComponent,
    PurchaseOrderDetailsLinesTabComponent,
    PurchaseOrderDetailsHistoryTabComponent,
  ],
  templateUrl: './purchase-order-details-page.component.html',
})
/**
 * Smart page (container) for purchase order details. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`tab` query param via `replaceUrl`),
 * - presentation glue (navigation, state-transition confirmation dialog).
 * The URL *read* side lives in the `store/purchase-order-details-url` effects
 * (NgRx Router Store); all API calls live in the `store/purchase-order-details`
 * and `store/purchase-orders-mutations` state modules.
 */
/** Detail view mirrors API totals: tax and discount are separate `PurchaseOrder` fields. */
export class PurchaseOrderDetailsPageComponent {
  /** Display currency for monetary fields on this page (aligned with procurement UI). */
  readonly currencyCode = 'EGP' as const;

  readonly tabs = PurchaseOrderDetailsTab;

  private readonly store = inject(Store);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly urlState = inject(UrlStateService);
  private readonly locale = inject(LOCALE_ID);

  // --- Details store (purchase order + activeTab + line-label lookups) ------
  readonly purchaseOrder = this.store.selectSignal(
    purchaseOrderDetailsSelectors.selectPurchaseOrder,
  );
  readonly loading = this.store.selectSignal(purchaseOrderDetailsSelectors.selectIsLoading);
  readonly error = this.store.selectSignal(purchaseOrderDetailsSelectors.selectError);
  readonly activeTab = this.store.selectSignal(purchaseOrderDetailsSelectors.selectActiveTab);
  private readonly productNamesById = this.store.selectSignal(
    purchaseOrderDetailsSelectors.selectProductNamesById,
  );

  // --- Mutations store (state-transition request) ---------------------------
  private readonly transitionRequest = this.store.selectSignal(
    purchaseOrdersMutationsFeature.selectTransitionRequest,
  );
  readonly transitionInProgress = computed(
    () => this.transitionRequest().status === LOAD_STATUS.Loading,
  );

  readonly stateLabel = purchaseStateLabel;
  readonly stateSeverity = purchaseStateSeverity;
  readonly actionUi = PURCHASE_ORDER_ACTION_UI;

  readonly lineLabelFn = (line: PurchaseOrderItem): string => this.productLineLabel(line);

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
      (left, right) => this.transitionInstantMs(left) - this.transitionInstantMs(right),
    );
    return sorted.map((entry) => ({
      fromLabel: entry?.fromState != null ? purchaseStateLabel(entry.fromState) : '—',
      toLabel: purchaseStateLabel(entry.toState),
      severity: purchaseStateSeverity(entry.toState),
      changedAt: entry.changedAt,
      reason: entry.reason,
    }));
  });

  private readonly purchaseOrderId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  constructor() {
    // Trigger the details state module whenever the `:id` param changes.
    effect(() => {
      const id = this.purchaseOrderId();
      if (!id) {
        return;
      }
      untracked(() =>
        this.store.dispatch(
          PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrder({ purchaseOrderId: id }),
        ),
      );
    });
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const next = toPurchaseOrderDetailsTab(value);
    if (next === null) {
      return;
    }
    this.store.dispatch(PURCHASE_ORDER_DETAILS_ACTIONS.setActiveTab({ activeTab: next }));
    void this.urlState.replaceQueryParams(this.route, { tab: next });
  }

  backToList(): void {
    void this.router.navigate(['/procurement']);
  }

  retry(): void {
    const id = untracked(this.purchaseOrderId);
    if (!id) {
      return;
    }
    this.store.dispatch(PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrder({ purchaseOrderId: id }));
  }

  goToEdit(): void {
    if (!this.canEdit()) {
      return;
    }
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onTransition(action: PurchaseOrderTransitionAction): void {
    const id = untracked(this.purchaseOrderId);
    if (!id || this.transitionInProgress()) {
      return;
    }

    const run = () =>
      this.store.dispatch(
        PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrder({ id, action }),
      );

    if (action === 'submit' || action === 'approve') {
      run();
      return;
    }

    const messages: Record<
      PurchaseOrderTransitionAction,
      { header: string; message: string; severity?: ConfirmDialogSeverity } | null
    > = {
      submit: null,
      approve: null,
      reject: {
        header: 'Reject purchase order',
        message: 'Reject this purchase order? It will be marked as rejected.',
        severity: 'danger',
      },
      cancel: {
        header: 'Cancel purchase order',
        message: 'Cancel this purchase order?',
        severity: 'danger',
      },
      complete: {
        header: 'Complete purchase order',
        message: 'Mark this purchase order as completed?',
      },
      reopen: {
        header: 'Reopen purchase order',
        message: 'Reopen this purchase order for changes?',
      },
    };

    const cfg = messages[action];
    if (!cfg) {
      run();
      return;
    }

    this.confirmDialog
      .confirm({
        header: cfg.header,
        message: cfg.message,
        severity: cfg.severity,
      })
      .subscribe((accepted) => {
        if (accepted) {
          run();
        }
      });
  }

  supplierLine(po: PurchaseOrder): string {
    const name = po.supplier?.name?.trim();
    if (name) {
      return name;
    }
    return po.supplierId;
  }

  /** Medium date for schedule fields, or an em dash when missing or invalid. */
  formatDateOrDash(value: string | null | undefined): string {
    if (!value?.trim()) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return formatDate(date, 'medium', this.locale);
  }

  /** Prefer API line `productName`, then catalog lookup, then `productId`. */
  productLineLabel(line: PurchaseOrderItem): string {
    const embedded = line.productName?.trim();
    if (embedded) {
      return embedded;
    }
    return this.productNamesById().get(line.productId) ?? line.productId;
  }

  private transitionInstantMs(transition: PurchaseOrderStateTransition): number {
    const timestamp = Date.parse(transition.changedAt);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
