import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-surface-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './surface-card.component.html',
})
export class SurfaceCardComponent {
  tone = input<'neutral' | 'accent'>('neutral');
}
