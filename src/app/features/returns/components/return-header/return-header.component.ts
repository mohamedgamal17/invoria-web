import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-return-header',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent],
  template: `
    <app-page-header
      title="Returns"
      description="Manage product returns and track their status."
      eyebrow="Returns management"
    />
  `
})
export class ReturnHeaderComponent {
}
