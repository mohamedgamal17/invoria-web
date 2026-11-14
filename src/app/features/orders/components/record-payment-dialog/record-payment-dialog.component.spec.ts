import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { RecordPaymentDialogComponent } from './record-payment-dialog.component';
import { OrderPaymentMethod, PaymentType } from '../../models/order-payment.enums';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderStatus } from '../../models/order.entity';

function buildOrder(overrides: Partial<UiOrder>): UiOrder {
  return {
    id: 'order-1',
    createdAt: '2026-01-01T00:00:00Z',
    orderNumber: 'ORD-1',
    customerName: 'Customer One',
    netOfTotalOrderAmount: 500,
    returnsTotal: 0,
    status: OrderStatus.Completed,
    orderDate: '2026-01-01T00:00:00Z',
    items: [],
    returnItems: [],
    orderAllocated: false,
    ...overrides
  };
}

describe('RecordPaymentDialogComponent', () => {
  let fixture: ComponentFixture<RecordPaymentDialogComponent>;

  function createWithOrder(order: UiOrder): RecordPaymentDialogComponent {
    fixture = TestBed.createComponent(RecordPaymentDialogComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordPaymentDialogComponent, NoopAnimationsModule]
    }).compileComponents();
  });

  it('should create', () => {
    const component = createWithOrder(
      buildOrder({ paymentType: PaymentType.Immediate, amountOutstanding: 0 })
    );
    expect(component).toBeTruthy();
  });

  describe('immediate payment', () => {
    it('initializes the amount to the full order total and emits the validated request on submit', () => {
      const component = createWithOrder(
        buildOrder({ paymentType: PaymentType.Immediate, amountOutstanding: 0 })
      );

      component.visible.set(true);
      fixture.detectChanges();

      expect(component.recordPaymentForm.controls.paidAmount.value).toBe(500);
      expect(component.recordPaymentForm.valid).toBe(true);

      const emissions: Array<{ PaidAmount: number }> = [];
      const subscription = outputToObservable(component.paymentSubmit).subscribe((request) =>
        emissions.push(request)
      );
      component.submitPayment();

      expect(emissions.length).toBe(1);
      expect(emissions[0]).toEqual({
        PaidAmount: 500,
        PaymentMethod: OrderPaymentMethod.Cash,
        PaidAt: null
      });
      subscription.unsubscribe();
    });

    it('rejects an amount that does not equal the order total', () => {
      const component = createWithOrder(
        buildOrder({ paymentType: PaymentType.Immediate, amountOutstanding: 0 })
      );

      component.visible.set(true);
      fixture.detectChanges();

      const emissions: Array<{ PaidAmount: number }> = [];
      const subscription = outputToObservable(component.paymentSubmit).subscribe((request) =>
        emissions.push(request)
      );
      component.recordPaymentForm.controls.paidAmount.setValue(499);
      component.submitPayment();
      fixture.detectChanges();

      expect(component.recordPaymentForm.controls.paidAmount.invalid).toBe(true);
      expect(component.recordPaymentForm.controls.paidAmount.hasError('amountMismatch')).toBe(true);
      expect((fixture.nativeElement as HTMLElement).textContent).toContain(
        'Immediate payment must equal the full order total.'
      );
      expect(emissions.length).toBe(0);
      subscription.unsubscribe();
    });
  });

  describe('debt payment', () => {
    it('initializes the amount to the outstanding balance and caps it', () => {
      const component = createWithOrder(
        buildOrder({ paymentType: PaymentType.Debt, amountOutstanding: 300 })
      );

      component.visible.set(true);
      fixture.detectChanges();

      expect(component.recordPaymentForm.controls.paidAmount.value).toBe(300);

      const emissions: Array<{ PaidAmount: number }> = [];
      const subscription = outputToObservable(component.paymentSubmit).subscribe((request) =>
        emissions.push(request)
      );

      component.recordPaymentForm.controls.paidAmount.setValue(350);
      component.submitPayment();
      fixture.detectChanges();
      expect(component.recordPaymentForm.controls.paidAmount.invalid).toBe(true);
      expect(component.recordPaymentForm.controls.paidAmount.hasError('max')).toBe(true);
      const renderedErrorText = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(renderedErrorText).toContain('Amount must be between');
      expect(renderedErrorText).toContain('300.00');
      expect(emissions.length).toBe(0);

      component.recordPaymentForm.controls.paidAmount.setValue(200);
      component.submitPayment();
      expect(emissions.length).toBe(1);
      expect(emissions[0]).toEqual({
        PaidAmount: 200,
        PaymentMethod: OrderPaymentMethod.Cash,
        PaidAt: null
      });
      subscription.unsubscribe();
    });

    it('revalidates against a changed order and resets on dialog show', () => {
      const component = createWithOrder(
        buildOrder({ paymentType: PaymentType.Debt, amountOutstanding: 300 })
      );

      component.visible.set(true);
      fixture.detectChanges();
      expect(component.recordPaymentForm.controls.paidAmount.value).toBe(300);

      fixture.componentRef.setInput(
        'order',
        buildOrder({ paymentType: PaymentType.Debt, amountOutstanding: 120 })
      );
      fixture.detectChanges();
      expect(component.recordPaymentForm.controls.paidAmount.invalid).toBe(true);

      component.onDialogShow();

      expect(component.recordPaymentForm.controls.paidAmount.value).toBe(120);
      expect(component.recordPaymentForm.valid).toBe(true);
    });
  });

  it('blocks submit with a form error when the order has no payment type', () => {
    const component = createWithOrder(buildOrder({}));

    component.visible.set(true);
    fixture.detectChanges();

    const emissions: Array<{ PaidAmount: number }> = [];
    const subscription = outputToObservable(component.paymentSubmit).subscribe((request) =>
      emissions.push(request)
    );
    component.submitPayment();

    expect(component.formError()).toBe('Payment type is not set for this order.');
    expect(emissions.length).toBe(0);
    subscription.unsubscribe();
  });
});
