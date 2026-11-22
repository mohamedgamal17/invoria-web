import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettlementsTabComponent } from './settlements-tab.component';
import type { FinancialSettlement } from '@invoria/utils';

describe('SettlementsTabComponent', () => {
  let component: SettlementsTabComponent;
  let fixture: ComponentFixture<SettlementsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettlementsTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettlementsTabComponent);
    component = fixture.componentInstance;
  });

  it('renders empty state when there are no settlements', () => {
    fixture.componentRef.setInput('settlements', []);
    fixture.componentRef.setInput('entityName', 'payable');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('No settlements');
    expect(element.textContent).toContain('This payable has no settlements yet.');
  });

  it('sorts settlements newest first and computes total settled', () => {
    const rawSettlements: FinancialSettlement[] = [
      { id: 'item-1', amount: 100, settledAt: '2026-01-01T10:00:00Z' },
      { id: 'item-2', amount: 250, settledAt: '2026-01-02T10:00:00Z' },
    ];
    fixture.componentRef.setInput('settlements', rawSettlements);
    fixture.detectChanges();

    expect(component.safeSettlements()[0].id).toBe('item-2');
    expect(component.totalSettled()).toBe(350);
  });

  it('emits settleRequest when record settlement button is clicked', () => {
    fixture.componentRef.setInput('settlements', []);
    fixture.componentRef.setInput('outstandingAmount', 500);
    fixture.detectChanges();

    let emitted = false;
    component.settleRequest.subscribe(() => {
      emitted = true;
    });

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button?.click();

    expect(emitted).toBe(true);
  });
});
