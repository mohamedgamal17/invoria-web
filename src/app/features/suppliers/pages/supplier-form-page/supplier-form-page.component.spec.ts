import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { MessageService } from 'primeng/api';

import { SupplierFormPageComponent } from './supplier-form-page.component';
import { SuppliersApiService } from '../../services/suppliers-api.service';

describe('SupplierFormPageComponent (create)', () => {
  let fixture: ComponentFixture<SupplierFormPageComponent>;
  let component: SupplierFormPageComponent;
  let createSupplier: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    createSupplier = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: {
          id: 'new_id',
          supplierCode: 'X',
          name: 'Y',
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      })
    );

    await TestBed.configureTestingModule({
      imports: [SupplierFormPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { mode: 'create' },
              paramMap: { get: () => null }
            }
          }
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        {
          provide: SuppliersApiService,
          useValue: {
            createSupplier,
            getSupplier: vi.fn(),
            updateSupplier: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.mode()).toBe('create');
  });

  it('submit should call createSupplier when valid', () => {
    component.form.patchValue({
      supplierCode: 'CODE1',
      name: 'Valid Name',
      contactEmail: '',
      phone: ''
    });
    component.submit();
    expect(createSupplier).toHaveBeenCalled();
  });
});
