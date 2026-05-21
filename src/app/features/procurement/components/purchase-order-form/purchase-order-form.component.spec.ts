import { describe, it, expect, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PurchaseOrderFormComponent } from './purchase-order-form.component';
import type { UiPurchaseOrderItem } from '../../models/purchase-order-ui.model';

describe('PurchaseOrderFormComponent', () => {
  let fixture: ComponentFixture<PurchaseOrderFormComponent>;
  let component: PurchaseOrderFormComponent;

  const validItem: UiPurchaseOrderItem = {
    productId: 'prod_1',
    productName: 'Widget',
    quantity: 1,
    unitPrice: 10,
    supplierProductCode: null
  };

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
    component.supplierId.set('sup_1');
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
    fixture.componentRef.setInput('draftItems', [validItem]);
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

  it('formSubmit on step 3 emits submit', () => {
    const submitSpy = vi.fn();
    component.submit.subscribe(submitSpy);
    component.activeStep.set(3);

    component.formSubmit(new Event('submit'));

    expect(submitSpy).toHaveBeenCalled();
  });

  it('onStepperValueChange to step 3 from step 1 without items does not advance', () => {
    component.onStepperValueChange(3);

    expect(component.activeStep()).toBe(1);
    expect(component.stepError()).toContain('supplier');
  });

  it('onStepperValueChange to step 2 with valid details advances', () => {
    component.supplierId.set('sup_1');

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

  describe('edit mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('mode', 'edit');
      fixture.detectChanges();
    });

    it('formSubmit emits submit when details and items are valid without review step', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);
      component.supplierId.set('sup_1');
      fixture.componentRef.setInput('draftItems', [validItem]);

      component.formSubmit(new Event('submit'));

      expect(submitSpy).toHaveBeenCalled();
      expect(component.activeStep()).toBe(1);
    });

    it('formSubmit with no line items sets stepError and does not emit', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);
      component.supplierId.set('sup_1');
      fixture.componentRef.setInput('draftItems', []);

      component.formSubmit(new Event('submit'));

      expect(submitSpy).not.toHaveBeenCalled();
      expect(component.stepError()).toContain('line item');
    });

    it('onEditTabChange switches tab and clears stepError', () => {
      component.stepError.set('Previous error');
      component.onEditTabChange(1);
      expect(component.activeTab()).toBe(1);
      expect(component.stepError()).toBeNull();
    });

    it('shows audit block in edit mode when audit inputs are set', () => {
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('createdAt', '2026-01-01T00:00:00.000Z');
      fixture.componentRef.setInput('createdBy', 'user_creator');
      fixture.componentRef.setInput('lastModifiedAt', '2026-01-02T00:00:00.000Z');
      fixture.componentRef.setInput('lastModifiedBy', 'user_editor');
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain('Audit');
      expect(text).toContain('user_creator');
      expect(text).toContain('user_editor');
    });
  });
});
