import { Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type ReceivableListSkeletonVariant = 'mobile' | 'table';

@Component({
  selector: 'app-receivable-list-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './receivable-list-skeleton.component.html',
  host: {
    style: 'display: contents;'
  }
})
export class ReceivableListSkeletonComponent {
  variant = input<ReceivableListSkeletonVariant>('mobile');
  count = input(10);

  protected rowIndices = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
