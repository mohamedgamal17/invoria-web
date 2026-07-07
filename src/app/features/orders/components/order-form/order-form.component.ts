import { CommonModule } from '@angular/common';
import { Component, effect, input, model, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TableModule } from 'primeng/table';

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { Customer } from '../../../customers/models/customer.entity';
import type { Product } from '../../../products/models/product.entity';
import { PaymentType, paymentTypeLabel } from '../../models/order-payment.enums';
import type { UiOrderItem } from '../../models/order-ui.model';

/** PrimeNG stepper uses 1-based step indices: 1 Details, 2 Line items */
type OrderFormStepperStep = 1 | 2;
type OrderFormEditTab = 0 | 1;

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputNumberModule,
    TableModule,
    SelectModule,
    StepperModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    SurfaceCardComponent
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

  paymentType = model<PaymentType>(PaymentType.Immediate);

  readonly paymentTypeOptions: { label: string; value: PaymentType }[] = [
    { label: paymentTypeLabel(PaymentType.Immediate), value: PaymentType.Immediate },
    { label: paymentTypeLabel(PaymentType.Debt), value: PaymentType.Debt }
  ];

  readonly paymentTypeLabel = paymentTypeLabel;

  readonly activeStep = signal<OrderFormStepperStep>(1);
  readonly activeTab = signal<OrderFormEditTab>(0);
  readonly stepError = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.selectedCustomer();
      if (this.activeStep() === 1) {
        untracked(() => this.stepError.set(null));
      }
    });
    effect(() => {
      this.draftItems();
      if (this.activeStep() === 2) {
        untracked(() => this.stepError.set(null));
      }
    });
  }

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

  onStepperValueChange(value: number | undefined): void {
    if (value === 1 || value === 2) {
      this.activeStep.set(value as OrderFormStepperStep);
    }
  }

  goToDetailsNext(activateCallback: (step: number) => void): void {
    const error = this.validateDetailsStep();
    if (error) {
      this.stepError.set(error);
      return;
    }
    this.stepError.set(null);
    this.activeStep.set(2);
    activateCallback(2);
  }

  goToItemsNext(activateCallback: (step: number) => void): void {
    const error = this.validateItemsStep();
    if (error) {
      this.stepError.set(error);
      return;
    }
    this.stepError.set(null);
    if (this.mode() === 'create') {
      this.submit.emit();
    }
  }

  stepBack(activateCallback: (step: number) => void, target: OrderFormStepperStep): void {
    this.stepError.set(null);
    this.activeStep.set(target);
    activateCallback(target);
  }

  onEditTabChange(value: string | number | undefined): void {
    if (value === 0 || value === 1) {
      this.activeTab.set(value);
      this.stepError.set(null);
    }
  }

  private validateDetailsStep(): string | null {
    if (this.mode() === 'create' && !this.selectedCustomer()?.id?.trim()) {
      return 'Please select a customer before continuing.';
    }
    return null;
  }

  private validateItemsStep(): string | null {
    if (!this.draftItems().length) {
      return 'Add at least one product before continuing.';
    }
    return null;
  }

  formSubmit(event: Event): void {
    event.preventDefault();
    const detailsError = this.validateDetailsStep();
    if (detailsError) {
      this.stepError.set(detailsError);
      return;
    }
    const itemsError = this.validateItemsStep();
    if (itemsError) {
      this.stepError.set(itemsError);
      return;
    }
    this.stepError.set(null);
    if (this.mode() === 'create') {
      if (this.activeStep() !== 2) return;
    }
    this.submit.emit();
  }
}
