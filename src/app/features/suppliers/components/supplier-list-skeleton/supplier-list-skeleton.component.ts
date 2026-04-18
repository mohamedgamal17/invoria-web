import { Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type SupplierListSkeletonVariant = 'mobile' | 'table';

@Component({
  selector: 'app-supplier-list-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './supplier-list-skeleton.component.html',
  host: {
    style: 'display: contents;'
  }
})
export class SupplierListSkeletonComponent {
  variant = input<SupplierListSkeletonVariant>('mobile');
  count = input(10);

  protected rowIndices = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
