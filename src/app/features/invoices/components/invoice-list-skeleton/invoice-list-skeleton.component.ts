import { Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type InvoiceListSkeletonVariant = 'mobile' | 'table';

@Component({
  selector: 'app-invoice-list-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './invoice-list-skeleton.component.html',
  host: {
    style: 'display: contents;'
  }
})
export class InvoiceListSkeletonComponent {
  variant = input<InvoiceListSkeletonVariant>('mobile');
  count = input(10);

  protected rowIndices = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
