import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import type { TimeEntry } from '../../../core/models/time-tracking.interfaces';
import { DatePickerInputComponent } from '../../../shared/components/date-picker/date-picker-input.component';
import { DialogHeaderComponent } from '../../../shared/components/dialog-header/dialog-header.component';
import { BaseDialogComponent } from '../../../shared/components/base';

/**
 * Dialog data for editing a time entry.
 */
export interface TimeEntryEditorDialogData {
  entry: TimeEntry;
}

/**
 * The edited time entry, returned when the dialog is saved.
 */
export interface TimeEntryEditorDialogResult {
  taskKey: string | null;
  description: string | null;
  startTimeUtc: string;
  endTimeUtc: string;
  isAllDay: boolean;
}

@Component({
  selector: 'app-time-entry-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatTooltipModule,
    FontAwesomeModule,
    DialogHeaderComponent,
    DatePickerInputComponent
  ],
  templateUrl: './time-entry-editor-dialog.component.html',
  styleUrl: './time-entry-editor-dialog.component.scss'
})
export class TimeEntryEditorDialogComponent extends BaseDialogComponent<TimeEntryEditorDialogData, TimeEntryEditorDialogResult> {
  public readonly dialogTitle = 'Edit Time Entry';

  // Icons
  public readonly clockIcon = Icons.clock;
  public readonly clearIcon = Icons.close;

  // Form fields
  public readonly taskKeyInput = signal<string>(this.data.entry.taskKey ?? '');
  public readonly description = signal(this.data.entry.description ?? '');
  public readonly isAllDay = signal(this.data.entry.isAllDay);

  // Date/time fields - using string format for time inputs, Date for date picker
  public readonly startDate = signal(this.formatDateForInput(new Date(this.data.entry.startTimeUtc)));
  public readonly startTime = signal(this.formatTimeForInput(new Date(this.data.entry.startTimeUtc)));
  public readonly endDate = signal(this.formatDateForInput(new Date(this.data.entry.endTimeUtc)));
  public readonly endTime = signal(this.formatTimeForInput(new Date(this.data.entry.endTimeUtc)));

  // Computed Date values for the date picker component
  public readonly startDateValue = computed(() => {
    const dateStr = this.startDate();
    if (!dateStr) {
      return null;
    }
    const parsed = new Date(`${dateStr}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  });

  public readonly endDateValue = computed(() => {
    const dateStr = this.endDate();
    if (!dateStr) {
      return null;
    }
    const parsed = new Date(`${dateStr}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  });

  public get isValid(): boolean {
    const hasTask = this.taskKeyInput().trim().length > 0;
    const hasValidDates = this.getStartDateTime() < this.getEndDateTime();
    return hasTask && hasValidDates;
  }

  public onTaskKeyInput(event: Event): void {
    this.taskKeyInput.set((event.target as HTMLInputElement).value ?? '');
  }

  public clearTaskLink(): void {
    this.taskKeyInput.set('');
  }

  public handleSubmit(): void {
    if (!this.isValid) {
      return;
    }

    this.closeWithResult({
      taskKey: this.taskKeyInput().trim(),
      description: this.description()?.trim() || null,
      startTimeUtc: this.getStartDateTime().toISOString(),
      endTimeUtc: this.getEndDateTime().toISOString(),
      isAllDay: this.isAllDay()
    });
  }

  public onAllDayChange(checked: boolean): void {
    this.isAllDay.set(checked);

    if (checked) {
      // Set time to full day (midnight to midnight)
      this.startTime.set('00:00');
      this.endTime.set('23:59');
    }
  }

  public onStartDateChange(date: Date | null): void {
    if (date) {
      this.startDate.set(this.formatDateForInput(date));
    }
  }

  public onEndDateChange(date: Date | null): void {
    if (date) {
      this.endDate.set(this.formatDateForInput(date));
    }
  }

  // ========== Helper Methods ==========

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTimeForInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private getStartDateTime(): Date {
    const dateStr = this.startDate();
    const timeStr = this.isAllDay() ? '00:00' : this.startTime();
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  private getEndDateTime(): Date {
    const dateStr = this.endDate();
    const timeStr = this.isAllDay() ? '23:59' : this.endTime();
    return new Date(`${dateStr}T${timeStr}:00`);
  }
}
