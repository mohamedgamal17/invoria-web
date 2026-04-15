import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type ProductsBreadcrumbItem = {
  label: string;
  routerLink?: string[];
};

@Component({
  selector: 'app-products-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
      @for (item of items(); track $index) {
        @if ($index > 0) {
          <span class="text-border select-none" aria-hidden="true">/</span>
        }
        @if (item.routerLink?.length) {
          <a
            [routerLink]="item.routerLink"
            class="font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
          >
            {{ item.label }}
          </a>
        } @else {
          <span class="font-semibold text-foreground">{{ item.label }}</span>
        }
      }
    </nav>
  `
})
export class ProductsBreadcrumbComponent {
  items = input.required<ProductsBreadcrumbItem[]>();
}
