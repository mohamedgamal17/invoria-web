import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-order-header',
  standalone: true,
  imports: [ButtonModule],
  styles: [':host { display: block; width: 100%; }'],
  template: `
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ title() }}</h1>
        <p class="text-sm text-muted-foreground">{{ description() }}</p>
      </div>
      <div class="w-full sm:w-auto">
        <p-button
          label="Create Order"
          icon="pi pi-plus"
          styleClass="w-full sm:w-auto rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all focus:ring-2 focus:ring-focus"
          (onClick)="create.emit()"
          class="w-full sm:w-auto"
        />
      </div>
    </div>
  `
})
export class OrderHeaderComponent {
  title = input('Orders');
  description = input('Manage and track your customer orders and status updates.');
  create = output<void>();
}
