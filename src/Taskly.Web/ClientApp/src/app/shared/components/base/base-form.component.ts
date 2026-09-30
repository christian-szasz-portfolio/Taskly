// =============================================================================
// Base Form Component
// =============================================================================
// Abstract base class for form components with common inputs/outputs
// Extend this class and implement the abstract members.
//
// Usage:
// @Component({...})
// export class MyFormComponent extends BaseFormComponent<MyPayload> {
//   public submit(): void { this.submitted.emit(payload); }
// }

import { Directive, computed, input, output } from '@angular/core';

/**
 * Abstract base class for form components.
 * Provides common form inputs like saving state and error handling.
 *
 * @typeParam TPayload - The form submission payload type
 */
@Directive()
export abstract class BaseFormComponent<TPayload> {
  // =========================================================================
  // Common Inputs
  // =========================================================================

  /** Form appearance context: page or dialog */
  public readonly appearance = input<'page' | 'dialog'>('page');

  /** HTML form ID for submit button association */
  public readonly formId = input('form');

  /** Whether the form is currently saving */
  public readonly saving = input(false);

  /** API error message to display */
  public readonly apiError = input<string | null>(null);

  /** Custom submit button label */
  public readonly submitLabel = input<string | null>(null);

  /** Custom cancel button label */
  public readonly cancelLabel = input('Cancel');

  // =========================================================================
  // Common Outputs
  // =========================================================================

  /** Emitted when the form is successfully submitted */
  public readonly submitted = output<TPayload>();

  /** Emitted when the form is cancelled */
  public readonly cancelled = output<void>();

  // =========================================================================
  // Computed Properties
  // =========================================================================

  /** Whether the form is in dialog appearance mode */
  public readonly isDialogAppearance = computed(() => this.appearance() === 'dialog');

  /** Submit button label, unless the caller names one */
  public readonly defaultSubmitLabel = computed(() => this.submitLabel() ?? 'Save');

  // =========================================================================
  // Abstract Methods
  // =========================================================================

  /**
   * Override to implement form validation and submission logic.
   * Should call `this.submitted.emit(payload)` on success.
   */
  public abstract submit(): void | Promise<void>;

  // =========================================================================
  // Common Methods
  // =========================================================================

  /**
   * Cancels the form and emits the cancelled event.
   */
  public cancel(): void {
    this.cancelled.emit();
  }
}
