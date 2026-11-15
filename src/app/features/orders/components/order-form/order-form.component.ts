import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { map, startWith } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TableModule } from 'primeng/table';

import { AutosearchComponent } from '../../../../shared/ui/autosearch/autosearch.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { Customer } from '../../../customers/models/customer.entity';
import type { Product } from '../../../products/models/product.entity';
import type { OrderItem } from '../../models/order.entity';
import { PaymentType, paymentTypeLabel } from '../../models/order-payment.enums';

/** PrimeNG stepper uses 1-based step indices: 1 Details, 2 Line items */
type OrderFormStepperStep = 1 | 2;
type OrderFormEditTab = 0 | 1;

type OrderLineItemFormGroup = FormGroup<{
  id: FormControl<string>;
  productId: FormControl<string>;
  product: FormControl<Product>;
  quantity: FormControl<number>;
  price: FormControl<number>;
}>;

/** Validated payload emitted on submit; the page turns it into the API request. */
export interface OrderFormSubmitEvent {
  customerId: string;
  paymentType: PaymentType;
  items: OrderItem[];
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    AutosearchComponent,
    SurfaceCardComponent
  ],
  templateUrl: './order-form.component.html'
})
export class OrderFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  mode = input<'create' | 'edit'>('create');
  orderNumber = input('');
  /** Display-only order total (server value on edit, live sum of the lines on create). */
  totalAmount = input(0);
  saving = input(false);

  /** Customer suggestions come from the page (it owns debounce + API). */
  customers = input<Customer[]>([]);
  isCustomerLoading = input(false);

  /** Product suggestions come from the page (it owns debounce + API + cache). */
  products = input<Product[]>([]);
  isProductLoading = input(false);

  /** Seed values for edit mode; the form is the single source of truth afterwards. */
  initialCustomer = input<Customer | null>(null);
  initialPaymentType = input<PaymentType>(PaymentType.Immediate);
  initialItems = input<OrderItem[]>([]);

  readonly paymentTypeOptions: { label: string; value: PaymentType }[] = [
    { label: paymentTypeLabel(PaymentType.Immediate), value: PaymentType.Immediate },
    { label: paymentTypeLabel(PaymentType.Debt), value: PaymentType.Debt }
  ];

  readonly paymentTypeLabel = paymentTypeLabel;

  readonly activeStep = signal<OrderFormStepperStep>(1);
  readonly activeTab = signal<OrderFormEditTab>(0);
  readonly stepError = signal<string | null>(null);

  readonly orderForm = this.formBuilder.group({
    customer: this.formBuilder.control<Customer | null>(null),
    paymentType: this.formBuilder.nonNullable.control(PaymentType.Immediate),
    product: this.formBuilder.control<Product | null>(null),
    quantity: this.formBuilder.nonNullable.control(1, [Validators.min(1)]),
    price: this.formBuilder.nonNullable.control(0, [Validators.min(0)]),
    items: this.formBuilder.array<OrderLineItemFormGroup>([])
  });

  private readonly itemsValue = toSignal(
    this.orderForm.controls.items.valueChanges.pipe(
      startWith(this.orderForm.controls.items.getRawValue())
    ),
    { initialValue: this.orderForm.controls.items.getRawValue() }
  );

  private readonly customerValue = toSignal(this.orderForm.controls.customer.valueChanges, {
    initialValue: this.orderForm.controls.customer.value
  });

  readonly totalItemsCount = toSignal(
    this.orderForm.controls.items.valueChanges.pipe(
      startWith(this.orderForm.controls.items.getRawValue()),
      map((lineItems) =>
        lineItems.reduce((total, lineItem) => total + (lineItem.quantity ?? 0), 0)
      )
    ),
    { initialValue: 0 }
  );

  submit = output<OrderFormSubmitEvent>();
  cancel = output<void>();

  searchCustomers = output<{ query: string }>();
  searchProducts = output<{ query: string }>();

  constructor() {
    this.syncInitialCustomer();
    this.syncInitialPaymentType();
    this.syncInitialItems();

    // Live total: the page owns the display value, the form reports its lines.
    this.orderForm.controls.items
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.itemsChange.emit(this.currentItems()));

    effect(() => {
      const customerControl = this.orderForm.controls.customer;
      const customerValidators = this.mode() === 'create' ? [Validators.required] : [];
      customerControl.setValidators(customerValidators);
      customerControl.updateValueAndValidity({ emitEvent: false });
    });

    effect(() => {
      this.customerValue();
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

  readonly itemsChange = output<OrderItem[]>();

  lineItemTotal(lineItemGroup: OrderLineItemFormGroup): number {
    return lineItemGroup.controls.price.value * lineItemGroup.controls.quantity.value;
  }

  onProductSelect(product: Product): void {
    if (!product?.id) {
      return;
    }
    this.orderForm.controls.quantity.setValue(1);
    this.orderForm.controls.price.setValue(product.price);
  }

  clearProductSelection(): void {
    this.orderForm.controls.product.setValue(null);
    this.orderForm.controls.quantity.setValue(1);
    this.orderForm.controls.price.setValue(0);
  }

  addItem(): void {
    const product = this.orderForm.controls.product.value;
    if (!product) {
      return;
    }
    const quantity = this.orderForm.controls.quantity.value > 0
      ? this.orderForm.controls.quantity.value
      : 1;

    const items = this.orderForm.controls.items;
    const existingIndex = items
      .getRawValue()
      .findIndex((lineItem) => lineItem.productId === product.id);
    if (existingIndex > -1) {
      const existing = items.at(existingIndex);
      existing.controls.quantity.setValue(existing.controls.quantity.value + quantity);
    } else {
      items.push(
        this.formBuilder.group({
          id: this.formBuilder.nonNullable.control(''),
          productId: this.formBuilder.nonNullable.control(product.id),
          product: this.formBuilder.nonNullable.control(product),
          quantity: this.formBuilder.nonNullable.control(quantity, [Validators.min(1)]),
          price: this.formBuilder.nonNullable.control(this.orderForm.controls.price.value, [
            Validators.min(0)
          ])
        })
      );
    }

    this.clearProductSelection();
  }

  removeItem(index: number): void {
    this.orderForm.controls.items.removeAt(index);
  }

  onStepperValueChange(value: number | undefined): void {
    if (value === 1 || value === 2) {
      this.activeStep.set(value as OrderFormStepperStep);
    }
  }

  goToDetailsNext(activateCallback: (step: number) => void): void {
    this.orderForm.controls.customer.markAsTouched();
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
    this.orderForm.controls.items.markAsTouched();
    const error = this.validateItemsStep();
    if (error) {
      this.stepError.set(error);
      return;
    }
    this.stepError.set(null);
    if (this.mode() === 'create') {
      this.submit.emit(this.buildSubmitPayload());
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

  formSubmit(event: Event): void {
    event.preventDefault();
    this.orderForm.markAllAsTouched();
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
    if (this.mode() === 'create' && this.activeStep() !== 2) {
      return;
    }
    this.submit.emit(this.buildSubmitPayload());
  }

  private buildSubmitPayload(): OrderFormSubmitEvent {
    return {
      customerId: this.orderForm.controls.customer.value?.id?.trim() ?? '',
      paymentType: this.orderForm.controls.paymentType.value,
      items: this.currentItems()
    };
  }

  private currentItems(): OrderItem[] {
    return this.orderForm.controls.items.getRawValue();
  }

  private validateDetailsStep(): string | null {
    if (this.mode() === 'create' && !this.orderForm.controls.customer.value?.id?.trim()) {
      return 'Please select a customer before continuing.';
    }
    return null;
  }

  private validateItemsStep(): string | null {
    const items = this.currentItems();
    if (!items.length) {
      return 'Add at least one product before continuing.';
    }
    const hasInvalidItem = items.some((item) => item.quantity < 1 || item.price < 0);
    if (hasInvalidItem) {
      return 'Each line must have quantity and unit price greater than zero.';
    }
    return null;
  }

  /** Seeds the customer control from the page (edit load). */
  private syncInitialCustomer(): void {
    effect(() => {
      const initialCustomer = this.initialCustomer();
      if (!initialCustomer) {
        return;
      }
      const currentCustomer = untracked(() => this.orderForm.controls.customer.value);
      if (currentCustomer?.id === initialCustomer.id) {
        return;
      }
      untracked(() => this.orderForm.controls.customer.setValue(initialCustomer));
    });
  }

  /** Seeds the payment type from the page (edit load). */
  private syncInitialPaymentType(): void {
    effect(() => {
      const initialPaymentType = this.initialPaymentType();
      const currentPaymentType = untracked(() => this.orderForm.controls.paymentType.value);
      if (currentPaymentType === initialPaymentType) {
        return;
      }
      untracked(() => this.orderForm.controls.paymentType.setValue(initialPaymentType));
    });
  }

  /** Seeds the line items from the page (edit load) without clobbering later user edits. */
  private syncInitialItems(): void {
    effect(() => {
      const initialItems = this.initialItems();
      const currentItems = untracked(() => this.currentItems());
      if (this.lineItemsEqual(initialItems, currentItems)) {
        return;
      }
      untracked(() => this.replaceLineItems(initialItems));
    });
  }

  private replaceLineItems(items: readonly OrderItem[]): void {
    const itemsArray = this.orderForm.controls.items;
    itemsArray.clear({ emitEvent: false });
    items.forEach((item) => itemsArray.push(this.buildLineItemGroup(item), { emitEvent: false }));
  }

  private buildLineItemGroup(item: OrderItem): OrderLineItemFormGroup {
    return this.formBuilder.group({
      id: this.formBuilder.nonNullable.control(item.id),
      productId: this.formBuilder.nonNullable.control(item.productId),
      product: this.formBuilder.nonNullable.control(item.product),
      quantity: this.formBuilder.nonNullable.control(item.quantity, [Validators.min(1)]),
      price: this.formBuilder.nonNullable.control(item.price, [Validators.min(0)])
    });
  }

  private lineItemsEqual(left: readonly OrderItem[], right: readonly OrderItem[]): boolean {
    if (left.length !== right.length) {
      return false;
    }
    return left.every((leftItem, itemIndex) => {
      const rightItem = right[itemIndex];
      return (
        leftItem.id === rightItem.id &&
        leftItem.productId === rightItem.productId &&
        leftItem.product.name === rightItem.product.name &&
        leftItem.quantity === rightItem.quantity &&
        leftItem.price === rightItem.price
      );
    });
  }
}
