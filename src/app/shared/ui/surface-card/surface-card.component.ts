import { Component, input } from '@angular/core';

@Component({
  selector: 'app-surface-card',
  standalone: true,
  template: `
    <section
      class="rounded-xl border bg-surface p-4 shadow-sm border-border overflow-visible"
      [class]="
        tone() === 'accent'
          ? 'rounded-xl border bg-surface p-4 shadow-sm border-border overflow-visible'
          : 'rounded-xl border bg-surface p-4 shadow-sm border-border overflow-visible'
      "
    >
      <ng-content />
    </section>
  `
})
export class SurfaceCardComponent {
  tone = input<'neutral' | 'accent'>('neutral');
}
