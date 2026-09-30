import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { getFormTestProviders } from '@testing/test-helpers';
import { DatePickerInputComponent } from './date-picker-input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

describe('DatePickerInputComponent', () => {
  let component: DatePickerInputComponent;
  let fixture: ComponentFixture<DatePickerInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerInputComponent, ReactiveFormsModule],
      providers: getFormTestProviders()
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatePickerInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default label', () => {
    expect(component.label()).toBe('Date');
  });

  it('should start with empty input value', () => {
    expect(component.inputValue()).toBe('');
  });

  it('should not be disabled by default', () => {
    expect(component.disabled()).toBe(false);
  });

  describe('writeValue', () => {
    it('should update calendarValue and inputValue for valid date', () => {
      const date = new Date(2024, 11, 25);
      component.writeValue(date);

      expect(component.calendarValue()).toEqual(date);
      expect(component.inputValue()).toBe('2024-12-25');
    });

    it('should clear values for null', () => {
      component.writeValue(new Date());
      component.writeValue(null);

      expect(component.calendarValue()).toBeNull();
      expect(component.inputValue()).toBe('');
    });
  });

  describe('registerOnChange', () => {
    it('should register the onChange callback', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      component.onInputChange({ target: { value: '2024-12-25' } } as unknown as Event);

      expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    });
  });

  describe('registerOnTouched', () => {
    it('should register the onTouched callback', () => {
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);

      component.handleBlur();

      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('setDisabledState', () => {
    it('should update disabled signal', () => {
      component.setDisabledState(true);
      expect(component.disabled()).toBe(true);

      component.setDisabledState(false);
      expect(component.disabled()).toBe(false);
    });
  });

  describe('onInputChange', () => {
    beforeEach(() => {
      component.registerOnChange((): void => { /* noop */ });
    });

    it('should parse valid date string', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      component.onInputChange({ target: { value: '2024-12-25' } } as unknown as Event);

      expect(component.hasManualInputError()).toBe(false);
      expect(onChange).toHaveBeenCalled();
      const passedDate = onChange.mock.calls.at(-1)?.[0] as unknown;
      expect(passedDate).toBeInstanceOf(Date);
    });

    it('should set error for invalid date string', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      component.onInputChange({ target: { value: 'invalid-date' } } as unknown as Event);

      expect(component.hasManualInputError()).toBe(true);
    });

    it('should clear value for empty string', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      component.onInputChange({ target: { value: '' } } as unknown as Event);

      expect(component.hasManualInputError()).toBe(false);
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should reject invalid date format', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      // Wrong format (should be YYYY-MM-DD)
      component.onInputChange({ target: { value: '12/25/2024' } } as unknown as Event);

      expect(component.hasManualInputError()).toBe(true);
    });
  });

  describe('handleCalendarSelection', () => {
    it('should update value from calendar selection', () => {
      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      const date = new Date(2024, 11, 25);
      component.handleCalendarSelection(date);

      expect(component.inputValue()).toBe('2024-12-25');
      expect(onChange).toHaveBeenCalledWith(date);
      expect(onTouched).toHaveBeenCalled();
    });

    it('should clear value when null is selected', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      component.handleCalendarSelection(null);

      expect(component.inputValue()).toBe('');
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('clearFromMenu', () => {
    it('should clear all values', () => {
      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      // Set a value first
      component.writeValue(new Date());

      // Clear it
      component.clearFromMenu();

      expect(component.inputValue()).toBe('');
      expect(component.calendarValue()).toBeNull();
      expect(onChange).toHaveBeenCalledWith(null);
      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('validate', () => {
    it('should return null for valid date', () => {
      const control = new FormControl(new Date());
      expect(component.validate(control)).toBeNull();
    });

    it('should return required error when required and empty', () => {
      fixture.componentRef.setInput('required', true);

      const control = new FormControl(null);
      const result = component.validate(control);

      expect(result).toEqual({ required: true });
    });

    it('should return invalidDate error for manual input error', () => {
      component.registerOnChange((): void => { /* noop */ });
      component.onInputChange({ target: { value: 'invalid' } } as unknown as Event);

      const control = new FormControl(null);
      const result = component.validate(control);

      expect(result).toEqual({ invalidDate: true });
    });
  });
});
