import { describe, it, expect, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PurchaseOrderFormComponent } from './purchase-order-form.component';
import type { UiPurchaseOrderItem } from '@invoria/procurement/purchase-orders/models/purchase-order-ui.model';
import type { Product } from '@invoria/catalog';

describe('PurchaseOrderFormComponent', () => {
  let fixture: ComponentFixture<PurchaseOrderFormComponent>;
  let component: PurchaseOrderFormComponent;

  const validItem: UiPurchaseOrderItem = {
    productId: 'prod_1',
    productName: 'Widget',
    quantity: 1,
    unitPrice: 10
  };

  const widget: Product = {
    id: 'prod_1',
    name: 'Widget',
    price: 10,
    stock: { actualQuantity: 0, reservedQuantity: 0 },
    createdAt: ''
  };

  function selectSupplier(): void {
    component.purchaseOrderForm.controls.supplier.setValue({ id: 'sup_1', name: 'Acme' });
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
      imports: [PurchaseOrderFormComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('goToDetailsNext without supplier sets stepError and keeps activeStep at 1', () => {
    const activateCallback = vi.fn();

    component.goToDetailsNext(activateCallback);

    expect(component.stepError()).toContain('supplier');
    expect(component.activeStep()).toBe(1);
    expect(activateCallback).not.toHaveBeenCalled();
  });

  it('goToDetailsNext with supplier sets activeStep to 2', () => {
    selectSupplier();
    const activateCallback = vi.fn();

    component.goToDetailsNext(activateCallback);

    expect(component.stepError()).toBeNull();
    expect(component.activeStep()).toBe(2);
    expect(activateCallback).toHaveBeenCalledWith(2);
  });

  it('goToItemsNext without items sets error and keeps activeStep', () => {
    component.activeStep.set(2);
    const activateCallback = vi.fn();

    component.goToItemsNext(activateCallback);

    expect(component.stepError()).toContain('line item');
    expect(component.activeStep()).toBe(2);
    expect(activateCallback).not.toHaveBeenCalled();
  });

  it('goToItemsNext with valid items sets activeStep to 3', () => {
    fixture.componentRef.setInput('initialItems', [validItem]);
    fixture.detectChanges();
    component.activeStep.set(2);
    const activateCallback = vi.fn();

    component.goToItemsNext(activateCallback);

    expect(component.stepError()).toBeNull();
    expect(component.activeStep()).toBe(3);
    expect(activateCallback).toHaveBeenCalledWith(3);
  });

  it('formSubmit on step 1 does not emit submit', () => {
    const submitSpy = vi.fn();
    component.submit.subscribe(submitSpy);

    component.formSubmit(new Event('submit'));

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('formSubmit on step 3 emits the validated payload', () => {
    const submitSpy = vi.fn();
    component.submit.subscribe(submitSpy);
    selectSupplier();
    fixture.componentRef.setInput('initialItems', [validItem]);
    fixture.detectChanges();
    component.activeStep.set(3);

    component.formSubmit(new Event('submit'));

    expect(submitSpy).toHaveBeenCalledWith({ supplierId: 'sup_1', items: [validItem] });
  });

  it('onStepperValueChange to step 3 from step 1 without items does not advance', () => {
    component.onStepperValueChange(3);

    expect(component.activeStep()).toBe(1);
    expect(component.stepError()).toContain('supplier');
  });

  it('onStepperValueChange to step 2 with valid details advances', () => {
    selectSupplier();

    component.onStepperValueChange(2);

    expect(component.activeStep()).toBe(2);
    expect(component.stepError()).toBeNull();
  });

  it('stepBack sets activeStep and calls activateCallback', () => {
    component.activeStep.set(3);
    const activateCallback = vi.fn();

    component.stepBack(activateCallback, 2);

    expect(component.activeStep()).toBe(2);
    expect(activateCallback).toHaveBeenCalledWith(2);
  });

  describe('line items', () => {
    beforeEach(() => {
      component.purchaseOrderForm.controls.product.setValue(widget);
    });

    it('addItem appends the selected product with the entered quantity and price', () => {
      component.purchaseOrderForm.controls.quantity.setValue(2);
      component.purchaseOrderForm.controls.unitPrice.setValue(10);

      component.addItem();

      expect(component.draftItems()).toEqual([
        { productId: 'prod_1', productName: 'Widget', quantity: 2, unitPrice: 10 }
      ]);
      expect(component.purchaseOrderForm.controls.product.value).toBeNull();
    });

    it('addItem merges quantity when the product is already in the draft', () => {
      component.purchaseOrderForm.controls.quantity.setValue(2);
      component.purchaseOrderForm.controls.unitPrice.setValue(10);
      component.addItem();

      component.purchaseOrderForm.controls.product.setValue(widget);
      component.purchaseOrderForm.controls.quantity.setValue(3);
      component.purchaseOrderForm.controls.unitPrice.setValue(10);
      component.addItem();

      expect(component.draftItems()).toHaveLength(1);
      expect(component.draftItems()[0].quantity).toBe(5);
    });

    it('addItem rejects a zero unit price without mutating the draft', () => {
      component.purchaseOrderForm.controls.unitPrice.setValue(0);

      component.addItem();

      expect(component.draftItems()).toEqual([]);
      expect(component.stepError()).toContain('Unit price');
    });

    it('subTotal and totalItemsCount derive from the current line items', () => {
      fixture.componentRef.setInput('initialItems', [
        validItem,
        { productId: 'prod_2', productName: 'Gadget', quantity: 2, unitPrice: 5 }
      ]);
      fixture.detectChanges();

      expect(component.subTotal()).toBe(20);
      expect(component.totalItemsCount()).toBe(3);
    });

    it('removeItem drops the row at the given index', () => {
      fixture.componentRef.setInput('initialItems', [
        validItem,
        { productId: 'prod_2', productName: 'Gadget', quantity: 2, unitPrice: 5 }
      ]);
      fixture.detectChanges();

      component.removeItem(0);

      expect(component.draftItems().map((lineItem) => lineItem.productId)).toEqual(['prod_2']);
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('mode', 'edit');
      fixture.detectChanges();
    });

    it('formSubmit emits submit when details and items are valid without review step', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);
      selectSupplier();
      fixture.componentRef.setInput('initialItems', [validItem]);
      fixture.detectChanges();

      component.formSubmit(new Event('submit'));

      expect(submitSpy).toHaveBeenCalledWith({ supplierId: 'sup_1', items: [validItem] });
      expect(component.activeStep()).toBe(1);
    });

    it('formSubmit with no line items sets stepError and does not emit', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);
      selectSupplier();
      fixture.componentRef.setInput('initialItems', []);
      fixture.detectChanges();

      component.formSubmit(new Event('submit'));

      expect(submitSpy).not.toHaveBeenCalled();
      expect(component.stepError()).toContain('line item');
    });

    it('seeds the supplier control from the resolved supplier', () => {
      component.purchaseOrderForm.controls.supplier.setValue(null);
      fixture.componentRef.setInput('resolvedSupplier', { id: 'sup_9', name: 'Resolved Co' });
      fixture.detectChanges();

      expect(component.purchaseOrderForm.controls.supplier.value).toEqual({
        id: 'sup_9',
        name: 'Resolved Co'
      });
    });

    it('onEditTabChange switches tab and clears stepError', () => {
      component.stepError.set('Previous error');
      component.onEditTabChange(1);
      expect(component.activeTab()).toBe(1);
      expect(component.stepError()).toBeNull();
    });
  });
});
