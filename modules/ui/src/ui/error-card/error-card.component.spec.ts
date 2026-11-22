import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorCardComponent } from './error-card.component';

describe('ErrorCardComponent', () => {
  let component: ErrorCardComponent;
  let fixture: ComponentFixture<ErrorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorCardComponent);
    component = fixture.componentInstance;
  });

  it('renders title and message correctly', () => {
    fixture.componentRef.setInput('title', 'Unable to load resource');
    fixture.componentRef.setInput('message', 'Server error');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Unable to load resource');
    expect(element.textContent).toContain('Server error');
  });

  it('emits retry when button is clicked', () => {
    fixture.componentRef.setInput('title', 'Error');
    fixture.componentRef.setInput('message', 'Failed');
    fixture.detectChanges();

    let retryCalled = false;
    component.retry.subscribe(() => {
      retryCalled = true;
    });

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button?.click();

    expect(retryCalled).toBe(true);
  });
});
