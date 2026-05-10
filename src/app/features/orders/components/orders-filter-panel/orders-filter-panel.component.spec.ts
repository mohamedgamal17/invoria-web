import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OrdersFilterPanelComponent } from './orders-filter-panel.component';

describe('OrdersFilterPanelComponent', () => {
  let fixture: ComponentFixture<OrdersFilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersFilterPanelComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersFilterPanelComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debounces filtersChange for order number input', async () => {
    vi.useFakeTimers();

    const emissions: Array<{ orderNumber: string }> = [];
    const sub = outputToObservable(fixture.componentInstance.filtersChange).subscribe((f) =>
      emissions.push(f)
    );

    fixture.componentInstance.onOrderNumberInput('x');
    fixture.componentInstance.onOrderNumberInput('xy');
    expect(emissions.length).toBe(0);

    await vi.advanceTimersByTimeAsync(700);
    expect(emissions.length).toBe(1);
    expect(emissions[0]?.orderNumber).toBe('xy');

    sub.unsubscribe();
  });
});
