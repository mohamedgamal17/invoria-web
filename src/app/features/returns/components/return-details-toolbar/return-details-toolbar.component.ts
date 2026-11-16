import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-return-details-toolbar',
  standalone: true,
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './return-details-toolbar.component.html',
})
export class ReturnDetailsToolbarComponent {
  back = output<void>();
}
