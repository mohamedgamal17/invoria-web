import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { UrlStateService } from '../../../../shared/utils/url-state.service';
import { PAYABLE_CURRENCY_CODE } from '../../models/payable-currency';
import type { Payable } from '../../models/payable.entity';
import { toPayableDetailsTab } from '../../utils/payable-details-tab';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { PayableDetailsOverviewCardComponent } from '../../components/payable-details-overview-card/payable-details-overview-card.component';
import { PayableSettlementsTabComponent } from '../../components/payable-settlements-tab/payable-settlements-tab.component';
import { PayableSettleModalComponent } from '../../components/payable-settle-modal/payable-settle-modal.component';
import { PAYABLES_MUTATIONS_ACTIONS } from '../../store/payables-mutations/payables-mutations.actions';
import { payablesMutationsFeature } from '../../store/payables-mutations/payables-mutations.reducer';
import { PAYABLE_DETAILS_ACTIONS } from '../../store/payable-details/payable-details.actions';
import { PayableDetailsTab } from '../../store/payable-details/payable-details.reducer';
import { payableDetailsSelectors } from '../../store/payable-details/payable-details.selectors';

/**
 * Smart page (container) for payable details. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`tab` query param via `replaceUrl`),
 * - presentation glue (navigation, settle modal intents).
 * The URL *read* side lives in the `store/payable-details-url` effects
 * (NgRx Router Store); all API calls live in the `store/payable-details`
 * and `store/payables-mutations` state modules, including error
 * presentation (global `AppErrorEffects` toast) and the settle success
 * toast (mutations tap effect).
 */
@Component({
  selector: 'app-payable-details-page',
  standalone: true,
  imports: [
    DatePipe,
    ButtonModule,
    CardModule,
    SkeletonModule,
    ToastModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    PageHeaderComponent,
    PayableDetailsOverviewCardComponent,
    PayableSettlementsTabComponent,
    PayableSettleModalComponent
  ],
  templateUrl: './payable-details-page.component.html'
})
export class PayableDetailsPageComponent {
  readonly tabs = PayableDetailsTab;
  readonly currencyCode = PAYABLE_CURRENCY_CODE;

  private readonly store = inject(Store);
  private readonly urlState = inject(UrlStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // --- Details store (payable + activeTab + settle modal visibility) ---
  readonly payable = this.store.selectSignal(payableDetailsSelectors.selectPayable);
  readonly loading = this.store.selectSignal(payableDetailsSelectors.selectIsLoading);
  readonly requestError = this.store.selectSignal(payableDetailsSelectors.selectError);
  readonly activeTab = this.store.selectSignal(payableDetailsSelectors.selectActiveTab);
  readonly settleModalVisible = this.store.selectSignal(
    payableDetailsSelectors.selectSettleModalVisible,
  );

  // --- Mutations store (settle request) ---
  private readonly settleRequest = this.store.selectSignal(
    payablesMutationsFeature.selectSettleRequest,
  );
  readonly isSettling = computed(() => this.settleRequest().status === LOAD_STATUS.Loading);

  private readonly payableId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  constructor() {
    // Trigger the details state module whenever the `:id` param changes.
    effect(() => {
      const payableId = this.payableId();
      if (!payableId) {
        return;
      }
      untracked(() =>
        this.store.dispatch(PAYABLE_DETAILS_ACTIONS.loadPayable({ payableId })),
      );
    });
  }

  backToList(): void {
    void this.router.navigate(['/payables']);
  }

  retry(): void {
    const payableId = untracked(this.payableId);
    if (!payableId) {
      return;
    }
    this.store.dispatch(PAYABLE_DETAILS_ACTIONS.loadPayable({ payableId }));
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const next = toPayableDetailsTab(value);
    if (next === null) {
      return;
    }
    this.store.dispatch(PAYABLE_DETAILS_ACTIONS.setActiveTab({ activeTab: next }));
    void this.urlState.replaceQueryParams(this.route, { tab: next });
  }

  openSettleModal(): void {
    this.store.dispatch(PAYABLE_DETAILS_ACTIONS.openSettleModal());
  }

  closeSettleModal(): void {
    this.store.dispatch(PAYABLE_DETAILS_ACTIONS.closeSettleModal());
  }

  /** Two-way bridge for the modal's `visible` model; the store owns the truth. */
  onSettleModalVisibleChange(visible: boolean): void {
    if (visible) {
      this.store.dispatch(PAYABLE_DETAILS_ACTIONS.openSettleModal());
      return;
    }
    this.store.dispatch(PAYABLE_DETAILS_ACTIONS.closeSettleModal());
  }

  onSettle(amount: number): void {
    const payableId = untracked(this.payableId);
    if (!payableId || this.isSettling()) {
      return;
    }
    this.store.dispatch(PAYABLES_MUTATIONS_ACTIONS.settlePayable({ payableId, amount }));
  }
}
