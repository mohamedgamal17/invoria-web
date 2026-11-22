import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

/**
 * Standard inline error card with retry button shared across details and container pages.
 */
@Component({
  selector: 'app-error-card',
  standalone: true,
  imports: [CardModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-card.component.html',
})
export class ErrorCardComponent {
  title = input.required<string>();
  message = input.required<string>();
  retryLabel = input('Retry');
  retry = output<void>();
}
