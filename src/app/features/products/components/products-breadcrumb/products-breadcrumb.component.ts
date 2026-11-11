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
  templateUrl: './products-breadcrumb.component.html',
})
export class ProductsBreadcrumbComponent {
  items = input.required<ProductsBreadcrumbItem[]>();
}
