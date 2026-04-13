import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';

import { OrdersPageComponent } from './orders-page.component';
import { OrdersApiService } from '../../services/orders-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import type { Order } from '../../models/order.entity';
import { OrderFullfillmentStatus, OrderStatus } from '../../models/order.entity';

describe('OrdersPageComponent', () => {
  let component: OrdersPageComponent;
  let fixture: ComponentFixture<OrdersPageComponent>;
  let mockOrdersApi: {
    listOrders: ReturnType<typeof vi.fn>;
    createOrder: ReturnType<typeof vi.fn>;
    getOrder: ReturnType<typeof vi.fn>;
    updateOrderItems: ReturnType<typeof vi.fn>;
    acceptOrder: ReturnType<typeof vi.fn>;
    cancelOrder: ReturnType<typeof vi.fn>;
    completeOrder: ReturnType<typeof vi.fn>;
    refuseOrder: ReturnType<typeof vi.fn>;
    reopenOrder: ReturnType<typeof vi.fn>;
  };

  const emptyListResponse = {
    isSuccess: true as const,
    result: {
      data: [] as Order[],
      info: { length: 10, skip: 0, totalCount: 0 }
    }
  };

  const mockCreatedOrder: Order = {
    id: 'ord_new_1',
    createdAt: '2026-04-01T12:00:00.000Z',
    createdBy: 'tester',
    lastModifiedAt: '2026-04-01T12:00:00.000Z',
    lastModifiedBy: 'tester',
    orderNumber: 'ORD-10001',
    customerId: 'cust_1',
    customer: { id: 'cust_1', name: 'Alice', createdAt: '2026-01-01T00:00:00.000Z' },
    status: OrderStatus.Pending,
    fullfillmentStatus: OrderFullfillmentStatus.Pending,
    items: [{ productId: 'prd_1', quantity: 2, price: 10.5 }]
  };

  function setupWithQueryParams(page: string, pageSize = '10'): BehaviorSubject<ReturnType<typeof convertToParamMap>> {
    return new BehaviorSubject(convertToParamMap({ page, pageSize }));
  }

  async function createFixture(paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>) {
    TestBed.resetTestingModule();
    mockOrdersApi = {
      listOrders: vi.fn().mockReturnValue(of(emptyListResponse)),
      createOrder: vi.fn().mockReturnValue(
        of({
          isSuccess: true as const,
          result: mockCreatedOrder
        })
      ),
      getOrder: vi.fn(),
      updateOrderItems: vi.fn(),
      acceptOrder: vi.fn(),
      cancelOrder: vi.fn(),
      completeOrder: vi.fn(),
      refuseOrder: vi.fn(),
      reopenOrder: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [OrdersPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: OrdersApiService, useValue: mockOrdersApi },
        {
          provide: ProductsApiService,
          useValue: { searchProducts: vi.fn().mockReturnValue(of([])) }
        },
        {
          provide: CustomersApiService,
          useValue: { searchCustomers: vi.fn().mockReturnValue(of([])) }
        },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: paramMap$.asObservable() }
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn().mockResolvedValue(true)
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    const paramMap$ = setupWithQueryParams('1');
    await createFixture(paramMap$);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(mockOrdersApi.listOrders).toHaveBeenCalled();
  });

  it('should call createOrder with CreateOrderRequest when submitting create modal on first page', async () => {
    const reloadSpy = vi.spyOn((component as unknown as { ordersResource: { reload: () => boolean } }).ordersResource, 'reload');

    component.modalMode.set('create');
    component.selectedCustomer.set({
      id: 'cust_1',
      name: 'Alice',
      createdAt: '2026-01-01T00:00:00.000Z'
    });
    component.draftItems.set([
      { productId: 'prd_1', productName: 'Widget', quantity: 2, price: 10.5 }
    ]);

    component.submitModal();

    expect(mockOrdersApi.createOrder).toHaveBeenCalledTimes(1);
    expect(mockOrdersApi.createOrder).toHaveBeenCalledWith({
      CustomerId: 'cust_1',
      Items: [{ ProductId: 'prd_1', Quantity: 2, Price: 10.5 }]
    });

    await Promise.resolve();
    await fixture.whenStable();

    expect(reloadSpy).not.toHaveBeenCalled();
    expect(component.displayOrders()[0]?.id).toBe('ord_new_1');
    expect(component.displayPaging().totalCount).toBe(1);
    const router = TestBed.inject(Router);
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should not prepend created order into display when create succeeds from a later page', async () => {
    const paramMap$ = setupWithQueryParams('2');
    await createFixture(paramMap$);

    const reloadSpy = vi.spyOn((component as unknown as { ordersResource: { reload: () => boolean } }).ordersResource, 'reload');

    component.modalMode.set('create');
    component.selectedCustomer.set({
      id: 'cust_1',
      name: 'Alice',
      createdAt: '2026-01-01T00:00:00.000Z'
    });
    component.draftItems.set([
      { productId: 'prd_1', productName: 'Widget', quantity: 1, price: 5 }
    ]);

    component.submitModal();

    expect(mockOrdersApi.createOrder).toHaveBeenCalled();

    await Promise.resolve();
    await fixture.whenStable();

    expect(reloadSpy).not.toHaveBeenCalled();
    expect(component.displayOrders().some((o) => o.id === 'ord_new_1')).toBe(false);
  });
});
