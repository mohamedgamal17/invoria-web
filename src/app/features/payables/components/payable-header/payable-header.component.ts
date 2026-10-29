import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-payable-header',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      title="Payables"
      description="View and manage your payable records."
      eyebrow="Financial"
      eyebrowIcon="pi pi-file"
    />
  `
})
export class PayableHeaderComponent {}
