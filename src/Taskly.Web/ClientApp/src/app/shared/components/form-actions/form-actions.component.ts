import { Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

/**
 * Reusable form actions component for submit/cancel button groups.
 *
 * Supports:
 * - Optional delete button (for edit modes)
 * - Cancel button with customizable label
 * - Submit button with loading state and customizable labels
 * - Dialog mode (uses mat-dialog-actions) or standalone mode
 * - Content projection for custom left-side actions
 *
 * @example Basic usage in dialog
 * ```html
 * <app-form-actions
 *   [dialogMode]="true"
 *   [saving]="saving()"
 *   [disabled]="form.invalid"
 *   submitLabel="Save"
 *   (cancelClick)="close()"
 *   (submitClick)="save()" />
 * ```
 *
 * @example With delete button and custom labels
 * ```html
 * <app-form-actions
 *   [dialogMode]="true"
 *   [showDelete]="isEditMode"
 *   [saving]="saving()"
 *   [disabled]="!isValid"
 *   submitLabel="Save Changes"
 *   savingLabel="Saving..."
 *   cancelLabel="Discard"
 *   (deleteClick)="handleDelete()"
 *   (cancelClick)="handleCancel()"
 *   (submitClick)="handleSubmit()" />
 * ```
 *
 * @example With content projection
 * ```html
 * <app-form-actions [dialogMode]="true" (submitClick)="save()">
 *   <button mat-button (click)="exportData()">Export</button>
 * </app-form-actions>
 * ```
 */
@Component({
  selector: 'app-form-actions',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    FontAwesomeModule
  ],
  templateUrl: './form-actions.component.html',
  styleUrl: './form-actions.component.scss'
})
export class FormActionsComponent {
  /** Whether to use mat-dialog-actions styling */
  public readonly dialogMode = input<boolean>(false);

  /** Alignment of buttons - 'end' | 'center' | 'start' */
  public readonly align = input<'end' | 'center' | 'start'>('end');

  /** Whether to show the delete button */
  public readonly showDelete = input<boolean>(false);

  /** Label for the delete button */
  public readonly deleteLabel = input<string>('Delete');

  /** Tooltip for the delete button */
  public readonly deleteTooltip = input<string>('');

  /** Label for the cancel button */
  public readonly cancelLabel = input<string>('Cancel');

  /** Whether to show the cancel button */
  public readonly showCancel = input<boolean>(true);

  /** Label for the submit button */
  public readonly submitLabel = input<string>('Submit');

  /** Label to show when saving */
  public readonly savingLabel = input<string>('Saving...');

  /** Whether a save operation is in progress */
  public readonly saving = input<boolean>(false);

  /** Whether the submit button is disabled (in addition to saving state) */
  public readonly disabled = input<boolean>(false);

  /** Button type for submit button - 'button' or 'submit' */
  public readonly submitType = input<'button' | 'submit'>('button');

  /** Emitted when delete button is clicked */
  public readonly deleteClick = output<void>();

  /** Emitted when cancel button is clicked */
  public readonly cancelClick = output<void>();

  /** Emitted when submit button is clicked */
  public readonly submitClick = output<void>();

  // Icons
  public readonly deleteIcon = faTrash;

  /**
   * Checks if submit button should be disabled
   */
  public get isSubmitDisabled(): boolean {
    return this.disabled() || this.saving();
  }

  public onDelete(): void {
    this.deleteClick.emit();
  }

  public onCancel(): void {
    this.cancelClick.emit();
  }

  public onSubmit(): void {
    this.submitClick.emit();
  }
}
