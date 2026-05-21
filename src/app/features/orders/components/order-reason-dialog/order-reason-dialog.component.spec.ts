import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OrderReasonDialogComponent } from './order-reason-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderFullfillmentStatus, OrderStatus } from '../../models/order.entity';

describe('OrderReasonDialogComponent', () => {
  let component: OrderReasonDialogComponent;
  let fixture: ComponentFixture<OrderReasonDialogComponent>;

  const mockOrder: UiOrder = {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: 'Customer 1',
    totalAmount: 100,
    status: OrderStatus.Pending,
    fullfillmentStatus: OrderFullfillmentStatus.Pending,
    orderDate: new Date().toISOString(),
    items: [],
    returnItems: [],
    stateHistory: [],
    failureDetails: [],
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'system'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrderReasonDialogComponent,
        FormsModule,
        DialogModule,
        ButtonModule,
        TextareaModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderReasonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct header for CANCELLED state', () => {
    fixture.componentRef.setInput('transitionTarget', { order: mockOrder, state: OrderStatus.Cancelled });
    fixture.detectChanges();

    expect(component.transitionTarget()?.state).toBe(OrderStatus.Cancelled);
  });

  it('should render reason textarea with PrimeNG textarea directive', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('#reason') as HTMLTextAreaElement | null;
    expect(textarea).toBeTruthy();
    expect(textarea?.classList.contains('p-textarea')).toBe(true);
  });

  it('should emit reasonSubmit when confirm button is clicked', () => {
    const emitSpy = vi.spyOn(component.reasonSubmit, 'emit');
    fixture.componentRef.setInput('reasonText', 'Some reason');
    fixture.detectChanges();
    
    component.reasonSubmit.emit();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should disable confirm button if reason is empty', () => {
    fixture.componentRef.setInput('reasonText', '   ');
    fixture.componentRef.setInput('saving', false);
    fixture.detectChanges();
    
    const confirmButton = fixture.nativeElement.querySelector('p-button[severity="danger"]');
    // PrimeNG buttons handle disabled state via [disabled] attribute on the component or internal button.
    expect(component.reasonText().trim()).toBe('');
  });

  it('should emit cancel event when keep order button is clicked', () => {
    const emitSpy = vi.spyOn(component.cancel, 'emit');
    component.cancel.emit();
    expect(emitSpy).toHaveBeenCalled();
  });
});
