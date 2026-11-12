import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AutosearchComponent } from './autosearch.component';

interface TestEntity {
  id: string;
  name: string;
}

describe('AutosearchComponent', () => {
  let fixture: ComponentFixture<AutosearchComponent<TestEntity>>;
  let component: AutosearchComponent<TestEntity>;

  const testEntity: TestEntity = { id: 'ent_1', name: 'Entity one' };

  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      }
    );

    await TestBed.configureTestingModule({
      imports: [AutosearchComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent<AutosearchComponent<TestEntity>>(AutosearchComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('controlName', 'testSearch');
    fixture.detectChanges();
  });

  it('emits search with the query through the completeMethod delegation', () => {
    const searchSpy = vi.fn();
    component.search.subscribe(searchSpy);

    component.search.emit({ query: 'tea' });
    expect(searchSpy).toHaveBeenCalledWith({ query: 'tea' });
  });

  it('onSelect stores the entity and emits select', () => {
    const selectSpy = vi.fn();
    component.select.subscribe(selectSpy);
    const selectedChangeSpy = vi.fn();
    component.selected.subscribe(selectedChangeSpy);

    component.onSelect({ originalEvent: new Event('select'), value: testEntity });

    expect(component.selected()).toEqual(testEntity);
    expect(selectSpy).toHaveBeenCalledWith(testEntity);
    expect(selectedChangeSpy).toHaveBeenCalledWith(testEntity);
  });

  it('clear emits without changing the selected value itself', () => {
    component.selected.set(testEntity);
    const clearSpy = vi.fn();
    component.clear.subscribe(clearSpy);

    component.clear.emit();

    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(component.selected()).toEqual(testEntity);
  });

  it('hides the remove button when nothing is selected and shows it once selected', () => {
    fixture.componentRef.setInput('suggestions', [testEntity]);
    fixture.detectChanges();
    let removeButton = fixture.nativeElement.querySelector('p-button');
    expect(removeButton).toBeNull();

    component.selected.set(testEntity);
    fixture.detectChanges();
    removeButton = fixture.nativeElement.querySelector('p-button');
    expect(removeButton).not.toBeNull();
  });

  it('defaults the remove button to times icon with secondary severity', () => {
    component.selected.set(testEntity);
    fixture.detectChanges();
    const timesIcon = fixture.nativeElement.querySelector('.pi-times');
    expect(timesIcon).not.toBeNull();
  });
});
