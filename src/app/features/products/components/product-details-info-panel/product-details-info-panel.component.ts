import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import type { Product } from '../../models/product.entity';
import { DEFAULT_CURRENCY_CODE } from '../../../../shared/models/currency';

@Component({
  selector: 'app-product-details-info-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-details-info-panel.component.html',
})
export class ProductDetailsInfoPanelComponent {
  protected readonly currencyCode = signal(DEFAULT_CURRENCY_CODE);
  readonly product = input.required<Product>();
  readonly edit = output<void>();
}
