import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, linkedSignal, signal, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, firstValueFrom, from, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { PayablesApiService } from '../../services/payables-api.service';
import { PayableReferenceResolverService } from '../../services/payable-reference-resolver.service';
import type { Payable } from '../../models/payable.entity';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { PayableDetailsOverviewCardComponent } from '../../components/payable-details-overview-card/payable-details-overview-card.component';
import { PayableSettlementsTabComponent } from '../../components/payable-settlements-tab/payable-settlements-tab.component';
import { PayableSettleModalComponent } from '../../components/payable-settle-modal/payable-settle-modal.component';

const TAB_SLUGS = ['overview', 'settlements'] as const;

function tabSlugToIndex(tab: string | null): number | null {
  if (tab === 'settlements') return 1;
  if (tab === 'overview' || tab === null || tab === '') return 0;
  return null;
}

function indexToTabSlug(index: number): string {
  return TAB_SLUGS[index] ?? 'overview';
}

@Component({
  selector: 'app-payable-details-page',
  standalone: true,
  imports: [
    CommonModule,
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
  providers: [MessageService],
  templateUrl: './payable-details-page.component.html'
})
export class PayableDetailsPageComponent {
  readonly currencyCode = 'EGP' as const;

  private readonly payablesApi = inject(PayablesApiService);
  private readonly referenceResolver = inject(PayableReferenceResolverService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly payableId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  private readonly tabQuery = toSignal(
    this.route.queryParamMap.pipe(map((m) => m.get('tab'))),
    { initialValue: this.route.snapshot.queryParamMap.get('tab') }
  );

  readonly activeTab = signal(0);

  /** Settle modal state (presentational modal + request lifecycle owned by this smart page). */
  readonly settleModalVisible = signal(false);
  readonly isSettling = signal(false);

  readonly payableResource = rxResource<Payable | null, string>({
    params: () => this.payableId(),
    defaultValue: null,
    stream: ({ params: id }) => {
      if (!id) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Missing payable id.' });
        return of(null);
      }
      return this.payablesApi.getPayable(id).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return null;
          }
          return res.result;
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(null);
        })
      );
    }
  });

  readonly displayPayable = linkedSignal({
    source: () => this.payableResource.value(),
    computation: (payable) =>
      payable ? { ...payable, settlements: [...(payable.settlements ?? [])] } : null
  });

  /** Supplier display name for the loaded payable (`partyId`), resolved once and cached. */
  private readonly partyNameResource = rxResource<string | null, string>({
    params: () => this.displayPayable()?.partyId ?? '',
    defaultValue: null,
    stream: ({ params: partyId }) =>
      partyId ? from(this.referenceResolver.getPartyName(partyId)) : of(null)
  });

  /** Purchase order number for the loaded payable (`sourceId`), resolved once and cached. */
  private readonly purchaseOrderNumberResource = rxResource<string | null, string>({
    params: () => this.displayPayable()?.sourceId ?? '',
    defaultValue: null,
    stream: ({ params: sourceId }) =>
      sourceId ? from(this.referenceResolver.getPurchaseOrderNumber(sourceId)) : of(null)
  });

  /** Payable with the server-omitted party/source refs hydrated for display. */
  readonly enrichedPayable = computed<Payable | null>(() => {
    const payable = this.displayPayable();
    if (!payable) {
      return null;
    }
    const partyName = this.partyNameResource.value();
    const purchaseNumber = this.purchaseOrderNumberResource.value();
    return {
      ...payable,
      party: partyName ? { id: payable.partyId, name: partyName } : (payable.party ?? null),
      source: purchaseNumber
        ? { id: payable.sourceId, purchaseNumber }
        : (payable.source ?? null)
    };
  });

  readonly error = computed<string>(() => {
    if (!this.payableId()) return 'Missing payable id.';
    if (this.payableResource.isLoading()) return '';
    if (!this.displayPayable()) return 'Failed to load payable.';
    return '';
  });

  constructor() {
    effect(() => {
      const tab = this.tabQuery();
      const loaded = this.displayPayable();
      if (!loaded || this.payableResource.isLoading()) {
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
    void this.router.navigate(['/payables']);
  }

  retry(): void {
    this.payableResource.reload();
  }

  openSettleModal(): void {
    this.settleModalVisible.set(true);
  }

  closeSettleModal(): void {
    if (this.isSettling()) {
      return;
    }
    this.settleModalVisible.set(false);
  }

  /** POST /payables/{id}/settle — updates local state from the returned DTO (no reload). */
  async onSettle(amount: number): Promise<void> {
    const id = this.payableId();
    if (!id || this.isSettling()) {
      return;
    }
    this.isSettling.set(true);
    try {
      const res = await firstValueFrom(this.payablesApi.settlePayable(id, { Amount: amount }));
      if (res.isSuccess && res.result) {
        this.displayPayable.set({ ...res.result, settlements: [...(res.result.settlements ?? [])] });
        this.settleModalVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Settlement of ${this.currencyCode} ${amount.toFixed(2)} recorded.`
        });
      } else {
        this.showApiError(res.error);
      }
    } catch (err) {
      this.showApiError(err);
    } finally {
      this.isSettling.set(false);
    }
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

  private showApiError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
    if (presentation.routeTarget) {
      void this.router.navigate([presentation.routeTarget]);
    }
  }
}
