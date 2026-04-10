import { Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type CustomerListSkeletonVariant = 'mobile' | 'table';

@Component({
  selector: 'app-customer-list-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './customer-list-skeleton.component.html',
  host: {
    style: 'display: contents;'
  }
})
export class CustomerListSkeletonComponent {
  /** Mobile card placeholders vs. table `<tr>` rows (for `pTemplate="loadingbody"`). */
  variant = input<CustomerListSkeletonVariant>('mobile');
  /** Number of skeleton cards or table rows. */
  count = input(10);

  protected rowIndices = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
