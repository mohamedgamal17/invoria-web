import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, LOCALE_ID } from '@angular/core';

import { CardModule } from 'primeng/card';

import type { PurchaseOrder } from '../../models/purchase-order.entity';

@Component({
  selector: 'app-purchase-order-details-overview-tab',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './purchase-order-details-overview-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseOrderDetailsOverviewTabComponent {
  private readonly locale = inject(LOCALE_ID);

  purchaseOrder = input.required<PurchaseOrder>();
  currencyCode = input.required<string>();
  supplierLine = input.required<string>();

  formatDateOrDash(value: string | null | undefined): string {
    if (!value?.trim()) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return formatDate(date, 'medium', this.locale);
  }
}
