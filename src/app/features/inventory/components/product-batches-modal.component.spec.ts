import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { ProductBatchesModalComponent } from './product-batches-modal.component';
import { ProductBatchesPanelComponent } from './product-batches-panel.component';
import type { BatchesProductRef } from '../models/batches-product.ref';
import { BatchesApiService } from '../services/batches-api.service';

describe('ProductBatchesModalComponent', () => {
  let fixture: ComponentFixture<ProductBatchesModalComponent>;

  const mockProduct: BatchesProductRef = {
    id: 'prd_1',
    name: 'Product A',
    code: 'P-A'
  };

  const batchesApiMock = {
    listBatches: vi.fn(() =>
      of({
        isSuccess: true as const,
        result: { data: [], info: { length: 5, skip: 0, totalCount: 0 } }
      })
    )
  };

  const messageServiceMock = { add: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ProductBatchesModalComponent, NoopAnimationsModule],
      providers: [
        { provide: BatchesApiService, useValue: batchesApiMock },
        { provide: MessageService, useValue: messageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductBatchesModalComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should pass active to panel when visible and product are set', () => {
    fixture.componentRef.setInput('product', mockProduct);
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.directive(ProductBatchesPanelComponent));
    expect(panel).toBeTruthy();
    expect(panel.componentInstance.active()).toBe(true);
  });

  it('should set panel inactive when dialog is not visible', () => {
    fixture.componentRef.setInput('product', mockProduct);
    fixture.componentInstance.visible.set(false);
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.directive(ProductBatchesPanelComponent));
    expect(panel.componentInstance.active()).toBe(false);
  });
});
