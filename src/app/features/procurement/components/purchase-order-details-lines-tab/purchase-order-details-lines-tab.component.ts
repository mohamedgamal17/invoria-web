import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TableModule } from 'primeng/table';

import type { PurchaseOrder, PurchaseOrderItem } from '../../models/purchase-order.entity';

@Component({
  selector: 'app-purchase-order-details-lines-tab',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './purchase-order-details-lines-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseOrderDetailsLinesTabComponent {
  purchaseOrder = input.required<PurchaseOrder>();
  currencyCode = input.required<string>();
  lineLabel = input.required<(line: PurchaseOrderItem) => string>();
}
