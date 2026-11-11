import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-invoice-header',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './invoice-header.component.html',
})
export class InvoiceHeaderComponent {}
