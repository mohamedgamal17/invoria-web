import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { SupplierIdControlComponent } from './supplier-id-control.component';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';

@Component({
  standalone: true,
  template: `
    <form [formGroup]="form">
      <app-supplier-id-control formControlName="supplierId" [resolvedSupplier]="resolved" />
    </form>
  `,
  imports: [ReactiveFormsModule, SupplierIdControlComponent]
})
class SupplierPickerHostComponent {
  readonly form = new FormBuilder().nonNullable.group({
    supplierId: ['']
  });
  resolved: { id: string; name: string } | null = null;
}

describe('SupplierIdControlComponent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should sync form control value from writeValue (CVA)', () => {
    const searchSuppliers = vi.fn().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [SupplierIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: SuppliersApiService, useValue: { searchSuppliers } }]
    });
    const fixture = TestBed.createComponent(SupplierIdControlComponent);
    const cmp = fixture.componentInstance;
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.writeValue('sup_1');
    fixture.detectChanges();
    expect(cmp.selectedSupplier()?.id).toBe('sup_1');
    cmp.clearSelection();
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('should sync resolved supplier via input and propagate to form control', () => {
    const searchSuppliers = vi.fn().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [SupplierIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: SuppliersApiService, useValue: { searchSuppliers } }]
    });
    const fixture = TestBed.createComponent(SupplierIdControlComponent);
    const cmp = fixture.componentInstance;
    fixture.componentRef.setInput('resolvedSupplier', { id: 'sup_1', name: 'Acme' } as any);
    cmp.writeValue('sup_1');
    fixture.detectChanges();
    expect(cmp.selectedSupplier()?.name).toBe('Acme');
    cmp.clearSelection();
    // clearSelection should propagate empty value via CVA
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.writeValue('sup_1');
    cmp.clearSelection();
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('does not duplicate API call when completeMethod fires twice with empty query', () => {
    const acme = { id: 'sup_1', name: 'Acme Supplies' };
    const searchSuppliers = vi.fn().mockReturnValue(of([acme]));
    TestBed.configureTestingModule({
      imports: [SupplierIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: SuppliersApiService, useValue: { searchSuppliers } }]
    });
    const fixture = TestBed.createComponent(SupplierIdControlComponent);
    const cmp = fixture.componentInstance;

    cmp.onComplete({ query: '' });
    cmp.onComplete({ query: '' });
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(cmp.suggestions()).toEqual([acme]);
  });

  it('applies cached first-page results immediately on second open without API call', () => {
    const acme = { id: 'sup_1', name: 'Acme Supplies' };
    const searchSuppliers = vi.fn().mockReturnValue(of([acme]));
    TestBed.configureTestingModule({
      imports: [SupplierIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: SuppliersApiService, useValue: { searchSuppliers } }]
    });
    const fixture = TestBed.createComponent(SupplierIdControlComponent);
    const cmp = fixture.componentInstance;

    cmp.onComplete({ query: '' });
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(cmp.suggestions()).toEqual([acme]);

    cmp.onComplete({ query: '' });
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(cmp.suggestions()).toEqual([acme]);
  });

  it('reuses cached suppliers when the same query is searched again', () => {
    const acme = { id: 'sup_1', name: 'Acme Supplies' };
    const searchSuppliers = vi.fn().mockImplementation((_, query: string) =>
      of(query === 'ac' ? [acme] : [])
    );
    TestBed.configureTestingModule({
      imports: [SupplierIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: SuppliersApiService, useValue: { searchSuppliers } }]
    });
    const fixture = TestBed.createComponent(SupplierIdControlComponent);
    const cmp = fixture.componentInstance;

    cmp.onComplete({ query: 'ac' });
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(cmp.suggestions()).toEqual([acme]);

    cmp.onComplete({ query: 'xy' });
    expect(searchSuppliers).toHaveBeenCalledTimes(2);

    cmp.onComplete({ query: '  ac  ' });
    expect(searchSuppliers).toHaveBeenCalledTimes(2);
    expect(cmp.suggestions()).toEqual([acme]);
  });
});
