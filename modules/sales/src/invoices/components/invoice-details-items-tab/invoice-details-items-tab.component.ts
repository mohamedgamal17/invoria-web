import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';
import { SurfaceCardComponent } from '@invoria/ui';
import type { InvoiceItem } from '@invoria/sales/invoices/models/invoice.entity';

@Component({
  selector: 'app-invoice-details-items-tab',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableModule,
    TooltipModule,
    SurfaceCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice-details-items-tab.component.html'
})
export class InvoiceDetailsItemsTabComponent {
  items = input.required<InvoiceItem[]>();
  currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  readonly totalQuantity = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalAmount = computed(() =>
    this.items().reduce((sum, item) => sum + item.lineTotal, 0)
  );

  readonly hasItems = computed(() => this.items().length > 0);
}
