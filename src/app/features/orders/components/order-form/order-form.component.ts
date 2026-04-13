import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';

import type { Customer } from '../../../customers/models/customer.entity';
import type { Product } from '../../../products/models/product.entity';
import type { UiOrderItem } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputNumberModule,
    TableModule
  ],
  templateUrl: './order-form.component.html'
})
export class OrderFormComponent {
  mode = input<'create' | 'edit'>('create');
  orderNumber = input('');
  totalAmount = input(0);
  draftItems = input<UiOrderItem[]>([]);
  saving = input(false);

  selectedCustomer = model<Customer | null>(null);
  customers = input<Customer[]>([]);
  isCustomerLoading = input(false);

  selectedProduct = model<Product | null>(null);
  products = input<Product[]>([]);
  isProductLoading = input(false);
  itemQuantity = model(1);
  itemPrice = model(0);

  submit = output<void>();
  cancel = output<void>();

  searchCustomers = output<{ query: string }>();
  customerSelect = output<unknown>();
  clearCustomer = output<void>();

  searchProducts = output<{ query: string }>();
  productSelect = output<unknown>();
  clearProduct = output<void>();

  addItem = output<void>();
  removeItem = output<number>();
  calculateTotal = output<void>();

  get totalItemsCount(): number {
    return this.draftItems().reduce((acc, item) => acc + item.quantity, 0);
  }
}
