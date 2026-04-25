import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-product-header',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent],
  template: `
    <app-page-header
      title="Product Catalog"
      description="Manage your product inventory and pricing from a central dashboard."
      eyebrow="Catalog operations"
    >
      <div class="w-full sm:w-auto">
        <p-button
          label="Create Product"
          icon="pi pi-plus"
          styleClass="w-full sm:w-auto rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow-sm hover:opacity-90 transition-all focus:ring-2 focus:ring-focus"
          (onClick)="create.emit()"
          class="w-full sm:w-auto"
        />
      </div>
    </app-page-header>
  `
})
export class ProductHeaderComponent {
  create = output<void>();
}
