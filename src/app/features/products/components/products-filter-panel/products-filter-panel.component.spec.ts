import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ProductsFilterPanelComponent } from './products-filter-panel.component';

describe('ProductsFilterPanelComponent', () => {
  let fixture: ComponentFixture<ProductsFilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsFilterPanelComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsFilterPanelComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debounces filtersChange for name input', async () => {
    vi.useFakeTimers();

    const emissions: Array<{ name: string }> = [];
    const sub = outputToObservable(fixture.componentInstance.filtersChange).subscribe((f) =>
      emissions.push(f)
    );

    fixture.componentInstance.onNameInput('x');
    fixture.componentInstance.onNameInput('xy');
    expect(emissions.length).toBe(0);

    await vi.advanceTimersByTimeAsync(700);
    expect(emissions.length).toBe(1);
    expect(emissions[0]?.name).toBe('xy');

    sub.unsubscribe();
  });
});
