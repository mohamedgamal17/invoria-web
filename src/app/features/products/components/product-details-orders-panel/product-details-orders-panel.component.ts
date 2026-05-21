import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, of, take } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { orderStatusLabel } from '../../../orders/models/order-actions';
import {
  summarizeProductOrders,
  type ProductOrderRowSummary,
  type ProductOrdersAggregateSummary
} from '../../models/product-order-summary';
import { ProductOrdersLoaderService } from '../../services/product-orders-loader.service';

const EMPTY_AGGREGATE: ProductOrdersAggregateSummary = {
  orderCount: 0,
  productLineSubtotalTotal: 0,
  productReturnSubtotalTotal: 0,
  productNetSubtotalTotal: 0,
  orderTotalSum: 0,
  orderReturnSubtotalSum: 0,
  orderNetAfterReturnsSum: 0
};

@Component({
  selector: 'app-product-details-orders-panel',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SkeletonModule],
  templateUrl: './product-details-orders-panel.component.html'
})
export class ProductDetailsOrdersPanelComponent {
  readonly productId = input.required<string>();
  readonly currencyCode = input<string>('EGP');
  readonly active = input(false);

  private readonly ordersLoader = inject(ProductOrdersLoaderService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly rows = signal<ProductOrderRowSummary[]>([]);
  readonly aggregate = signal<ProductOrdersAggregateSummary>(EMPTY_AGGREGATE);

  readonly hasRows = computed(() => this.rows().length > 0);

  constructor() {
    effect(() => {
      this.productId();
      this.loaded.set(false);
    });

    effect(() => {
      const id = this.productId();
      const active = this.active();
      if (!active || !id || this.loaded()) {
        return;
      }
      this.loadOrders(id);
    });
  }

  reload(): void {
    this.loaded.set(false);
    const id = this.productId();
    if (id) {
      this.loadOrders(id);
    }
  }

  viewOrder(row: ProductOrderRowSummary): void {
    void this.router.navigate(['/orders', row.orderId]);
  }

  private loadOrders(productId: string): void {
    this.loading.set(true);
    this.ordersLoader
      .loadAllOrdersWithItems()
      .pipe(
        take(1),
        map((orders) =>
          summarizeProductOrders(orders, productId, (order) => orderStatusLabel(order.status))
        ),
        finalize(() => {
          this.loading.set(false);
          this.loaded.set(true);
        }),
        catchError((err: unknown) => {
          this.messageService.add(presentApiError(err).toast);
          this.rows.set([]);
          this.aggregate.set(EMPTY_AGGREGATE);
          return of({ rows: [], aggregate: EMPTY_AGGREGATE });
        })
      )
      .subscribe(({ rows, aggregate }) => {
        this.rows.set(rows);
        this.aggregate.set(aggregate);
      });
  }
}
