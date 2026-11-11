import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { Batch, BatchState } from '../models/batch.entity';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../shared/models/pagination';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    PaginatorModule,
    CardModule,
    SkeletonModule,
  ],
  templateUrl: './batch-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchListComponent {
  batches = input<Batch[]>([]);
  totalRecords = input<number>(0);
  loading = input<boolean>(false);
  first = input(0);
  pageSize = input(25);
  pageSizeOptions = input<number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  currencyCode = input<string>('EGP');

  onPageChange = output<{ first?: number; rows?: number }>();
  edit = output<Batch>();

  getAvailableQuantity(batch: Batch): number {
    return Math.max(batch.quantity - batch.reservedQuantity, 0);
  }

  getSeverity(state: BatchState): 'success' | 'secondary' | 'danger' | 'info' | 'warn' | undefined {
    switch (state) {
      case BatchState.Active:
        return 'success';
      case BatchState.Depleted:
        return 'secondary';
      case BatchState.Disabled:
        return 'danger';
      default:
        return 'info';
    }
  }
}
