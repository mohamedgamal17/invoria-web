import { Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type ListSkeletonVariant = 'mobile' | 'table';

export interface ListSkeletonColumn {
  /** Skeleton bar width, e.g. `'60%'` or `'4rem'`. */
  width: string;
  align?: 'left' | 'right' | 'center';
  /** Number of stacked bars rendered in the cell (defaults to 1). */
  lines?: number;
  /** Number of circular action placeholders rendered in the cell. */
  actions?: number;
}

/** Seven text columns plus a single action, matching most list tables. */
export const DEFAULT_LIST_SKELETON_COLUMNS: ListSkeletonColumn[] = [
  { width: '60%' },
  { width: '40%' },
  { width: '40%' },
  { width: '30%' },
  { width: '40%' },
  { width: '40%' },
  { width: '40%' },
  { width: '', actions: 1 }
];

/** Card/table loading placeholder shared by the paged list screens. */
@Component({
  selector: 'app-list-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './list-skeleton.component.html',
  host: {
    style: 'display: contents;'
  }
})
export class ListSkeletonComponent {
  variant = input<ListSkeletonVariant>('mobile');
  count = input(10);
  columns = input<ListSkeletonColumn[]>(DEFAULT_LIST_SKELETON_COLUMNS);

  protected rowIndices = computed(() => Array.from({ length: this.count() }, (_, index) => index));

  protected cellClasses(column: ListSkeletonColumn): string {
    const alignClass =
      column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : '';
    return ['px-4 py-5', alignClass].filter(Boolean).join(' ');
  }

  protected lineIndices(column: ListSkeletonColumn): number[] {
    return Array.from({ length: column.lines ?? 1 }, (_, index) => index);
  }

  protected actionIndices(column: ListSkeletonColumn): number[] {
    return Array.from({ length: column.actions ?? 0 }, (_, index) => index);
  }

  protected justifyClass(column: ListSkeletonColumn): string {
    if (column.align === 'right') {
      return 'justify-end';
    }
    if (column.align === 'center') {
      return 'justify-center';
    }
    return 'justify-start';
  }
}
