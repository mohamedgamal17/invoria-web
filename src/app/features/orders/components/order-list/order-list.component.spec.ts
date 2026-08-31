import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OrderListComponent } from './order-list.component';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderStatus } from '../../models/order.entity';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;

  const mockOrders: UiOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'Customer 1',
      totalAmount: 100,
      netOfTotalOrderAmount: 100,
      returnsTotal: 0,
      status: OrderStatus.Pending,
      orderDate: new Date().toISOString(),
      items: [],
      returnItems: [],
      orderAllocated: false,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: 'system'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Customer 2',
      totalAmount: 200,
      netOfTotalOrderAmount: 200,
      returnsTotal: 0,
      status: OrderStatus.Processing,
      orderDate: new Date().toISOString(),
      items: [],
      returnItems: [],
      orderAllocated: false,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: 'system'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not define component-scoped styles', () => {
    const componentDef = (OrderListComponent as any).ɵcmp;
    expect(componentDef.styles?.length ?? 0).toBe(0);
  });

  it('should return correct order status severity', () => {
    expect(component.getOrderStatusSeverity(OrderStatus.Completed)).toBe('success');
    expect(component.getOrderStatusSeverity(OrderStatus.Processing)).toBe('info');
    expect(component.getOrderStatusSeverity(OrderStatus.Revision)).toBe('warn');
    expect(component.getOrderStatusSeverity(OrderStatus.RevisionPending)).toBe('warn');
    expect(component.getOrderStatusSeverity(OrderStatus.Pending)).toBe('secondary');
    expect(component.getOrderStatusSeverity(OrderStatus.Cancelled)).toBe('danger');
  });

  it('should emit view when view output is emitted', () => {
    const emitSpy = vi.spyOn(component.view, 'emit');
    component.view.emit(mockOrders[0]);
    expect(emitSpy).toHaveBeenCalledWith(mockOrders[0]);
  });

  it('should emit delete event via output', () => {
    const emitSpy = vi.spyOn(component.delete, 'emit');
    component.delete.emit(mockOrders[0]);
    expect(emitSpy).toHaveBeenCalledWith(mockOrders[0]);
  });

  it('should emit pageChange via output', () => {
    const emitSpy = vi.spyOn(component.pageChange, 'emit');
    const pageEvent = { first: 10, rows: 10, page: 1, pageCount: 5 };
    component.pageChange.emit(pageEvent as any);
    expect(emitSpy).toHaveBeenCalledWith(pageEvent);
  });
});
