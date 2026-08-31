import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import type { Product } from '../../models/product.entity';

@Component({
  selector: 'app-product-details-info-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './product-details-info-panel.component.html',
})
export class ProductDetailsInfoPanelComponent {
  readonly product = input.required<Product>();
  readonly edit = output<void>();
}
