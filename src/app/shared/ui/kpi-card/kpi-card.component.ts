import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';
import { SkeletonModule } from 'primeng/skeleton';
import { formatNumber } from '../../utils/format';

export type KpiTone = 'primary' | 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<KpiTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger'
};

/** Headline metric tile used by the dashboard and the report pages. */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [LucideAngularModule, SkeletonModule],
  templateUrl: './kpi-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  hint = input('');
  tone = input<KpiTone>('primary');
  loading = input(false);
  icon = input<LucideIconData | null>(null);
  iconSize = input(28);

  protected readonly iconContainerClasses = computed(() => TONE_CLASSES[this.tone()]);

  protected readonly displayValue = computed(() => {
    const value = this.value();
    if (typeof value === 'number') {
      return formatNumber(value);
    }
    return value;
  });
}
