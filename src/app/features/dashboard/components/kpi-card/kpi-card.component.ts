import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { SkeletonModule } from 'primeng/skeleton';

type Tone = 'primary' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [LucideAngularModule, SkeletonModule],
  templateUrl: './kpi-card.component.html'
})
export class KpiCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() hint = '';
  @Input() tone: Tone = 'primary';
  @Input() loading = false;
  @Input() icon: any = null;
  @Input() iconSize = 28;

  get iconContainerClasses(): string {
    switch (this.tone) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'danger':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'bg-primary/10 text-primary';
    }
  }

  get displayValue(): string {
    if (typeof this.value === 'number') {
      return new Intl.NumberFormat().format(this.value);
    }
    return this.value ?? '—';
  }
}

