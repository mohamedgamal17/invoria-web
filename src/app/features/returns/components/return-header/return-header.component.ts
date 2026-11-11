import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-return-header',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent],
  templateUrl: './return-header.component.html',
})
export class ReturnHeaderComponent {}
