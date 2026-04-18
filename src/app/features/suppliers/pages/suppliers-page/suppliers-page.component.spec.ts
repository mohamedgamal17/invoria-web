import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { MessageService } from 'primeng/api';

import { SuppliersPageComponent } from './suppliers-page.component';
import { SuppliersApiService } from '../../services/suppliers-api.service';
import type { Supplier } from '../../models/supplier.entity';

describe('SuppliersPageComponent', () => {
  let component: SuppliersPageComponent;
  let fixture: ComponentFixture<SuppliersPageComponent>;
  let mockSuppliersApi: { listSuppliers: ReturnType<typeof vi.fn> };

  const mockSupplier: Supplier = {
    id: 'sup_1',
    supplierCode: 'ACME',
    name: 'Acme Supplies',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  const listResponse = {
    isSuccess: true as const,
    result: {
      data: [mockSupplier],
      info: { length: 10, skip: 0, totalCount: 1 }
    }
  };

  function setupWithQueryParams(
    page: string,
    pageSize = '10',
    q = ''
  ): BehaviorSubject<ReturnType<typeof convertToParamMap>> {
    return new BehaviorSubject(convertToParamMap({ page, pageSize, q }));
  }

  async function createFixture(paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>) {
    TestBed.resetTestingModule();
    mockSuppliersApi = {
      listSuppliers: vi.fn().mockReturnValue(of(listResponse))
    };

    await TestBed.configureTestingModule({
      imports: [SuppliersPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        { provide: SuppliersApiService, useValue: mockSuppliersApi },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: paramMap$.asObservable(),
            parent: { snapshot: { url: [] } }
          }
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn().mockResolvedValue(true) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuppliersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createFixture(setupWithQueryParams('1'));
  });

  it('should create and load suppliers', () => {
    expect(component).toBeTruthy();
    expect(mockSuppliersApi.listSuppliers).toHaveBeenCalled();
  });

  it('should include q from route in list request', async () => {
    const paramMap$ = setupWithQueryParams('1', '10', 'acme');
    await createFixture(paramMap$);

    expect(mockSuppliersApi.listSuppliers).toHaveBeenLastCalledWith({
      Skip: 0,
      Length: 10,
      Name: 'acme'
    });
  });

  it('navigateToCreate should navigate to new', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);
    component.navigateToCreate();
    expect(router.navigate).toHaveBeenCalledWith(['new'], { relativeTo: route.parent });
  });

  it('goToDetails should navigate to supplier id', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);
    component.goToDetails(mockSupplier);
    expect(router.navigate).toHaveBeenCalledWith([mockSupplier.id], { relativeTo: route });
  });

  it('onNameFilterChange should sync q to route and reset page', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);

    component.onNameFilterChange('acme');

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { q: 'acme', page: 1 },
      queryParamsHandling: 'merge'
    });
  });
});
