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

import { formatApiError } from '../../../../core/http/api-error.format';
import type { Customer } from '../../models/customer.entity';
import { CustomersApiService } from '../../services/customers-api.service';

@Component({
  selector: 'app-customer-details-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, SkeletonModule, ToastModule],
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

  constructor() {
    this.loadCustomer();
  }

  backToList(): void {
    void this.router.navigate(['/dashboard', 'customers']);
  }

  goToEdit(): void {
    void this.router.navigate(['edit'], { relativeTo: this.route });
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
            this.error.set(formatApiError(res.error));
            return;
          }
          this.customer.set(res.result);
        },
        error: (err: unknown) => {
          this.error.set(formatApiError(err));
        }
      });
  }
}

