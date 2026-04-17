import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

  it('should render batch rows when batches input is provided', () => {
    fixture.componentRef.setInput('batches', [mockBatch]);
    fixture.detectChanges();

    const tableBody = fixture.nativeElement.querySelector('.p-datatable-tbody');
    expect(tableBody?.textContent).toContain('15');
    expect(tableBody?.textContent).toContain('5');
    expect(tableBody?.textContent).toContain('Active');
  });

  it('should emit edit event when edit button is clicked', () => {
    fixture.componentRef.setInput('batches', [mockBatch]);
    fixture.detectChanges();

    const editSpy = vi.spyOn(component.edit, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('p-button'));
    const desktopEditButton = buttons[0];

    desktopEditButton.triggerEventHandler('onClick', {});
    expect(editSpy).toHaveBeenCalledWith(mockBatch);
  });

  it('should emit page change on table lazy load', () => {
    const pageSpy = vi.spyOn(component.onPageChange, 'emit');
    const table = fixture.debugElement.query(By.css('p-table'));
    const event = { first: 5, rows: 5 };

    table.triggerEventHandler('onPage', event);
    expect(pageSpy).toHaveBeenCalledWith(event);
  });

  it('should show skeleton during loading and empty state when not loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('p-skeleton').length).toBeGreaterThan(0);

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('batches', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No batches tracked for this product yet.');
  });

  it('should compute available quantity from quantity and reservedQuantity', () => {
    expect(component.getAvailableQuantity(mockBatch)).toBe(15);
    expect(component.getAvailableQuantity({ ...mockBatch, quantity: 2, reservedQuantity: 5 })).toBe(0);
  });
});
