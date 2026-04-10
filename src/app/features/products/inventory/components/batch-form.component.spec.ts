import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BatchFormComponent } from './batch-form.component';
import { Batch, BatchState } from '../models/batch.entity';

describe('BatchFormComponent', () => {
  let component: BatchFormComponent;
  let fixture: ComponentFixture<BatchFormComponent>;

  const mockBatch: Batch = {
    id: 'bat_1',
    createdAt: new Date().toISOString(),
    productId: 'prd_1',
    quantity: 10,
    reservedQuantity: 3,
    state: BatchState.Active,
    purchasePrice: 20
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BatchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit form payload in create mode on submit', () => {
    const saveSpy = vi.spyOn(component.save, 'emit');
    component.batchForm.patchValue({ quantity: 8, purchasePrice: 14.5 });

    component.submit();

    expect(saveSpy).toHaveBeenCalledWith({
      quantity: 8,
      purchasePrice: 14.5
    });
  });

  it('should prefill values and emit form payload with purchasePrice in edit mode', () => {
    const saveSpy = vi.spyOn(component.save, 'emit');

    fixture.componentRef.setInput('batch', mockBatch);
    fixture.detectChanges();
    expect(component.batchForm.value.quantity).toBe(10);
    expect(component.batchForm.value.purchasePrice).toBe(20);
    expect(component.batchForm.get('purchasePrice')?.enabled).toBe(true);

    component.batchForm.patchValue({ quantity: 11, purchasePrice: 21.5 });
    component.submit();

    expect(saveSpy).toHaveBeenCalledWith({
      quantity: 11,
      purchasePrice: 21.5
    });
  });

  it('should enforce min quantity as 1 in create mode and 0 in edit mode', () => {
    component.batchForm.patchValue({ quantity: 0 });
    component.batchForm.get('quantity')?.markAsTouched();
    fixture.detectChanges();
    expect(component.batchForm.get('quantity')?.invalid).toBe(true);

    fixture.componentRef.setInput('batch', mockBatch);
    fixture.detectChanges();
    component.batchForm.patchValue({ quantity: 0 });
    component.batchForm.get('quantity')?.markAsTouched();
    fixture.detectChanges();
    expect(component.batchForm.get('quantity')?.valid).toBe(true);
  });

  it('should emit cancel when cancel button is clicked', () => {
    const cancelSpy = vi.spyOn(component.cancel, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('p-button'));
    const cancelButton = buttons.find(btn => btn.nativeElement.textContent?.includes('Cancel'));

    cancelButton?.triggerEventHandler('onClick', {});
    expect(cancelSpy).toHaveBeenCalled();
  });
});
