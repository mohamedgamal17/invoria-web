import { Component, input } from '@angular/core';

@Component({
  selector: 'app-surface-card',
  standalone: true,
  template: `
    <section
      class="rounded-xl border bg-surface p-4 shadow-sm"
      [class]="
        tone() === 'accent'
          ? 'rounded-xl border bg-surface p-4 shadow-sm border-accent/40 invoria-gradient-surface shadow-glow-sm'
          : 'rounded-xl border bg-surface p-4 shadow-sm border-border'
      "
    >
      <ng-content />
    </section>
  `
})
export class SurfaceCardComponent {
  tone = input<'neutral' | 'accent'>('neutral');
}
