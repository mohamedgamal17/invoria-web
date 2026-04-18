import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { purchaseStateLabel, purchaseStateSeverity } from '../../models/purchase-state.display';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PaginatorModule,
    SkeletonModule
  ],
  templateUrl: './purchase-order-list.component.html'
})
export class PurchaseOrderListComponent {
  purchaseOrders = input<PurchaseOrder[]>([]);
  purchaseNumber = input('');
  totalRecords = input(0);
  first = input(0);
  pageSize = input(25);
  pageSizeOptions = input([25, 50, 100, 200]);
  loading = input(false);

  pageChange = output<PaginatorState | TablePageEvent>();
  purchaseNumberChange = output<string>();
  view = output<PurchaseOrder>();

  readonly stateLabel = purchaseStateLabel;
  readonly stateSeverity = purchaseStateSeverity;

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }

  supplierDisplay(row: PurchaseOrder): string {
    const name = row.supplier?.name?.trim();
    if (name) {
      return name;
    }
    return row.supplierId;
  }
}
