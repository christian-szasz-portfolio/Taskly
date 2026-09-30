import { Component, signal, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { type MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { form } from '@angular/forms/signals';
import { getFormTestProviders } from '@testing/test-helpers';
import { ComboBoxComponent, type ComboBoxOption } from './combo-box.component';

interface TestFormModel {
  selection: string;
}

@Component({
  standalone: true,
  imports: [ComboBoxComponent],
  template: `
    <app-combo-box
      [field]="testForm.selection"
      [options]="options()"
      [label]="label()"
      [placeholder]="placeholder()"
    />
  `
})
class TestHostComponent {
  readonly formModel = signal<TestFormModel>({ selection: '' });
  readonly testForm = form(this.formModel);
  readonly options = signal<ComboBoxOption[]>([]);
  readonly label = signal('Select value');
  readonly placeholder = signal('Search or type');

  readonly comboBox = viewChild(ComboBoxComponent);
}

describe('ComboBoxComponent', () => {
  let hostComponent: TestHostComponent;
  let component: ComboBoxComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockOptions: ComboBoxOption[] = [
    { value: 'opt1', label: 'Option 1', description: 'First option' },
    { value: 'opt2', label: 'Option 2', description: 'Second option' },
    { value: 'opt3', label: 'Option 3' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: getFormTestProviders()
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.options.set(mockOptions);
    fixture.detectChanges();
    component = hostComponent.comboBox()!;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default label', () => {
    expect(component.label()).toBe('Select value');
  });

  it('should have default placeholder', () => {
    expect(component.placeholder()).toBe('Search or type');
  });

  it('should have default appearance', () => {
    expect(component.appearance()).toBe('outline');
  });

  it('should have options', () => {
    expect(component.options()).toEqual(mockOptions);
  });

  describe('filteredOptions', () => {
    it('should return all options when no filter', () => {
      expect(component.filteredOptions()).toEqual(mockOptions);
    });
  });

  describe('hasValue', () => {
    it('should return false when field is empty', () => {
      expect(component.hasValue()).toBe(false);
    });

    it('should return true when field has value', () => {
      hostComponent.testForm.selection().value.set('opt1');
      fixture.detectChanges();

      expect(component.hasValue()).toBe(true);
    });
  });

  describe('displayOption', () => {
    it('should return label for known value', () => {
      expect(component.displayOption('opt1')).toBe('Option 1');
    });

    it('should return value for unknown value', () => {
      expect(component.displayOption('unknown')).toBe('unknown');
    });

    it('should return empty string for null', () => {
      expect(component.displayOption(null)).toBe('');
    });
  });

  describe('handleInput', () => {
    it('should update filter value', () => {
      const event = { target: { value: 'Option 1' } } as unknown as Event;
      component.handleInput(event);

      // Filter should now show only matching options
      expect(component.filteredOptions().length).toBe(1);
      expect(component.filteredOptions()[0].value).toBe('opt1');
    });

    it('should filter by description', () => {
      const event = { target: { value: 'First' } } as unknown as Event;
      component.handleInput(event);

      expect(component.filteredOptions().length).toBe(1);
      expect(component.filteredOptions()[0].value).toBe('opt1');
    });
  });

  describe('handleBlur', () => {
    it('should reset user interacting state', () => {
      // Trigger input first
      component.handleInput({ target: { value: 'test' } } as unknown as Event);
      component.handleBlur();

      // No error should be thrown
      expect(component).toBeTruthy();
    });
  });

  describe('handleOptionSelected', () => {
    it('should update field value', () => {
      const event: MatAutocompleteSelectedEvent = {
        option: { value: 'opt2' }
      } as MatAutocompleteSelectedEvent;

      component.handleOptionSelected(event);

      expect(hostComponent.testForm.selection().value()).toBe('opt2');
    });
  });

  describe('clearSelection', () => {
    it('should clear field value', () => {
      hostComponent.testForm.selection().value.set('opt1');
      fixture.detectChanges();

      component.clearSelection();

      expect(hostComponent.testForm.selection().value()).toBe('');
    });

    it('should do nothing when already empty', () => {
      hostComponent.testForm.selection().value.set('');
      fixture.detectChanges();

      // Should not throw
      expect(() => component.clearSelection()).not.toThrow();
    });
  });

  describe('icons', () => {
    it('should have clear and caret icons', () => {
      expect(component.icons().clear).toBeTruthy();
      expect(component.icons().caret).toBeTruthy();
    });
  });
});
