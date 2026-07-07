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
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';

describe('OrdersPageComponent', () => {
  let component: OrdersPageComponent;
  let fixture: ComponentFixture<OrdersPageComponent>;
  let mockOrdersApi: {
    listOrders: ReturnType<typeof vi.fn>;
    createOrder: ReturnType<typeof vi.fn>;
    getOrder: ReturnType<typeof vi.fn>;
    updateOrderItems: ReturnType<typeof vi.fn>;
    acceptOrder: ReturnType<typeof vi.fn>;
    requestRevisionOrder: ReturnType<typeof vi.fn>;
    completeOrder: ReturnType<typeof vi.fn>;
    cancelOrder: ReturnType<typeof vi.fn>;
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
    paymentType: PaymentType.Immediate,
    paymentStatus: PaymentStatus.Paid,
    amountPaid: 21,
    amountOutstanding: 0,
    returnItems: [],
    totalOrderAmount: 21,
    netOfTotalOrderAmount: 21,
    returnsTotal: 0,
    payments: [],
    orderAllocated: true,
    items: [{ id: 'line-1', productId: 'prd_1', quantity: 2, price: 10.5 }]
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
      requestRevisionOrder: vi.fn(),
      completeOrder: vi.fn(),
      cancelOrder: vi.fn()
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

  it('passes Status and payment filters to listOrders when query params are set', async () => {
    const paramMap$ = new BehaviorSubject(
      convertToParamMap({
        page: '1',
        pageSize: '25',
        status: String(OrderStatus.Processing),
        paymentStatus: String(PaymentStatus.Paid),
        paymentType: String(PaymentType.Immediate)
      })
    );
    await createFixture(paramMap$);
    expect(mockOrdersApi.listOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        Status: OrderStatus.Processing,
        PaymentStatus: PaymentStatus.Paid,
        PaymentType: PaymentType.Immediate
      })
    );
  });
});
