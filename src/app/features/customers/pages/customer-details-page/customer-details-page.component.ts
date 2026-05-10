import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, take } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { CustomerDetailsOrdersTabComponent } from '../../components/customer-details-orders-tab/customer-details-orders-tab.component';
import { CustomerDetailsProfileComponent } from '../../components/customer-details-profile/customer-details-profile.component';
import { CustomerDetailsToolbarComponent } from '../../components/customer-details-toolbar/customer-details-toolbar.component';
import type { Customer } from '../../models/customer.entity';
import { CustomersApiService } from '../../services/customers-api.service';

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
    { initialValue: '' }
  );

  readonly loading = signal(true);
  readonly error = signal('');
  readonly customer = signal<Customer | null>(null);
  /** Active tab index for PrimeNG Tabs (`0` = Profile, `1` = Orders). */
  readonly activeTab = signal(0);

  constructor() {
    this.loadCustomer();
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
    this.activeTab.set(Number.isFinite(n) ? n : 0);
  }

  retry(): void {
    this.loadCustomer();
  }

  private loadCustomer(idParam?: string): void {
    const id = idParam ?? this.customerId();
    if (!id) {
      this.loading.set(false);
      this.error.set('Missing customer id.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

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
            this.error.set(presentation.toast.detail ?? 'Failed to load customer.');
            if (presentation.routeTarget) {
              void this.router.navigate([presentation.routeTarget]);
            }
            return;
          }
          this.customer.set(res.result);
        },
        error: (err: unknown) => {
          const presentation = presentApiError(err);
          this.error.set(presentation.toast.detail ?? 'Failed to load customer.');
          if (presentation.routeTarget) {
            void this.router.navigate([presentation.routeTarget]);
          }
        }
      });
  }
}

