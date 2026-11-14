import { CommonModule } from '@angular/common';
import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  computed,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import {
  FormBuilder,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';

import { boundedAmountValidator, MONEY_EPS } from '../../../../shared/utils/validators';
import {
  OrderPaymentMethod,
  PaymentType,
  paymentMethodLabel
} from '../../models/order-payment.enums';
import type {
  RecordOrderPaymentForm,
  RecordOrderPaymentRequest
} from '../../models/record-order-payment.request';
import type { UiOrder } from '../../models/order-ui.model';

@Component({
  selector: 'app-record-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    MessageModule,
    SelectModule
  ],
  templateUrl: './record-payment-dialog.component.html'
})
export class RecordPaymentDialogComponent implements OnChanges, OnInit {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');
  readonly saving = input(false);

  /** Validated submit intent; the details page dispatches the API call. */
  readonly paymentSubmit = output<RecordOrderPaymentRequest>();

  readonly visible = model(false);
  /** Form-level error for edge cases that are not field errors (e.g. unknown payment type). */
  readonly formError = signal<string | null>(null);

  /** Reactive dialog form, built once in ngOnInit; validators read the order for payment-type rules. */
  recordPaymentForm!: RecordOrderPaymentForm;

  readonly paymentMethodOptions = [
    { label: paymentMethodLabel(OrderPaymentMethod.Cash), value: OrderPaymentMethod.Cash },
    { label: paymentMethodLabel(OrderPaymentMethod.BankTransfer), value: OrderPaymentMethod.BankTransfer },
    { label: paymentMethodLabel(OrderPaymentMethod.Cheque), value: OrderPaymentMethod.Cheque },
    { label: paymentMethodLabel(OrderPaymentMethod.Other), value: OrderPaymentMethod.Other }
  ];

  readonly isImmediatePayment = computed(() => this.order().paymentType === PaymentType.Immediate);

  /** Debt: outstanding above the money tolerance caps the payment; otherwise the cap is the order total. */
  readonly hasOutstandingBalance = computed(() => (this.order().amountOutstanding ?? 0) > MONEY_EPS);

  /**
   * Immediate — the full order total is the only allowed payment;
   * Debt — up to the outstanding balance (order total once fully paid);
   * unknown payment type — null, surfaced as a form-level error on submit.
   */
  private readonly amountRule = computed<{ min: number; max: number; initialAmount: number | null } | null>(() => {
    const order = this.order();
    switch (order.paymentType) {
      case PaymentType.Immediate:
        return {
          min: order.netOfTotalOrderAmount,
          max: order.netOfTotalOrderAmount,
          initialAmount: order.netOfTotalOrderAmount
        };
      case PaymentType.Debt: {
        const outstandingBalance = this.hasOutstandingBalance() ? (order.amountOutstanding ?? 0) : null;
        return {
          min: 0.01,
          max: outstandingBalance ?? order.netOfTotalOrderAmount,
          initialAmount: outstandingBalance
        };
      }
      default:
        return null;
    }
  });

  readonly recordPaidAmountMax = computed(
    () => this.amountRule()?.max ?? this.order().netOfTotalOrderAmount
  );

  readonly recordPaidAmountMin = computed(
    () => this.amountRule()?.min ?? this.order().netOfTotalOrderAmount
  );

  private readonly formBuilder = inject(FormBuilder);
  private readonly nonNullableFormBuilder = inject(NonNullableFormBuilder);

  /** Revalidate the amount whenever the order input changes (e.g. refreshed while the dialog is open). */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] && this.recordPaymentForm) {
      this.recordPaymentForm.controls.paidAmount.updateValueAndValidity();
    }
  }

  ngOnInit(): void {
    this.recordPaymentForm = this.buildRecordPaymentForm(this.amountRule()?.initialAmount ?? null);
  }

  /** Dialog reopened: reset the existing form with the current order's payment rule. */
  onDialogShow(): void {
    this.recordPaymentForm.reset({
      paidAmount: this.amountRule()?.initialAmount ?? null,
      paymentMethod: OrderPaymentMethod.Cash
    });
    this.formError.set(null);
  }

  closeDialog(): void {
    this.visible.set(false);
  }

  /** UI validation only — no API here; the details page owns the recordPayment call. */
  submitPayment(): void {
    const order = this.order();
    if (order.paymentType !== PaymentType.Immediate && order.paymentType !== PaymentType.Debt) {
      this.formError.set('Payment type is not set for this order.');
      return;
    }

    this.formError.set(null);
    const form = this.recordPaymentForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const rawValue = form.getRawValue();
    const paidAmount = rawValue.paidAmount;
    if (paidAmount === null) {
      return;
    }

    this.paymentSubmit.emit({
      PaidAmount: paidAmount,
      PaymentMethod: rawValue.paymentMethod,
      PaidAt: null
    });
  }

  private buildRecordPaymentForm(initialAmount: number | null): RecordOrderPaymentForm {
    return this.formBuilder.group({
      paidAmount: this.formBuilder.control<number | null>(initialAmount, {
        validators: [Validators.required, this.paymentAmountValidator()]
      }),
      paymentMethod: this.nonNullableFormBuilder.control(OrderPaymentMethod.Cash)
    });
  }

  /**
   * Payment-type amount rules on every value change, delegated to the shared
   * bounded-amount validator: Immediate — exact order total; Debt — min/cap range;
   * unknown payment type — null range disables the check.
   */
  private paymentAmountValidator(): ValidatorFn {
    return boundedAmountValidator(() => {
      const rule = this.amountRule();
      return rule === null ? null : { min: rule.min, max: rule.max };
    });
  }
}
