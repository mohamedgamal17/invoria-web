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
import { RECEIVABLE_CURRENCY_CODE } from '../../models/receivable-currency';
import { toReceivableDetailsTab } from '../../utils/receivable-details-tab';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { ReceivableDetailsOverviewCardComponent } from '../../components/receivable-details-overview-card/receivable-details-overview-card.component';
import { ReceivableSettlementsTabComponent } from '../../components/receivable-settlements-tab/receivable-settlements-tab.component';
import { ReceivableSettleModalComponent } from '../../components/receivable-settle-modal/receivable-settle-modal.component';
import { RECEIVABLES_MUTATIONS_ACTIONS } from '../../store/receivables-mutations/receivables-mutations.actions';
import { receivablesMutationsFeature } from '../../store/receivables-mutations/receivables-mutations.reducer';
import { RECEIVABLE_DETAILS_ACTIONS } from '../../store/receivable-details/receivable-details.actions';
import { ReceivableDetailsTab } from '../../store/receivable-details/receivable-details.reducer';
import { receivableDetailsSelectors } from '../../store/receivable-details/receivable-details.selectors';

/**
 * Smart page (container) for receivable details. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`tab` query param via `replaceUrl`),
 * - presentation glue (navigation, settle modal intents).
 * The URL *read* side lives in the `store/receivable-details-url` effects
 * (NgRx Router Store); all API calls live in the `store/receivable-details`
 * and `store/receivables-mutations` state modules, including error
 * presentation (global `AppErrorEffects` toast) and the settle success
 * toast (mutations tap effect).
 */
@Component({
  selector: 'app-receivable-details-page',
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
    ReceivableDetailsOverviewCardComponent,
    ReceivableSettlementsTabComponent,
    ReceivableSettleModalComponent,
  ],
  templateUrl: './receivable-details-page.component.html',
})
export class ReceivableDetailsPageComponent {
  readonly tabs = ReceivableDetailsTab;
  readonly currencyCode = RECEIVABLE_CURRENCY_CODE;

  private readonly store = inject(Store);
  private readonly urlState = inject(UrlStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // --- Details store (receivable + activeTab + settle modal visibility) ---
  readonly receivable = this.store.selectSignal(receivableDetailsSelectors.selectReceivable);
  readonly loading = this.store.selectSignal(receivableDetailsSelectors.selectIsLoading);
  readonly requestError = this.store.selectSignal(receivableDetailsSelectors.selectError);
  readonly activeTab = this.store.selectSignal(receivableDetailsSelectors.selectActiveTab);
  readonly settleModalVisible = this.store.selectSignal(
    receivableDetailsSelectors.selectSettleModalVisible,
  );

  // --- Mutations store (settle request) ---
  private readonly settleRequest = this.store.selectSignal(
    receivablesMutationsFeature.selectSettleRequest,
  );
  readonly isSettling = computed(() => this.settleRequest().status === LOAD_STATUS.Loading);

  private readonly receivableId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  /** Inline error card text; an empty route id short-circuits before the store is involved. */
  readonly error = computed<string>(() => {
    if (!this.receivableId()) return 'Missing receivable id.';
    return this.requestError() ?? '';
  });

  constructor() {
    // Trigger the details state module whenever the `:id` param changes.
    effect(() => {
      const receivableId = this.receivableId();
      if (!receivableId) {
        return;
      }
      untracked(() =>
        this.store.dispatch(RECEIVABLE_DETAILS_ACTIONS.loadReceivable({ receivableId })),
      );
    });
  }

  backToList(): void {
    void this.router.navigate(['/receivables']);
  }

  retry(): void {
    const receivableId = untracked(this.receivableId);
    if (!receivableId) {
      return;
    }
    this.store.dispatch(RECEIVABLE_DETAILS_ACTIONS.loadReceivable({ receivableId }));
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const next = toReceivableDetailsTab(value);
    if (next === null) {
      return;
    }
    this.store.dispatch(RECEIVABLE_DETAILS_ACTIONS.setActiveTab({ activeTab: next }));
    void this.urlState.replaceQueryParams(this.route, { tab: next });
  }

  openSettleModal(): void {
    this.store.dispatch(RECEIVABLE_DETAILS_ACTIONS.openSettleModal());
  }

  closeSettleModal(): void {
    this.store.dispatch(RECEIVABLE_DETAILS_ACTIONS.closeSettleModal());
  }

  /** Two-way bridge for the modal's `visible` model; the store owns the truth. */
  onSettleModalVisibleChange(visible: boolean): void {
    if (visible) {
      this.store.dispatch(RECEIVABLE_DETAILS_ACTIONS.openSettleModal());
      return;
    }
    this.store.dispatch(RECEIVABLE_DETAILS_ACTIONS.closeSettleModal());
  }

  onSettle(amount: number): void {
    const receivableId = untracked(this.receivableId);
    if (!receivableId || this.isSettling()) {
      return;
    }
    this.store.dispatch(RECEIVABLES_MUTATIONS_ACTIONS.settleReceivable({ receivableId, amount }));
  }
}
