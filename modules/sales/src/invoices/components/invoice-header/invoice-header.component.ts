import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '@invoria/ui';

@Component({
  selector: 'app-invoice-header',
  standalone: true,
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice-header.component.html',
})
export class InvoiceHeaderComponent {}
