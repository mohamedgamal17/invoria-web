import { Component, input } from '@angular/core';

@Component({
  selector: 'app-surface-card',
  standalone: true,
  templateUrl: './surface-card.component.html',
})
export class SurfaceCardComponent {
  tone = input<'neutral' | 'accent'>('neutral');
}
