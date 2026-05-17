import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-supplier-header',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent],
  template: `
    <app-page-header [title]="title()" [description]="description()" [eyebrow]="eyebrow()">
      <div class="w-full sm:w-auto">
        <p-button
          label="Create Supplier"
          icon="pi pi-plus"
          styleClass="w-full sm:w-auto rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow-sm hover:opacity-90 transition-all focus:ring-2 focus:ring-focus"
          (onClick)="create.emit()"
          class="w-full sm:w-auto"
        />
      </div>
    </app-page-header>
  `
})
export class SupplierHeaderComponent {
  title = input('Suppliers');
  description = input(
    'Manage procurement suppliers, codes, and contact details.'
  );
  eyebrow = input('Procurement');
  create = output<void>();
}
