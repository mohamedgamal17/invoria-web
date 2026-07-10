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
import { InvoicesApiService } from '../../services/invoices-api.service';
import type { Invoice } from '../../models/invoice.entity';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { InvoiceDetailsOverviewCardComponent } from '../../components/invoice-details-overview-card/invoice-details-overview-card.component';
import { InvoiceDetailsItemsTabComponent } from '../../components/invoice-details-items-tab/invoice-details-items-tab.component';

const TAB_SLUGS = ['overview', 'items'] as const;

function tabSlugToIndex(tab: string | null): number | null {
  if (tab === 'items') return 1;
  if (tab === 'overview' || tab === null || tab === '') return 0;
  return null;
}

function indexToTabSlug(index: number): string {
  return TAB_SLUGS[index] ?? 'overview';
}

@Component({
  selector: 'app-invoice-details-page',
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
    InvoiceDetailsOverviewCardComponent,
    InvoiceDetailsItemsTabComponent
  ],
  providers: [MessageService],
  templateUrl: './invoice-details-page.component.html'
})
export class InvoiceDetailsPageComponent {
  readonly currencyCode = 'EGP' as const;

  private readonly invoicesApi = inject(InvoicesApiService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly invoiceId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  private readonly tabQuery = toSignal(
    this.route.queryParamMap.pipe(map((m) => m.get('tab'))),
    { initialValue: this.route.snapshot.queryParamMap.get('tab') }
  );

  readonly activeTab = signal(0);

  readonly invoiceResource = rxResource<Invoice | null, string>({
    params: () => this.invoiceId(),
    defaultValue: null,
    stream: ({ params: id }) => {
      if (!id) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Missing invoice id.' });
        return of(null);
      }
      return this.invoicesApi.getInvoice(id).pipe(
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

  readonly displayInvoice = linkedSignal({
    source: () => this.invoiceResource.value(),
    computation: (invoice) => (invoice ? { ...invoice, items: [...invoice.items] } : null)
  });

  readonly error = computed<string>(() => {
    if (!this.invoiceId()) return 'Missing invoice id.';
    if (this.invoiceResource.isLoading()) return '';
    if (!this.displayInvoice()) return 'Failed to load invoice.';
    return '';
  });

  constructor() {
    effect(() => {
      const tab = this.tabQuery();
      const loaded = this.displayInvoice();
      if (!loaded || this.invoiceResource.isLoading()) {
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
    void this.router.navigate(['/invoices']);
  }

  retry(): void {
    this.invoiceResource.reload();
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
