import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, take } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { CustomerDetailsOrdersTabComponent } from '../../components/customer-details-orders-tab/customer-details-orders-tab.component';
import { CustomerDetailsProfileComponent } from '../../components/customer-details-profile/customer-details-profile.component';
import { CustomerDetailsToolbarComponent } from '../../components/customer-details-toolbar/customer-details-toolbar.component';
import type { Customer } from '../../models/customer.entity';
import { CustomersApiService } from '../../services/customers-api.service';

function tabSlugToIndex(tab: string | null): number | null {
  if (tab === 'orders') {
    return 1;
  }
  if (tab === 'profile' || tab === null || tab === '') {
    return 0;
  }
  return null;
}

@Component({
  selector: 'app-customer-details-page',
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
    CustomerDetailsToolbarComponent,
    CustomerDetailsProfileComponent,
    CustomerDetailsOrdersTabComponent
  ],
  providers: [MessageService],
  templateUrl: './customer-details-page.component.html'
})
export class CustomerDetailsPageComponent {
  private readonly customersApi = inject(CustomersApiService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly customerId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  private readonly tabQuery = toSignal(this.route.queryParamMap.pipe(map((m) => m.get('tab'))), {
    initialValue: this.route.snapshot.queryParamMap.get('tab')
  });

  readonly loading = signal(true);
  readonly error = signal('');
  readonly customer = signal<Customer | null>(null);
  /** Active tab index (`0` = Profile, `1` = Orders). */
  readonly activeTab = signal(0);

  constructor() {
    effect(() => {
      this.loadCustomer(this.customerId());
    });

    effect(() => {
      const tab = this.tabQuery();
      const loaded = this.customer();
      if (!loaded || this.loading()) {
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
    void this.router.navigate(['/customers']);
  }

  goToEdit(): void {
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const n = typeof value === 'number' ? value : Number(value);
    const next = Number.isFinite(n) ? n : 0;
    this.activeTab.set(next);
    const slug: 'profile' | 'orders' = next === 1 ? 'orders' : 'profile';
    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: { tab: slug }
    });
  }

  retry(): void {
    this.loadCustomer();
  }

  private loadCustomer(idParam?: string): void {
    const id = idParam ?? this.customerId();
    if (!id) {
      this.loading.set(false);
      this.customer.set(null);
      this.error.set('Missing customer id.');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error() });
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.customer.set(null);

    this.customersApi
      .getCustomer(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            const presentation = presentApiError(res.error);
            const detail = presentation.toast.detail ?? 'Failed to load customer.';
            this.error.set(detail);
            this.customer.set(null);
            this.messageService.add(presentation.toast);
            if (presentation.routeTarget) {
              void this.router.navigate([presentation.routeTarget]);
            }
            return;
          }
          this.customer.set(res.result);
        },
        error: (err: unknown) => {
          const presentation = presentApiError(err);
          const detail = presentation.toast.detail ?? 'Failed to load customer.';
          this.error.set(detail);
          this.customer.set(null);
          this.messageService.add(presentation.toast);
          if (presentation.routeTarget) {
            void this.router.navigate([presentation.routeTarget]);
          }
        }
      });
  }
}
