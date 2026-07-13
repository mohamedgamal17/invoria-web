import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import type { Product } from '../../models/product.entity';

@Component({
  selector: 'app-product-details-info-panel',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './product-details-info-panel.component.html',
})
export class ProductDetailsInfoPanelComponent {
  readonly product = input.required<Product>();
}
