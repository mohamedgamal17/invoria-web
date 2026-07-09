import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-invoice-header',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      title="Invoices"
      description="View and manage your invoice records."
      eyebrow="Invoicing"
      eyebrowIcon="pi pi-file"
    />
  `
})
export class InvoiceHeaderComponent {}
