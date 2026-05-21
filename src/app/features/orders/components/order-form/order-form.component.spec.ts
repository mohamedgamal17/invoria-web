import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OrderFormComponent } from './order-form.component';
import type { UiOrderItem } from '../../models/order-ui.model';

describe('OrderFormComponent', () => {
  let fixture: ComponentFixture<OrderFormComponent>;
  let component: OrderFormComponent;

  const validItem: UiOrderItem = {
    id: 'line-1',
    productId: 'prod_1',
    productName: 'Widget',
    quantity: 1,
    price: 10
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

  it('formSubmit on step 3 emits submit in create mode', () => {
    const submitSpy = vi.fn();
    component.submit.subscribe(submitSpy);
    component.activeStep.set(3);

    component.formSubmit(new Event('submit'));

    expect(submitSpy).toHaveBeenCalled();
  });

  describe('edit mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('mode', 'edit');
      component.selectedCustomer.set({
        id: 'c1',
        name: 'Alice',
        createdAt: '2026-01-01T00:00:00.000Z'
      });
      fixture.detectChanges();
    });

    it('formSubmit emits submit when items are valid without review step', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);
      fixture.componentRef.setInput('draftItems', [validItem]);

      component.formSubmit(new Event('submit'));

      expect(submitSpy).toHaveBeenCalled();
      expect(component.activeStep()).toBe(1);
    });

    it('formSubmit with no line items sets stepError and does not emit', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);
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
  });
});
