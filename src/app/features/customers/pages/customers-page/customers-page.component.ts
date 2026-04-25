import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CustomersApiService } from '../../services/customers-api.service';
import type { ListCustomerRequest } from '../../models/list-customer.request';
import { CustomerListComponent } from '../../components/customer-list/customer-list.component';
import type { Customer } from '../../models/customer.entity';
import type { PagingInfo } from '../../../../core/models/paging';
import { presentApiError } from '../../../../core/http/api-error.presenter';

const EMPTY_CUSTOMERS_TUPLE: [Customer[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    CustomerListComponent
  ],
  providers: [MessageService],
  templateUrl: './customers-page.component.html'
})
export class CustomersPageComponent {
  readonly pageSizeOptions = [5, 10, 20];

  private readonly customersApi = inject(CustomersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** 1-based page number from `?page=` (default 1). */
  private readonly pageFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('page');
        const n = raw ? parseInt(raw, 10) : 1;
        return Number.isFinite(n) && n >= 1 ? n : 1;
      })
    ),
    { initialValue: 1 }
  );

  /** Page size from `?pageSize=` (must be in pageSizeOptions; default 10). */
  readonly pageSize = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('pageSize');
        const n = raw ? parseInt(raw, 10) : NaN;
        return this.pageSizeOptions.includes(n) ? n : 10;
      })
    ),
    { initialValue: 10 }
  );

  /** Name filter from `?q=` (trimmed; default empty). */
  readonly qFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const q = m.get('q')?.trim();
        return q ? q : '';
      })
    ),
    { initialValue: '' }
  );

  /** 0-based page index derived from the URL. */
  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly listRequest = computed((): ListCustomerRequest => ({
    Skip: this.pageIndex() * this.pageSize(),
    Length: this.pageSize(),
    Name: this.qFromRoute() || null
  }));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly customersResource = rxResource<[Customer[], PagingInfo], ListCustomerRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_CUSTOMERS_TUPLE,
    stream: ({ params }) =>
      this.customersApi.listCustomers(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return EMPTY_CUSTOMERS_TUPLE;
          }
          return [res.result.data, res.result.info] as [Customer[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(EMPTY_CUSTOMERS_TUPLE);
        })
      )
  });

  readonly displayCustomers = linkedSignal({
    source: () => this.customersLinkSource(),
    computation: (src) => [...src.customers]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.customersLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  navigateToCreate(): void {
    void this.router.navigate(['new'], { relativeTo: this.route.parent });
  }

  goToDetails(customer: Customer): void {
    void this.router.navigate([customer.id], { relativeTo: this.route });
  }

  onPageChange(event: unknown): void {
    const evt = event as { rows?: number; page?: number; first?: number };
    const rows = evt.rows ?? this.pageSize();
    const firstEvt = evt.first ?? 0;
    const newPageIndex = evt.page ?? Math.floor(firstEvt / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: newPageIndex + 1, pageSize: rows },
        queryParamsHandling: 'merge'
      });

      if (isManualPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  onNameFilterChange(q: string): void {
    const normalized = q.trim();
    if (normalized === this.qFromRoute()) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: normalized || null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  private customersLinkSource(): {
    request: ListCustomerRequest;
    customers: Customer[];
    paging: PagingInfo;
  } {
    const [customers, paging] = this.customersResource.value();
    return {
      request: this.listRequest(),
      customers,
      paging
    };
  }

  private showApiError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
    if (presentation.routeTarget) {
      void this.router.navigate([presentation.routeTarget]);
    }
  }
}
