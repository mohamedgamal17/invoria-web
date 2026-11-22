import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Standard details page top toolbar with back button and optional page title.
 * When `title` is omitted only the back affordance renders, so pages that own
 * a separate entity header (`app-page-header`) do not duplicate the heading.
 */
@Component({
  selector: 'app-details-toolbar',
  standalone: true,
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './details-toolbar.component.html',
})
export class DetailsToolbarComponent {
  title = input<string>('');
  description = input<string>('');
  backLabel = input<string>('Back');
  back = output<void>();
}
