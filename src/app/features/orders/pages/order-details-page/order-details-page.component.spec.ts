import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver;
}
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';

import { OrderDetailsPageComponent } from './order-details-page.component';
import { OrdersApiService } from '../../services/orders-api.service';
import { OrderActionFacade } from '../../services/order-action.facade';
import type { Order } from '../../models/order.entity';
import { OrderStatus } from '../../models/order.entity';
import { getAvailableOrderActions } from '../../models/order-actions';
import { canReturnOrderItems } from '../../models/order-return-items';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';

describe('OrderDetailsPageComponent', () => {
  let fixture: ComponentFixture<OrderDetailsPageComponent>;
  let component: OrderDetailsPageComponent;
  let getOrder: ReturnType<typeof vi.fn>;
  let mockFacade: { execute: ReturnType<typeof vi.fn>; meta: ReturnType<typeof vi.fn> };

  const baseOrder: Order = {
    id: 'ord_1',
    createdAt: '2026-04-01T12:00:00.000Z',
    createdBy: 'u',
    lastModifiedAt: '2026-04-01T12:00:00.000Z',
    lastModifiedBy: 'u',
    orderNumber: 'ORD-42',
    customerId: 'c1',
    customer: { id: 'c1', name: 'Alice', createdAt: '2026-01-01T00:00:00.000Z' },
    status: OrderStatus.Pending,
    paymentType: PaymentType.Immediate,
    paymentStatus: PaymentStatus.Paid,
    amountPaid: 10,
    amountOutstanding: 0,
    returnItems: [],
    totalOrderAmount: 10,
    netOfTotalOrderAmount: 10,
    returnsTotal: 0,
    payments: [],
    orderAllocated: true,
    items: [{ id: 'line-1', productId: 'p1', quantity: 1, price: 10 }]
  };

  async function setup(paramMap: Record<string, string>) {
    TestBed.resetTestingModule();
    getOrder = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: baseOrder
      })
    );
    mockFacade = {
      execute: vi.fn().mockReturnValue(
        of({
          isSuccess: true as const,
          result: { ...baseOrder, status: OrderStatus.Processing }
        })
      ),
      meta: vi.fn().mockReturnValue({
        label: 'Accept',
        icon: 'pi pi-check',
        severity: 'info' as const,
        routeSegment: 'accept'
      })
    };

    await TestBed.configureTestingModule({
      imports: [OrderDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: OrdersApiService, useValue: { getOrder } },
        { provide: OrderActionFacade, useValue: mockFacade },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap(paramMap)),
            snapshot: { paramMap: convertToParamMap(paramMap) }
          }
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn().mockResolvedValue(true) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await setup({ id: 'ord_1' });
  });

  it('loads order from route id', () => {
    expect(getOrder).toHaveBeenCalledWith('ord_1');
    expect(component.order()?.orderNumber).toBe('ORD-42');
    expect(component.loading()).toBe(false);
  });

  it('sets error when order id missing', async () => {
    await setup({});
    expect(component.error()).toContain('Missing order id.');
    expect(getOrder).not.toHaveBeenCalled();
  });

  it('changes tab via onTabChange', () => {
    component.onTabChange('lineItems');
    expect(component.activeTab()).toBe('lineItems');
  });

  it('selects History tab when onTabChange receives history', () => {
    component.onTabChange('history');
    expect(component.activeTab()).toBe('history');
  });

  it('availableActions includes requestRevision when Processing', async () => {
    getOrder.mockReturnValue(
      of({
        isSuccess: true as const,
        result: {
          ...baseOrder,
          status: OrderStatus.Processing
        }
      })
    );
    component.loadOrder();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.availableActions()).toContain('requestRevision');
    expect(component.availableActions()).toContain('complete');
    expect(component.availableActions()).toContain('cancel');
  });

  it('availableActions includes complete when Revision', async () => {
    getOrder.mockReturnValue(
      of({
        isSuccess: true as const,
        result: {
          ...baseOrder,
          status: OrderStatus.Revision
        }
      })
    );
    component.loadOrder();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.availableActions()).toContain('complete');
    expect(component.availableActions()).toContain('cancel');
    expect(component.availableActions()).not.toContain('accept');
  });

  it('does not allow recording returns when order is not Completed', async () => {
    getOrder.mockReturnValue(
      of({
        isSuccess: true as const,
        result: {
          ...baseOrder,
          status: OrderStatus.Processing
        }
      })
    );
    component.loadOrder();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(canReturnOrderItems(component.order()!)).toBe(false);
  });

  it('allows recording returns when order is Completed', async () => {
    getOrder.mockReturnValue(
      of({
        isSuccess: true as const,
        result: {
          ...baseOrder,
          status: OrderStatus.Completed
        }
      })
    );
    component.loadOrder();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(canReturnOrderItems(component.order()!)).toBe(true);
  });
});
