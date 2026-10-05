import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, linkedSignal, signal, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { ReceivablesApiService } from '../../services/receivables-api.service';
import type { Receivable } from '../../models/receivable.entity';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { ReceivableDetailsOverviewCardComponent } from '../../components/receivable-details-overview-card/receivable-details-overview-card.component';
import { ReceivableSettlementsTabComponent } from '../../components/receivable-settlements-tab/receivable-settlements-tab.component';

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
  selector: 'app-receivable-details-page',
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
    ReceivableDetailsOverviewCardComponent,
    ReceivableSettlementsTabComponent
  ],
  providers: [MessageService],
  templateUrl: './receivable-details-page.component.html'
})
export class ReceivableDetailsPageComponent {
  readonly currencyCode = 'EGP' as const;

  private readonly receivablesApi = inject(ReceivablesApiService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly receivableId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  private readonly tabQuery = toSignal(
    this.route.queryParamMap.pipe(map((m) => m.get('tab'))),
    { initialValue: this.route.snapshot.queryParamMap.get('tab') }
  );

  readonly activeTab = signal(0);

  readonly receivableResource = rxResource<Receivable | null, string>({
    params: () => this.receivableId(),
    defaultValue: null,
    stream: ({ params: id }) => {
      if (!id) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Missing receivable id.' });
        return of(null);
      }
      return this.receivablesApi.getReceivable(id).pipe(
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

  readonly displayReceivable = linkedSignal({
    source: () => this.receivableResource.value(),
    computation: (receivable) =>
      receivable ? { ...receivable, settlements: [...(receivable.settlements ?? [])] } : null
  });

  readonly error = computed<string>(() => {
    if (!this.receivableId()) return 'Missing receivable id.';
    if (this.receivableResource.isLoading()) return '';
    if (!this.displayReceivable()) return 'Failed to load receivable.';
    return '';
  });

  constructor() {
    effect(() => {
      const tab = this.tabQuery();
      const loaded = this.displayReceivable();
      if (!loaded || this.receivableResource.isLoading()) {
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
    void this.router.navigate(['/receivables']);
  }

  retry(): void {
    this.receivableResource.reload();
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
