import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface StatusStep {
  label: string;
  icon: string;
  severity?: 'danger';
}

/**
 * Horizontal progress steps (order / return timelines). Step state is derived
 * by the owner; this component only renders `activeIndex` and the caption.
 */
@Component({
  selector: 'app-status-steps',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-steps.component.html',
  host: {
    class: 'block'
  }
})
export class StatusStepsComponent {
  steps = input.required<StatusStep[]>();
  activeIndex = input.required<number>();
  caption = input('');
  /** Pulses the active step (used while a step is still in progress). */
  pulse = input(false);
}
