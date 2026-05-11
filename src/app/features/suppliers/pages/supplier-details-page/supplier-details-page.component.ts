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
import { SupplierDetailsProfileComponent } from '../../components/supplier-details-profile/supplier-details-profile.component';
import { SupplierDetailsPurchaseOrdersTabComponent } from '../../components/supplier-details-purchase-orders-tab/supplier-details-purchase-orders-tab.component';
import { SupplierDetailsToolbarComponent } from '../../components/supplier-details-toolbar/supplier-details-toolbar.component';
import type { Supplier } from '../../models/supplier.entity';
import { SuppliersApiService } from '../../services/suppliers-api.service';

function tabSlugToIndex(tab: string | null): number | null {
  if (tab === 'purchase-orders') {
    return 1;
  }
  if (tab === 'profile' || tab === null || tab === '') {
    return 0;
  }
  return null;
}

@Component({
  selector: 'app-supplier-details-page',
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
    SupplierDetailsToolbarComponent,
    SupplierDetailsProfileComponent,
    SupplierDetailsPurchaseOrdersTabComponent
  ],
  providers: [MessageService],
  templateUrl: './supplier-details-page.component.html'
})
export class SupplierDetailsPageComponent {
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly supplierId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  private readonly tabQuery = toSignal(this.route.queryParamMap.pipe(map((m) => m.get('tab'))), {
    initialValue: this.route.snapshot.queryParamMap.get('tab')
  });

  readonly loading = signal(true);
  readonly error = signal('');
  readonly supplier = signal<Supplier | null>(null);
  /** Active tab index (`0` = Profile, `1` = Purchase orders). */
  readonly activeTab = signal(0);

  constructor() {
    effect(() => {
      this.loadSupplier(this.supplierId());
    });

    effect(() => {
      const tab = this.tabQuery();
      const loaded = this.supplier();
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
    void this.router.navigate(['/suppliers']);
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
    const slug: 'profile' | 'purchase-orders' = next === 1 ? 'purchase-orders' : 'profile';
    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: { tab: slug }
    });
  }

  retry(): void {
    this.loadSupplier();
  }

  private loadSupplier(idParam?: string): void {
    const id = idParam ?? this.supplierId();
    if (!id) {
      this.loading.set(false);
      this.supplier.set(null);
      this.error.set('Missing supplier id.');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error() });
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.supplier.set(null);

    this.suppliersApi
      .getSupplier(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            const presentation = presentApiError(res.error);
            const detail = presentation.toast.detail ?? 'Failed to load supplier.';
            this.error.set(detail);
            this.supplier.set(null);
            this.messageService.add(presentation.toast);
            if (presentation.routeTarget) {
              void this.router.navigate([presentation.routeTarget]);
            }
            return;
          }
          this.supplier.set(res.result);
        },
        error: (err: unknown) => {
          const presentation = presentApiError(err);
          const detail = presentation.toast.detail ?? 'Failed to load supplier.';
          this.error.set(detail);
          this.supplier.set(null);
          this.messageService.add(presentation.toast);
          if (presentation.routeTarget) {
            void this.router.navigate([presentation.routeTarget]);
          }
        }
      });
  }
}
