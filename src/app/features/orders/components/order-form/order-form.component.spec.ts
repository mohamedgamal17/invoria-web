import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OrderFormComponent } from './order-form.component';
import type { OrderItem } from '../../models/order.entity';
import type { Customer } from '../../../customers/models/customer.entity';
import type { Product } from '../../../products/models/product.entity';
import { PaymentType } from '../../models/order-payment.enums';

describe('OrderFormComponent', () => {
  let fixture: ComponentFixture<OrderFormComponent>;
  let component: OrderFormComponent;

  const customer: Customer = {
    id: 'c1',
    name: 'Alice',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  const widget: Product = {
    id: 'prod_1',
    name: 'Widget',
    price: 10,
    stock: { actualQuantity: 0, reservedQuantity: 0 },
    createdAt: ''
  };

  const validItem: OrderItem = {
    id: 'line-1',
    productId: 'prod_1',
    quantity: 1,
    price: 10,
    product: widget
  };

  function selectCustomer(): void {
    component.orderForm.controls.customer.setValue(customer);
  }

  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      }
    );

    await TestBed.configureTestingModule({
      imports: [OrderFormComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('formSubmit on step 1 does not emit submit in create mode', () => {
    const submitSpy = vi.fn();
    component.submit.subscribe(submitSpy);

    component.formSubmit(new Event('submit'));

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('formSubmit on step 2 emits the validated payload in create mode', () => {
    const submitSpy = vi.fn();
    component.submit.subscribe(submitSpy);
    selectCustomer();
    fixture.componentRef.setInput('initialItems', [validItem]);
    fixture.detectChanges();
    component.orderForm.controls.paymentType.setValue(PaymentType.Debt);
    component.activeStep.set(2);

    component.formSubmit(new Event('submit'));

    expect(submitSpy).toHaveBeenCalledWith({
      customerId: 'c1',
      paymentType: PaymentType.Debt,
      items: [validItem]
    });
  });

  it('goToItemsNext emits submit in create mode when the lines are valid', () => {
    const submitSpy = vi.fn();
    component.submit.subscribe(submitSpy);
    selectCustomer();
    fixture.componentRef.setInput('initialItems', [validItem]);
    fixture.detectChanges();

    component.goToItemsNext(vi.fn());

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('propagates line item edits to the page through itemsChange', () => {
    fixture.componentRef.setInput('initialItems', [validItem]);
    fixture.detectChanges();
    const itemsChangeSpy = vi.fn();
    component.itemsChange.subscribe(itemsChangeSpy);

    component.orderForm.controls.items.at(0).controls.quantity.setValue(3);

    expect(itemsChangeSpy).toHaveBeenCalled();
    const emitted = itemsChangeSpy.mock.calls[0][0] as OrderItem[];
    expect(emitted[0].quantity).toBe(3);
  });

  it('seeds the customer control from the initial customer', () => {
    component.orderForm.controls.customer.setValue(null);
    fixture.componentRef.setInput('initialCustomer', customer);
    fixture.detectChanges();

    expect(component.orderForm.controls.customer.value).toEqual(customer);
  });

  describe('line items', () => {
    beforeEach(() => {
      component.orderForm.controls.product.setValue(widget);
    });

    it('addItem appends the selected product and resets the draft row', () => {
      component.onProductSelect(widget);
      component.orderForm.controls.quantity.setValue(2);

      component.addItem();

      expect(component.orderForm.controls.items.length).toBe(1);
      expect(component.orderForm.controls.items.at(0).getRawValue()).toEqual({
        id: '',
        productId: 'prod_1',
        product: widget,
        quantity: 2,
        price: 10
      });
      expect(component.orderForm.controls.product.value).toBeNull();
    });

    it('addItem merges quantity when the product is already in the draft', () => {
      component.onProductSelect(widget);
      component.orderForm.controls.quantity.setValue(2);
      component.addItem();

      component.orderForm.controls.product.setValue(widget);
      component.orderForm.controls.quantity.setValue(3);
      component.addItem();

      expect(component.orderForm.controls.items.length).toBe(1);
      expect(component.orderForm.controls.items.at(0).controls.quantity.value).toBe(5);
    });

    it('removeItem drops the row at the given index', () => {
      fixture.componentRef.setInput('initialItems', [
        validItem,
        { ...validItem, id: 'line-2', productId: 'prod_2' }
      ]);
      fixture.detectChanges();

      component.removeItem(0);

      expect(
        component.orderForm.controls.items.getRawValue().map((lineItem) => lineItem.productId)
      ).toEqual(['prod_2']);
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('mode', 'edit');
      selectCustomer();
      fixture.detectChanges();
    });

    it('formSubmit emits submit when items are valid without review step', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);
      fixture.componentRef.setInput('initialItems', [validItem]);
      fixture.detectChanges();

      component.formSubmit(new Event('submit'));

      expect(submitSpy).toHaveBeenCalled();
      expect(component.activeStep()).toBe(1);
    });

    it('formSubmit with no line items sets stepError and does not emit', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);
      fixture.componentRef.setInput('initialItems', []);
      fixture.detectChanges();

      component.formSubmit(new Event('submit'));

      expect(submitSpy).not.toHaveBeenCalled();
      expect(component.stepError()).toContain('product');
    });

    it('onEditTabChange switches tab and clears stepError', () => {
      component.stepError.set('Previous error');
      component.onEditTabChange(1);
      expect(component.activeTab()).toBe(1);
      expect(component.stepError()).toBeNull();
    });
  });
});