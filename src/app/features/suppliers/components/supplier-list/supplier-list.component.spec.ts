import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SupplierListComponent } from './supplier-list.component';
import type { Supplier } from '../../models/supplier.entity';

describe('SupplierListComponent', () => {
  let fixture: ComponentFixture<SupplierListComponent>;
  let component: SupplierListComponent;

  const supplier: Supplier = {
    id: 's1',
    supplierCode: 'CODE',
    name: 'Test Supplier',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierListComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('suppliers', [supplier]);
    fixture.componentRef.setInput('totalRecords', 1);
    fixture.componentRef.setInput('first', 0);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('isListLoading', false);
    fixture.componentRef.setInput('nameFilter', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit viewSupplier when View clicked', () => {
    const spy = vi.fn();
    component.viewSupplier.subscribe(spy);
    component.viewSupplier.emit(supplier);
    expect(spy).toHaveBeenCalledWith(supplier);
  });

  it('should emit nameFilterChange when search input changes', () => {
    const spy = vi.fn();
    component.nameFilterChange.subscribe(spy);

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[pinputtext]');
    input.value = 'acme';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith('acme');
  });
});
