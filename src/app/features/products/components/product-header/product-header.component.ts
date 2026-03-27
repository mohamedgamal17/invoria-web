import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product-header',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div class="w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Product Catalog</h1>
        <p class="text-sm text-muted-foreground">Manage your product inventory and pricing from a central dashboard.</p>
      </div>
      <div class="w-full sm:w-auto">
        <p-button
          label="Create Product"
          icon="pi pi-plus"
          styleClass="w-full sm:w-auto rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all focus:ring-2 focus:ring-focus"
          (onClick)="create.emit()"
          class="w-full sm:w-auto"
        />
      </div>
    </div>
  `
})
export class ProductHeaderComponent {
  create = output<void>();
}
