import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { ProductBatchesPanelComponent } from './product-batches-panel.component';
import { BatchesApiService } from '../services/batches-api.service';
import { Batch, BatchState } from '../models/batch.entity';
import type { BatchesProductRef } from '../models/batches-product.ref';

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

  const mockProduct: BatchesProductRef = {
    id: 'prd_1',
    name: 'Product A'
  };

  const listSuccessBody = {
    isSuccess: true as const,
    result: {
      data: [mockBatch],
      info: { length: 5, skip: 0, totalCount: 1 }
    }
  };

  const batchesApiMock = {
    listBatches: vi.fn(() => of(listSuccessBody)),
    createBatch: vi.fn(() => of({ isSuccess: true as const, result: mockBatch })),
    updateBatch: vi.fn(() => of({ isSuccess: true as const, result: mockBatch }))
  };

  const messageServiceMock = {
    add: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ProductBatchesPanelComponent, NoopAnimationsModule],
      providers: [
        { provide: BatchesApiService, useValue: batchesApiMock },
        { provide: MessageService, useValue: messageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductBatchesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load batches when active and product are set', () => {
    fixture.componentRef.setInput('product', mockProduct);
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    expect(batchesApiMock.listBatches).toHaveBeenCalledWith({
      ProductId: mockProduct.id,
      Skip: 0,
      Length: 25
    });
    expect(component.batches().length).toBe(1);
    expect(component.totalRecords()).toBe(1);
  });

  it('should open add and edit form states', () => {
    component.openAddForm();
    expect(component.showForm()).toBe(true);
    expect(component.selectedBatch()).toBeNull();

    component.openEditForm(mockBatch);
    expect(component.showForm()).toBe(true);
    expect(component.selectedBatch()).toEqual(mockBatch);
  });

  it('should call create service path when saving without selected batch', () => {
    fixture.componentRef.setInput('product', mockProduct);
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    const loadSpy = vi.spyOn(component, 'loadBatches');
    component.showForm.set(true);
    component.onSave({ quantity: 5, purchasePrice: 20 });

    expect(batchesApiMock.createBatch).toHaveBeenCalledWith({
      ProductId: mockProduct.id,
      Quantity: 5,
      PurchasePrice: 20
    });
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' })
    );
    expect(component.showForm()).toBe(false);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should call update service path when saving with selected batch', () => {
    fixture.componentRef.setInput('product', mockProduct);
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    const loadSpy = vi.spyOn(component, 'loadBatches');
    component.selectedBatch.set(mockBatch);
    component.showForm.set(true);
    component.onSave({ quantity: 9, purchasePrice: 11 });

    expect(batchesApiMock.updateBatch).toHaveBeenCalledWith(mockBatch.id, {
      Quantity: 9,
      PurchasePrice: 11
    });
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' })
    );
    expect(component.showForm()).toBe(false);
    expect(component.selectedBatch()).toBeNull();
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should keep batch form modal open and show error message on save failure', () => {
    batchesApiMock.updateBatch.mockReturnValueOnce(throwError(() => new Error('failed')));
    fixture.componentRef.setInput('product', mockProduct);
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    component.selectedBatch.set(mockBatch);
    component.showForm.set(true);
    component.onSave({ quantity: 2, purchasePrice: 10 });

    expect(messageServiceMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' })
    );
    expect(component.showForm()).toBe(true);
    expect(component.formLoading()).toBe(false);
  });
});
