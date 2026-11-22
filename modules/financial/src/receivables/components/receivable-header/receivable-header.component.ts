import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '@invoria/ui';

@Component({
  selector: 'app-receivable-header',
  standalone: true,
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './receivable-header.component.html',
})
export class ReceivableHeaderComponent {}
