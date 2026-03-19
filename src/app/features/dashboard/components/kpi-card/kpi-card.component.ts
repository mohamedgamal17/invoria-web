import { Component, Input } from '@angular/core';
import { BadgeModule } from 'primeng/badge';

type Tone = 'primary' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [BadgeModule],
  templateUrl: './kpi-card.component.html'
})
export class KpiCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string;
  @Input() hint = '';
  @Input() tone: Tone = 'primary';

  get toneClasses(): string {
    switch (this.tone) {
      case 'success':
        return 'bg-success text-success-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'danger':
        return 'bg-danger text-danger-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  }
}

