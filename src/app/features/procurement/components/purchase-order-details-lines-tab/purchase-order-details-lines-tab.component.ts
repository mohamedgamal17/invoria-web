import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { TableModule } from 'primeng/table';

import type { PurchaseOrder, PurchaseOrderItem } from '../../models/purchase-order.entity';

@Component({
  selector: 'app-purchase-order-details-lines-tab',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './purchase-order-details-lines-tab.component.html'
})
export class PurchaseOrderDetailsLinesTabComponent {
  @Input({ required: true }) po!: PurchaseOrder;
  @Input({ required: true }) currencyCode!: string;
  @Input({ required: true }) lineLabel!: (line: PurchaseOrderItem) => string;
}
