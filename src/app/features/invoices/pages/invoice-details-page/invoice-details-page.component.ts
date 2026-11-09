import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { UrlStateService } from '../../../../shared/utils/url-state.service';
import { InvoiceDetailsOverviewCardComponent } from '../../components/invoice-details-overview-card/invoice-details-overview-card.component';
import { InvoiceDetailsItemsTabComponent } from '../../components/invoice-details-items-tab/invoice-details-items-tab.component';
import { INVOICE_DETAILS_ACTIONS } from '../../store/invoice-details/invoice-details.actions';
import { invoiceDetailsSelectors } from '../../store/invoice-details/invoice-details.selectors';
import {
  invoiceDetailsTabToSlug,
  toInvoiceDetailsTab,
} from '../../utils/invoice-details-tab';

/**
 * Smart page (container) for invoice details. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the trigger effect for the `:id` route param,
 * - the URL write adapter (`tab` query param via `replaceUrl`),
 * - presentation glue (back navigation, retry).
 * The URL *read* side lives in the `store/invoice-details-url` effects
 * (NgRx Router Store); all API calls live in the `store/invoice-details`
 * slice, and error presentation is owned by the global `AppErrorEffects`.
 */
@Component({
  selector: 'app-invoice-details-page',
  standalone: true,
  imports: [
    DatePipe,
    ButtonModule,
    CardModule,
    SkeletonModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    PageHeaderComponent,
    InvoiceDetailsOverviewCardComponent,
    InvoiceDetailsItemsTabComponent
  ],
  templateUrl: './invoice-details-page.component.html'
})
export class InvoiceDetailsPageComponent {
  readonly currencyCode = 'EGP' as const;

  private readonly store = inject(Store);
  private readonly urlState = inject(UrlStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly invoiceId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  // --- Details store (invoice + activeTab + load request) ---
  readonly displayInvoice = this.store.selectSignal(invoiceDetailsSelectors.selectInvoice);
  readonly loading = this.store.selectSignal(invoiceDetailsSelectors.selectIsLoading);
  readonly errorDetail = this.store.selectSignal(invoiceDetailsSelectors.selectError);
  readonly activeTab = this.store.selectSignal(invoiceDetailsSelectors.selectActiveTab);

  readonly error = computed<string>(() => {
    if (!this.invoiceId()) return 'Missing invoice id.';
    if (this.loading()) return '';
    if (!this.displayInvoice()) return this.errorDetail() || 'Failed to load invoice.';
    return '';
  });

  constructor() {
    // Trigger the details state module whenever the `:id` param changes.
    effect(() => {
      const id = this.invoiceId();
      if (!id) {
        return;
      }
      untracked(() =>
        this.store.dispatch(INVOICE_DETAILS_ACTIONS.loadInvoice({ invoiceId: id })),
      );
    });
  }

  backToList(): void {
    void this.router.navigate(['/invoices']);
  }

  retry(): void {
    const id = this.invoiceId();
    if (!id) {
      return;
    }
    this.store.dispatch(INVOICE_DETAILS_ACTIONS.refreshInvoice({ invoiceId: id }));
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const next = toInvoiceDetailsTab(value) ?? 0;
    this.store.dispatch(INVOICE_DETAILS_ACTIONS.setActiveTab({ activeTab: next }));
    void this.urlState.replaceQueryParams(this.route, { tab: invoiceDetailsTabToSlug(next) });
  }
}
