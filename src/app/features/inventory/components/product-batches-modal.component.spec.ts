import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, expect, it, beforeEach } from 'vitest';
import { ProductBatchesModalComponent } from './product-batches-modal.component';
import type { BatchesProductRef } from '../models/batches-product.ref';

describe('ProductBatchesModalComponent', () => {
  let fixture: ComponentFixture<ProductBatchesModalComponent>;

  const mockProduct: BatchesProductRef = {
    id: 'prd_1',
    name: 'Product A'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBatchesModalComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductBatchesModalComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should compute panelActive as true when visible and product are set', () => {
    fixture.componentRef.setInput('product', mockProduct);
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    expect(fixture.componentInstance.panelActive()).toBe(true);
  });

  it('should set panel inactive when dialog is not visible', () => {
    fixture.componentRef.setInput('product', mockProduct);
    fixture.componentInstance.visible.set(false);
    fixture.detectChanges();

    expect(fixture.componentInstance.panelActive()).toBe(false);
  });

  it('should be inactive when product is not set even if visible', () => {
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.panelActive()).toBe(false);
  });
});
