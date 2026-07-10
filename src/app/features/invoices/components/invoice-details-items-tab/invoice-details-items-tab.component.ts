import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { InvoiceItem } from '../../models/invoice.entity';

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
  templateUrl: './invoice-details-items-tab.component.html'
})
export class InvoiceDetailsItemsTabComponent {
  items = input.required<InvoiceItem[]>();
  currencyCode = input<string>('EGP');

  readonly totalQuantity = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalAmount = computed(() =>
    this.items().reduce((sum, item) => sum + item.lineTotal, 0)
  );

  readonly hasItems = computed(() => this.items().length > 0);
}
