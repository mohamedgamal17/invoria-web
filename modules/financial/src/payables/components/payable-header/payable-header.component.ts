import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '@invoria/ui';

@Component({
  selector: 'app-payable-header',
  standalone: true,
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payable-header.component.html',
})
export class PayableHeaderComponent {}
