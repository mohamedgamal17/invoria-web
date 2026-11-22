import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { StepperModule } from 'primeng/stepper';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TableModule } from 'primeng/table';

import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';
import { AutosearchComponent } from '@invoria/ui';
import { SurfaceCardComponent } from '@invoria/ui';
import type { Product } from '@invoria/catalog';
import type { SupplierChoice } from '@invoria/procurement/suppliers/models/supplier.entity';
import type { PurchaseOrderSupplierRef } from '@invoria/procurement/purchase-orders/models/purchase-order.entity';
import type { UiPurchaseOrderItem } from '@invoria/procurement/purchase-orders/models/purchase-order-ui.model';

/** PrimeNG stepper uses 1-based step indices: 1 Details, 2 Line items, 3 Review */
type PurchaseOrderFormStepperStep = 1 | 2 | 3;
type PurchaseOrderFormEditTab = 0 | 1;

type PurchaseOrderLineItemGroup = FormGroup<{
  productId: FormControl<string>;
  productName: FormControl<string>;
  quantity: FormControl<number>;
  unitPrice: FormControl<number>;
}>;

/** Validated payload emitted on submit; the page turns it into the API request. */
export interface PurchaseOrderFormSubmitEvent {
  supplierId: string;
  items: UiPurchaseOrderItem[];
}

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    StepperModule,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    TabPanels,
    TableModule,
    AutosearchComponent,
    SurfaceCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchase-order-form.component.html',
})
export class PurchaseOrderFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly currencyCode = signal(DEFAULT_CURRENCY_CODE);
  mode = input<'create' | 'edit'>('create');
  purchaseNumber = input('');
  saving = input(false);

  /** Supplier suggestions come from the page (it owns debounce + API + cache). */
  suppliers = input<SupplierChoice[]>([]);
  /** Loaded supplier of the edited purchase order, used to seed the supplier control. */
  resolvedSupplier = input<PurchaseOrderSupplierRef | null>(null);

  /** Product suggestions come from the page (it owns debounce + API + cache). */
  products = input<Product[]>([]);
  isProductLoading = input(false);

  /** Line items to seed the form with (edit mode); later edits stay inside the form. */
  initialItems = input<UiPurchaseOrderItem[]>([]);

  readonly activeStep = signal<PurchaseOrderFormStepperStep>(1);
  readonly activeTab = signal<PurchaseOrderFormEditTab>(0);
  readonly stepError = signal<string | null>(null);

  readonly purchaseOrderForm = this.formBuilder.group({
    supplier: this.formBuilder.control<SupplierChoice | null>(null),
    product: this.formBuilder.control<Product | null>(null),
    quantity: this.formBuilder.nonNullable.control(1, [Validators.min(1)]),
    unitPrice: this.formBuilder.nonNullable.control(0, [Validators.min(0.01)]),
    items: this.formBuilder.array<PurchaseOrderLineItemGroup>([]),
  });

  private readonly itemsValue = toSignal(
    this.purchaseOrderForm.controls.items.valueChanges.pipe(
      startWith(this.purchaseOrderForm.controls.items.getRawValue()),
      map((lineItems) => lineItems as unknown as UiPurchaseOrderItem[]),
    ),
    { initialValue: [] as UiPurchaseOrderItem[] },
  );

  readonly draftItems = computed(() => this.itemsValue());
  readonly subTotal = computed(() =>
    this.itemsValue().reduce(
      (total, lineItem) => total + lineItem.unitPrice * lineItem.quantity,
      0,
    ),
  );
  readonly totalItemsCount = computed(() =>
    this.itemsValue().reduce((total, lineItem) => total + lineItem.quantity, 0),
  );

  submit = output<PurchaseOrderFormSubmitEvent>();
  cancel = output<void>();

  searchProducts = output<{ query: string }>();
  searchSuppliers = output<{ query: string }>();

  constructor() {
    this.syncInitialItems();
    this.syncResolvedSupplier();

    effect(() => {
      if (this.saving()) {
        this.purchaseOrderForm.disable({ emitEvent: false });
      } else {
        this.purchaseOrderForm.enable({ emitEvent: false });
      }
    });

    effect(() => {
      this.purchaseOrderForm.controls.supplier.value;
      if (this.activeStep() === 1) {
        untracked(() => this.stepError.set(null));
      }
    });

    effect(() => {
      this.itemsValue();
      if (this.activeStep() === 2) {
        untracked(() => this.stepError.set(null));
      }
    });
  }

  lineGroup(index: number): PurchaseOrderLineItemGroup {
    return this.purchaseOrderForm.controls.items.at(index);
  }

  lineTotal(lineGroup: PurchaseOrderLineItemGroup): number {
    const line = lineGroup.getRawValue();
    return line.unitPrice * line.quantity;
  }

  reviewSupplierDisplay(): string {
    return this.purchaseOrderForm.controls.supplier.value?.name?.trim() || '—';
  }

  onSupplierSelect(): void {
    this.stepError.set(null);
  }

  onSupplierCleared(): void {
    this.stepError.set(null);
  }

  onProductSelect(product: Product): void {
    this.purchaseOrderForm.controls.quantity.setValue(1);
    this.purchaseOrderForm.controls.unitPrice.setValue(product.price > 0 ? product.price : 0.01);
  }

  clearProductSelection(): void {
    this.purchaseOrderForm.controls.product.setValue(null);
    this.purchaseOrderForm.controls.quantity.setValue(1);
    this.purchaseOrderForm.controls.unitPrice.setValue(0);
  }

  addItem(): void {
    const product = this.purchaseOrderForm.controls.product.value;
    if (!product) {
      return;
    }

    const quantity = this.purchaseOrderForm.controls.quantity.value || 1;
    const unitPrice = this.purchaseOrderForm.controls.unitPrice.value;
    if (unitPrice <= 0) {
      this.messageStepError('Unit price must be greater than zero.');
      return;
    }

    const items = this.purchaseOrderForm.controls.items;
    const existingIndex = items
      .getRawValue()
      .findIndex((lineItem) => lineItem.productId === product.id);
    if (existingIndex > -1) {
      const existing = items.at(existingIndex);
      existing.controls.quantity.setValue(existing.controls.quantity.value + quantity);
    } else {
      items.push(
        this.formBuilder.group({
          productId: this.formBuilder.nonNullable.control(product.id),
          productName: this.formBuilder.nonNullable.control(product.name),
          quantity: this.formBuilder.nonNullable.control(quantity, [Validators.min(1)]),
          unitPrice: this.formBuilder.nonNullable.control(unitPrice, [Validators.min(0.01)]),
        }),
      );
    }

    this.clearProductSelection();
  }

  removeItem(index: number): void {
    this.purchaseOrderForm.controls.items.removeAt(index);
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

  onEditTabChange(value: string | number | undefined): void {
    if (value === 0 || value === 1) {
      this.activeTab.set(value);
      this.stepError.set(null);
    }
  }

  formSubmit(event: Event): void {
    event.preventDefault();
    this.purchaseOrderForm.markAllAsTouched();

    if (this.mode() === 'create' && this.activeStep() !== 3) {
      return;
    }

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
    this.submit.emit(this.buildSubmitPayload());
  }

  private buildSubmitPayload(): PurchaseOrderFormSubmitEvent {
    return {
      supplierId: this.purchaseOrderForm.controls.supplier.value?.id?.trim() ?? '',
      items: this.purchaseOrderForm.controls.items.getRawValue(),
    };
  }

  private validateDetailsStep(): string | null {
    if (this.mode() === 'create' && !this.purchaseOrderForm.controls.supplier.value?.id?.trim()) {
      return 'Please search and select a supplier before continuing.';
    }
    return null;
  }

  private validateItemsStep(): string | null {
    const items = this.itemsValue();
    if (!items.length) {
      return 'Add at least one line item before continuing.';
    }
    const invalidLine = items.find(
      (lineItem) => lineItem.quantity <= 0 || lineItem.unitPrice <= 0,
    );
    if (invalidLine) {
      return 'Each line must have quantity and unit price greater than zero.';
    }
    return null;
  }

  private messageStepError(message: string): void {
    this.stepError.set(message);
  }

  /** Seeds the line items from the page (edit load) without clobbering later user edits. */
  private syncInitialItems(): void {
    effect(() => {
      const initialItems = this.initialItems();
      const currentItems = untracked(() => this.itemsValue());
      if (this.lineItemsEqual(initialItems, currentItems)) {
        return;
      }
      untracked(() => this.replaceLineItems(initialItems));
    });
  }

  private replaceLineItems(items: readonly UiPurchaseOrderItem[]): void {
    const itemsArray = this.purchaseOrderForm.controls.items;
    itemsArray.clear({ emitEvent: false });
    items.forEach((lineItem) =>
      itemsArray.push(
        this.formBuilder.group({
          productId: this.formBuilder.nonNullable.control(lineItem.productId),
          productName: this.formBuilder.nonNullable.control(lineItem.productName),
          quantity: this.formBuilder.nonNullable.control(lineItem.quantity, [Validators.min(1)]),
          unitPrice: this.formBuilder.nonNullable.control(lineItem.unitPrice, [
            Validators.min(0.01),
          ]),
        }),
        { emitEvent: false },
      ),
    );
    itemsArray.updateValueAndValidity({ emitEvent: true });
  }

  /** Seeds the supplier control with the loaded purchase order's supplier (edit mode). */
  private syncResolvedSupplier(): void {
    effect(() => {
      const resolvedSupplier = this.resolvedSupplier();
      if (!resolvedSupplier) {
        return;
      }
      const currentSupplier = untracked(() =>
        this.purchaseOrderForm.controls.supplier.value,
      );
      if (currentSupplier?.id === resolvedSupplier.id) {
        return;
      }
      untracked(() =>
        this.purchaseOrderForm.controls.supplier.setValue({
          id: resolvedSupplier.id,
          name: resolvedSupplier.name,
        }),
      );
    });
  }

  private lineItemsEqual(
    left: readonly UiPurchaseOrderItem[],
    right: readonly UiPurchaseOrderItem[],
  ): boolean {
    if (left.length !== right.length) {
      return false;
    }
    return left.every((leftItem, itemIndex) => {
      const rightItem = right[itemIndex];
      return (
        leftItem.productId === rightItem.productId &&
        leftItem.productName === rightItem.productName &&
        leftItem.quantity === rightItem.quantity &&
        leftItem.unitPrice === rightItem.unitPrice
      );
    });
  }
}
