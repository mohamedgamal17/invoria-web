import { Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type ProductListSkeletonVariant = 'mobile' | 'table';

@Component({
  selector: 'app-product-list-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './product-list-skeleton.component.html',
  host: {
    style: 'display: contents;',
  },
})
export class ProductListSkeletonComponent {
  /** Mobile card placeholders vs. table `<tr>` rows (for `pTemplate="loadingbody"`). */
  variant = input<ProductListSkeletonVariant>('mobile');
  /** Number of skeleton cards or table rows. */
  count = input(10);

  protected rowIndices = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
