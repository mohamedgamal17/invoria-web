import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsToolbarComponent } from './details-toolbar.component';

describe('DetailsToolbarComponent', () => {
  let component: DetailsToolbarComponent;
  let fixture: ComponentFixture<DetailsToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsToolbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsToolbarComponent);
    component = fixture.componentInstance;
  });

  it('renders title, description and back label', () => {
    fixture.componentRef.setInput('title', 'Item Details');
    fixture.componentRef.setInput('description', 'View item info');
    fixture.componentRef.setInput('backLabel', 'Back to Items');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Item Details');
    expect(element.textContent).toContain('View item info');
    expect(element.textContent).toContain('Back to Items');
  });

  it('emits back event on button click', () => {
    fixture.componentRef.setInput('title', 'Details');
    fixture.detectChanges();

    let backEmitted = false;
    component.back.subscribe(() => {
      backEmitted = true;
    });

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button?.click();

    expect(backEmitted).toBe(true);
  });
});
