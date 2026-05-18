import { CommonModule } from '@angular/common';
import { Component, effect, input, model, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TableModule } from 'primeng/table';

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { Product } from '../../../products/models/product.entity';
import type { PurchaseOrderSupplierRef } from '../../models/purchase-order.entity';
import type { UiPurchaseOrderItem } from '../../models/purchase-order-ui.model';
import { SupplierIdControlComponent } from '../supplier-id-control/supplier-id-control.component';

/** PrimeNG stepper uses 1-based step indices: 1 Details, 2 Line items, 3 Review */
type PurchaseOrderFormStepperStep = 1 | 2 | 3;
type PurchaseOrderFormEditTab = 0 | 1;

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    StepperModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TableModule,
    SurfaceCardComponent,
    SupplierIdControlComponent
  ],
  templateUrl: './purchase-order-form.component.html'
})
export class PurchaseOrderFormComponent {
  mode = input<'create' | 'edit'>('create');
  purchaseNumber = input('');
  subTotal = input(0);
  taxAmount = model(0);
  discountAmount = model(0);
  orderDate = model('');
  expectedDeliveryDate = model('');
  draftItems = input<UiPurchaseOrderItem[]>([]);
  saving = input(false);

  supplierId = model('');
  resolvedSupplier = input<PurchaseOrderSupplierRef | null>(null);

  selectedProduct = model<Product | null>(null);
  products = input<Product[]>([]);
  isProductLoading = input(false);
  itemQuantity = model(1);
  itemUnitPrice = model(0);
  itemSupplierProductCode = model('');

  readonly activeStep = signal<PurchaseOrderFormStepperStep>(1);
  readonly activeTab = signal<PurchaseOrderFormEditTab>(0);
  readonly stepError = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.supplierId();
      this.taxAmount();
      this.discountAmount();
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

  searchProducts = output<{ query: string }>();
  productSelect = output<unknown>();
  clearProduct = output<void>();

  addItem = output<void>();
  removeItem = output<number>();
  calculateTotal = output<void>();

  get totalItemsCount(): number {
    return this.draftItems().reduce((acc, item) => acc + item.quantity, 0);
  }

  reviewTotalAmount(): number {
    return Math.max(0, this.subTotal() + this.taxAmount() - this.discountAmount());
  }

  reviewSupplierDisplay(): string {
    const ref = this.resolvedSupplier();
    if (ref?.name?.trim() && ref.id === this.supplierId()) {
      return ref.name.trim();
    }
    const id = this.supplierId().trim();
    return id || '—';
  }

  onStepperValueChange(value: number | undefined): void {
    if (value !== 1 && value !== 2 && value !== 3) {
      return;
    }
    const current = this.activeStep();
    if (value === current) {
      return;
    }

    if (value > current) {
      if (value >= 2) {
        const detailsError = this.validateDetailsStep();
        if (detailsError) {
          this.stepError.set(detailsError);
          return;
        }
      }
      if (value >= 3) {
        const itemsError = this.validateItemsStep();
        if (itemsError) {
          this.stepError.set(itemsError);
          return;
        }
      }
    }

    this.stepError.set(null);
    this.activeStep.set(value);
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
    this.activeStep.set(3);
    activateCallback(3);
  }

  stepBack(activateCallback: (step: number) => void, target: PurchaseOrderFormStepperStep): void {
    this.stepError.set(null);
    this.activeStep.set(target);
    activateCallback(target);
  }

  private validateDetailsStep(): string | null {
    if (this.mode() === 'create' && !this.supplierId().trim()) {
      return 'Please search and select a supplier before continuing.';
    }
    if (this.taxAmount() < 0) {
      return 'Tax must be zero or greater.';
    }
    if (this.discountAmount() < 0) {
      return 'Discount must be zero or greater.';
    }
    return null;
  }

  private validateItemsStep(): string | null {
    if (!this.draftItems().length) {
      return 'Add at least one line item before continuing.';
    }
    const invalid = this.draftItems().find((i) => i.quantity <= 0 || i.unitPrice <= 0);
    if (invalid) {
      return 'Each line must have quantity and unit price greater than zero.';
    }
    return null;
  }

  onEditTabChange(value: string | number | undefined): void {
    if (value === 0 || value === 1) {
      this.activeTab.set(value);
      this.stepError.set(null);
    }
  }

  formSubmit(event: Event): void {
    event.preventDefault();
    if (this.mode() === 'edit') {
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
      this.submit.emit();
      return;
    }
    if (this.activeStep() !== 3) return;
    this.submit.emit();
  }
}
