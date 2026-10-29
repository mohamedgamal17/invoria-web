import { Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type PayableListSkeletonVariant = 'mobile' | 'table';

@Component({
  selector: 'app-payable-list-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './payable-list-skeleton.component.html',
  host: {
    style: 'display: contents;'
  }
})
export class PayableListSkeletonComponent {
  variant = input<PayableListSkeletonVariant>('mobile');
  count = input(10);

  protected rowIndices = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
