import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BatchListComponent } from './batch-list.component';
import { Batch, BatchState } from '../models/batch.entity';

describe('BatchListComponent', () => {
  let component: BatchListComponent;
  let fixture: ComponentFixture<BatchListComponent>;

  const mockBatch: Batch = {
    id: 'bat_1',
    createdAt: new Date().toISOString(),
    productId: 'prd_1',
    quantity: 20,
    reservedQuantity: 5,
    state: BatchState.Active,
    purchasePrice: 15
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BatchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit edit event via output', () => {
    const editSpy = vi.spyOn(component.edit, 'emit');
    component.edit.emit(mockBatch);
    expect(editSpy).toHaveBeenCalledWith(mockBatch);
  });

  it('should emit page change via output', () => {
    const pageSpy = vi.spyOn(component.onPageChange, 'emit');
    const event = { first: 5, rows: 5 };
    component.onPageChange.emit(event);
    expect(pageSpy).toHaveBeenCalledWith(event);
  });

  it('should compute available quantity from quantity and reservedQuantity', () => {
    expect(component.getAvailableQuantity(mockBatch)).toBe(15);
    expect(component.getAvailableQuantity({ ...mockBatch, quantity: 2, reservedQuantity: 5 })).toBe(0);
  });

  it('should return correct severity for batch states', () => {
    expect(component.getSeverity(BatchState.Active)).toBe('success');
    expect(component.getSeverity(BatchState.Depleted)).toBe('secondary');
    expect(component.getSeverity(BatchState.Disabled)).toBe('danger');
  });
});
