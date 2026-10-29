import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-receivable-header',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      title="Receivables"
      description="View and manage your receivable records."
      eyebrow="Financial"
      eyebrowIcon="pi pi-file"
    />
  `
})
export class ReceivableHeaderComponent {}
