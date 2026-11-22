import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProductBatchesPanelComponent } from './product-batches-panel.component';
import { Batch, BatchState } from '../models/batch.entity';

describe('ProductBatchesPanelComponent', () => {
  let component: ProductBatchesPanelComponent;
  let fixture: ComponentFixture<ProductBatchesPanelComponent>;

  const mockBatch: Batch = {
    id: 'bat_1',
    createdAt: new Date().toISOString(),
    productId: 'prd_1',
    quantity: 12,
    reservedQuantity: 2,
    state: BatchState.Active,
    purchasePrice: 13
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBatchesPanelComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductBatchesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the batches page passed in from the host store', () => {
    fixture.componentRef.setInput('batches', [mockBatch]);
    fixture.componentRef.setInput('totalRecords', 1);
    fixture.detectChanges();

    expect(component.batches().length).toBe(1);
    expect(component.totalRecords()).toBe(1);
  });

  it('should toggle between add and edit form states', () => {
    component.openAddForm();
    expect(component.showForm()).toBe(true);
    expect(component.selectedBatch()).toBeNull();

    component.openEditForm(mockBatch);
    expect(component.showForm()).toBe(true);
    expect(component.selectedBatch()).toEqual(mockBatch);

    component.closeForm();
    expect(component.showForm()).toBe(false);
    expect(component.selectedBatch()).toBeNull();
  });

  it('should emit a create save event when no batch is selected', () => {
    const saveSpy = vi.fn();
    component.showForm.set(true);
    component.save.subscribe(saveSpy);

    component.selectedBatch.set(null);
    component.emitSave({ quantity: 5, purchasePrice: 20 });

    expect(saveSpy).toHaveBeenCalledWith({ batch: null, payload: { quantity: 5, purchasePrice: 20 } });
  });

  it('should emit an update save event with the selected batch', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    component.showForm.set(true);
    component.selectedBatch.set(mockBatch);
    component.emitSave({ quantity: 9, purchasePrice: 11 });

    expect(saveSpy).toHaveBeenCalledWith({ batch: mockBatch, payload: { quantity: 9, purchasePrice: 11 } });
  });

  it('should close the dialog after a loaded save round (triggered by the store)', () => {
    component.showForm.set(true);
    component.selectedBatch.set(mockBatch);
    fixture.componentRef.setInput('saveStatus', 'loaded');
    fixture.detectChanges();

    expect(component.showForm()).toBe(false);
    expect(component.selectedBatch()).toBeNull();
  });

  it('should keep the dialog open on an error save round', () => {
    component.showForm.set(true);
    component.selectedBatch.set(mockBatch);
    fixture.componentRef.setInput('saveStatus', 'error');
    fixture.detectChanges();

    expect(component.showForm()).toBe(true);
    expect(component.selectedBatch()).toEqual(mockBatch);
  });

  it('should bubble page change events to the host', () => {
    const pageSpy = vi.fn();
    component.pageChange.subscribe(pageSpy);

    component.emitPageChange({ first: 25, rows: 50 });

    expect(pageSpy).toHaveBeenCalledWith({ first: 25, rows: 50 });
  });
});
