// =============================================================================
// Base Dialog Component
// =============================================================================
// Abstract base class for dialog components with common dialog logic
// Extend this class and implement the abstract members.
//
// Usage:
// @Component({...})
// export class MyDialogComponent extends BaseDialogComponent<MyDialogData, MyDialogResult> {
//   public readonly dialogTitle = 'My Dialog';
//   // OR for dynamic titles:
//   // public get dialogTitle(): string { return this.data.mode === 'create' ? 'New' : 'Edit'; }
// }

import { Directive, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * Abstract base class for dialog components.
 * Provides common dialog functionality like close handling and data injection.
 *
 * @typeParam TData - The dialog input data type
 * @typeParam TResult - The dialog result type when closed
 */
@Directive()
export abstract class BaseDialogComponent<TData = unknown, TResult = unknown> {
  /** Injected dialog reference for closing */
  protected readonly dialogRef = inject(MatDialogRef<unknown, TResult>);

  /** Injected dialog data passed when opening */
  public readonly data: TData = inject(MAT_DIALOG_DATA) as TData;

  /**
   * The dialog title displayed in the header.
   * Can be implemented as a readonly field or a getter for dynamic titles.
   */
  public abstract readonly dialogTitle: string;

  /**
   * Closes the dialog without returning a result.
   * Call this when the user cancels or closes the dialog.
   */
  public handleCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Closes the dialog with a result.
   * Call this when the dialog action is complete.
   *
   * @param result - The result to return to the opener
   */
  protected closeWithResult(result: TResult): void {
    this.dialogRef.close(result);
  }
}
