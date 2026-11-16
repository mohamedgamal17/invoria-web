import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-supplier-details-toolbar',
  standalone: true,
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-details-toolbar.component.html'
})
export class SupplierDetailsToolbarComponent {
  readonly back = output<void>();
}
