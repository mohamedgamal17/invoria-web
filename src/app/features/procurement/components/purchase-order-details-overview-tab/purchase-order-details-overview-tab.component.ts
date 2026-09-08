import { CommonModule, formatDate } from '@angular/common';
import { Component, Input, inject, LOCALE_ID } from '@angular/core';

import { CardModule } from 'primeng/card';

import type { PurchaseOrder } from '../../models/purchase-order.entity';

@Component({
  selector: 'app-purchase-order-details-overview-tab',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './purchase-order-details-overview-tab.component.html'
})
export class PurchaseOrderDetailsOverviewTabComponent {
  private readonly locale = inject(LOCALE_ID);

  @Input({ required: true }) po!: PurchaseOrder;
  @Input({ required: true }) currencyCode!: string;
  @Input({ required: true }) supplierLine!: string;
  @Input() supplierCode: string | null = null;

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
