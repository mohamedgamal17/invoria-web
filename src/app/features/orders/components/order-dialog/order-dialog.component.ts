import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import type { UiOrderItem } from '../../models/order-ui.model';
import type { Product } from '../../../products/models/product.entity';
import type { Customer } from '../../../customers/models/customer.entity';

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    AutoCompleteModule,
    DatePickerModule,
    TableModule,
    TooltipModule
  ],
  templateUrl: './order-dialog.component.html'
})
export class OrderDialogComponent {
  visible = model(false);
  mode = input<'create' | 'edit'>('create');
  draft = input<any>({});
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

  orderSubmit = output<void>();
  cancel = output<void>();
  hide = output<void>();
  itemPriceChange = output<number>(); // Kept for compatibility, but model() handles it

  searchCustomers = output<any>();
  customerSelect = output<any>();
  clearCustomer = output<void>();

  searchProducts = output<any>();
  productSelect = output<any>();
  clearProduct = output<void>();

  addItem = output<void>();
  removeItem = output<number>();
  calculateTotal = output<void>();

  get totalItemsCount(): number {
    return this.draftItems().reduce((acc, item) => acc + item.quantity, 0);
  }

  onHide() {
    this.visible.set(false);
    this.hide.emit();
  }
}
