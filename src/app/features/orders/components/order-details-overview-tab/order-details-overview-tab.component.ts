import { CommonModule, formatDate } from '@angular/common';
import { Component, inject, input, LOCALE_ID } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import type { UiOrder, UiOrderItem } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-details-overview-tab',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule],
  templateUrl: './order-details-overview-tab.component.html'
})
export class OrderDetailsOverviewTabComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');

  private readonly locale = inject(LOCALE_ID);

  lineTotal(item: UiOrderItem): number {
    return item.price * item.quantity;
  }

  subtotal(o: UiOrder): number {
    return o.items.reduce((acc, item) => acc + this.lineTotal(item), 0);
  }

  formatDateOrDash(value: string | null | undefined): string {
    if (!value?.trim()) {
      return '—';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return '—';
    }
    return formatDate(d, 'medium', this.locale);
  }
}
