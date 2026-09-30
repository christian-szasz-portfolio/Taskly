
import { Component, forwardRef, input, signal, viewChild } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, type AbstractControl, type ControlValueAccessor, type ValidationErrors, type Validator } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import { DatePickerCalendarHeaderComponent } from './date-picker-header/date-picker-header.component';

@Component({
  selector: 'app-date-picker-input',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FontAwesomeModule
],
  templateUrl: './date-picker-input.component.html',
  styleUrl: './date-picker-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatePickerInputComponent),
      multi: true,
    },
  ],
})
export class DatePickerInputComponent implements ControlValueAccessor, Validator {
  public readonly label = input('Date');
  public readonly hint = input('');
  public readonly placeholder = input('');
  public readonly required = input(false);

  private readonly menuTrigger = viewChild(MatMenuTrigger);

  public readonly inputValue = signal('');
  public readonly disabled = signal(false);
  public readonly calendarValue = signal<Date | null>(null);
  public readonly hasManualInputError = signal(false);
  public readonly calendarIcon = signal(Icons.calendarDays);
  public readonly calendarHeader = DatePickerCalendarHeaderComponent;

  private onChange?: (value: Date | null) => void;
  private onTouched?: () => void;
  private onValidatorChange?: () => void;

  public writeValue(value: Date | null): void {
    this.calendarValue.set(value);
    this.inputValue.set(value ? this.formatForInput(value) : '');
  }

  public registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  public onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);

    if (!value) {
      this.setManualInputError(false);
      this.updateValue(null);
      return;
    }

    const parsed = this.tryParse(value);
    if (!parsed) {
      this.setManualInputError(true);
      this.onChange?.(null);
      return;
    }

    this.setManualInputError(false);
    this.updateValue(parsed);
  }

  public handleCalendarSelection(date: Date | null): void {
    this.onTouched?.();

    if (!date) {
      this.setManualInputError(false);
      this.inputValue.set('');
      this.updateValue(null);
      this.menuTrigger()?.closeMenu();
      return;
    }

    this.inputValue.set(this.formatForInput(date));
    this.setManualInputError(false);
    this.updateValue(date);
    this.menuTrigger()?.closeMenu();
  }

  public handleBlur(): void {
    this.onTouched?.();
  }

  public clearFromMenu(): void {
    this.setManualInputError(false);
    this.inputValue.set('');
    this.updateValue(null);
    this.onTouched?.();
    this.menuTrigger()?.closeMenu();
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    const rawValue: unknown = control.value;
    const value = rawValue instanceof Date ? rawValue : null;

    if (this.required() && !value) {
      return { required: true };
    }

    if (this.hasManualInputError()) {
      return { invalidDate: true };
    }

    return null;
  }

  public registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  private updateValue(value: Date | null): void {
    this.calendarValue.set(value);
    this.onChange?.(value);
    this.onValidatorChange?.();
  }

  private tryParse(raw: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return null;
    }

    const parsed = new Date(`${raw}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private formatForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private setManualInputError(state: boolean): void {
    if (this.hasManualInputError() === state) {
      return;
    }

    this.hasManualInputError.set(state);
    this.onValidatorChange?.();
  }
}

