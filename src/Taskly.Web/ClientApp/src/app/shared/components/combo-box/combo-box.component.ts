import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, effect, input, signal, viewChild } from '@angular/core';
import type { ElementRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteTrigger, type MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { FormField, type FieldTree } from '@angular/forms/signals';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';

export interface ComboBoxOption {
  value: string;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-combo-box',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatButtonModule, FormField, FontAwesomeModule],
  templateUrl: './combo-box.component.html',
  styleUrl: './combo-box.component.scss'
})
export class ComboBoxComponent {
  public readonly label = input('Select value');
  public readonly placeholder = input('Search or type');
  public readonly hint = input<string | null>(null);
  public readonly appearance = input<'fill' | 'outline'>('outline');
  public readonly options = input<readonly ComboBoxOption[]>([]);
  public readonly field = input.required<FieldTree<string>>();
  public readonly maxLength = input<number | null>(null);
  public readonly showClear = input(true);
  public readonly showError = input(false);
  public readonly errorText = input<string | null>(null);
  public readonly icons = signal({
    clear: Icons.close,
    caret: Icons.chevronDown
  });


  private readonly comboInput = viewChild<ElementRef<HTMLInputElement>>('comboInput');
  private readonly autocompleteTrigger = viewChild(MatAutocompleteTrigger);

  private readonly userInteracting = signal(false);
  private readonly filterValue = signal('');

  private resolveFieldValue(): string {
    const accessor = this.field();
    const instance = accessor();
    return instance.value() ?? '';
  }

  private readonly optionLookup = computed(() => {
    const lookup = new Map<string, ComboBoxOption>();
    for (const option of this.options()) {
      if (option.value) {
        lookup.set(option.value, option);
      }
    }
    return lookup;
  });

  public readonly filteredOptions = computed(() => {
    const query = this.filterValue().toLowerCase();
    const options = this.options();
    if (!query) {
      return options;
    }

    return options.filter((option) => {
      const label = option.label.toLowerCase();
      const description = option.description?.toLowerCase() ?? '';
      return label.includes(query) || description.includes(query);
    });
  });

  public readonly hasValue = computed(() => this.resolveFieldValue().length > 0);
  public readonly valueLength = computed(() => this.resolveFieldValue().length);

  public readonly displayOption = (value: string | null): string => {
    if (!value) {
      return '';
    }

    const option = this.optionLookup().get(value);
    return option?.label ?? value;
  };

  public constructor() {
    effect(() => {
      if (this.userInteracting()) {
        return;
      }

      this.filterValue.set('');
    });
  }

  public handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.userInteracting.set(true);
    this.filterValue.set(value);
  }

  public handleBlur(): void {
    this.userInteracting.set(false);
  }

  public handleOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const rawValue: unknown = event.option.value;
    const value = this.normalizeSelectedValue(rawValue);
    const control = this.field();
    control().value.set(value);
    this.userInteracting.set(false);
    this.filterValue.set('');
  }

  public clearSelection(): void {
    if (!this.hasValue()) {
      return;
    }

    const control = this.field();
    control().value.set('');
    this.filterValue.set('');
    this.userInteracting.set(false);
    this.comboInput()?.nativeElement.focus();
  }

  private normalizeSelectedValue(rawValue: unknown): string {
    if (typeof rawValue === 'string') {
      return rawValue;
    }

    if (typeof rawValue === 'number') {
      return rawValue.toString();
    }

    if (rawValue == null) {
      return '';
    }

    if (typeof rawValue === 'boolean') {
      return rawValue ? 'true' : 'false';
    }

    return '';
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  public handleViewportChange(): void {
    if (!this.autocompleteTrigger()?.panelOpen) {
      return;
    }

    this.autocompleteTrigger()?.updatePosition();
  }
}
