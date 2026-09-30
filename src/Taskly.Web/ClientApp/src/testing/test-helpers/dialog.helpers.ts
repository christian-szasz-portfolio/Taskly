// =============================================================================
// Dialog Test Helpers
// =============================================================================
// Centralized dialog mock utilities for testing
// Import with: import { createDialogMock } from '@testing/test-helpers';

import type { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { createSpyObj, type MockedObject } from './spy.helpers';

// =============================================================================
// Types
// =============================================================================

/**
 * A MatDialogRef with Vitest mock methods available.
 * Since MockedObject<T> extends T, this is assignable to MatDialogRef.
 */
export type MockDialogRef<T = unknown, R = unknown> = MockedObject<MatDialogRef<T, R>>;

/**
 * A MatDialog with Vitest mock methods available.
 * Since MockedObject<T> extends T, this is assignable to MatDialog.
 */
export type MockDialog = MockedObject<MatDialog>;

/**
 * Result from createDialogMock containing both dialog and dialogRef spies.
 */
export interface DialogMockResult<T = unknown, R = unknown> {
  /** Mock MatDialog service */
  dialogSpy: MockDialog;
  /** Mock MatDialogRef */
  dialogRefSpy: MockDialogRef<T, R>;
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Creates mock MatDialog and MatDialogRef spies for testing.
 * Handles the internal _openDialogs and openDialogs properties that Material requires.
 *
 * @param afterClosedValue - Optional value to return from afterClosed()
 * @returns Object containing dialogSpy and dialogRefSpy
 *
 * @example
 * // Basic usage
 * const { dialogSpy, dialogRefSpy } = createDialogMock();
 *
 * // With a specific afterClosed result
 * const { dialogSpy, dialogRefSpy } = createDialogMock({ action: 'save', data: {...} });
 *
 * // In TestBed providers
 * .overrideComponent(MyComponent, {
 *   add: { providers: [{ provide: MatDialog, useValue: dialogSpy }] }
 * })
 */
export function createDialogMock<T = unknown, R = unknown>(
  afterClosedValue: R | undefined = undefined
): DialogMockResult<T, R> {
  const dialogRefSpy = createSpyObj<MatDialogRef<T, R>>(
    [
      'afterClosed',
      'close',
      'afterOpened',
      'beforeClosed',
      'backdropClick',
      'keydownEvents',
      'updatePosition',
      'updateSize'
    ]
  );

  dialogRefSpy.afterClosed.mockReturnValue(of(afterClosedValue));
  dialogRefSpy.afterOpened.mockReturnValue(of(undefined));
  dialogRefSpy.beforeClosed.mockReturnValue(of(afterClosedValue));
  dialogRefSpy.backdropClick.mockReturnValue(of({} as MouseEvent));
  dialogRefSpy.keydownEvents.mockReturnValue(of({} as KeyboardEvent));

  const dialogSpy = createSpyObj<MatDialog>(
    ['open', 'closeAll', 'getDialogById'],
    {
      openDialogs: [],
      afterOpened: new Subject<MatDialogRef<unknown, unknown>>(),
      afterAllClosed: of(undefined)
    }
  );

  dialogSpy.open.mockReturnValue(dialogRefSpy);
  dialogSpy.getDialogById.mockReturnValue(undefined);

  return { dialogSpy, dialogRefSpy };
}

/**
 * Creates a dialog mock that returns a specific result when closed.
 * Useful for testing dialog submission flows.
 *
 * @param result - The result to return from afterClosed()
 * @returns Object containing dialogSpy and dialogRefSpy
 */
export function createDialogMockWithResult<R>(result: R): DialogMockResult<unknown, R> {
  return createDialogMock<unknown, R>(result);
}

/**
 * Creates a dialog mock that simulates cancellation (undefined result).
 */
export function createCancelDialogMock(): DialogMockResult {
  return createDialogMock<unknown, unknown>(undefined);
}

/**
 * Configures a dialog mock to return a new result on subsequent opens.
 * Useful for testing multiple dialog interactions.
 *
 * @param dialogMock - The existing dialog mock result
 * @param newResult - The new result to return from afterClosed()
 */
export function updateDialogMockResult<R>(
  dialogMock: DialogMockResult<unknown, R>,
  newResult: R | undefined
): void {
  dialogMock.dialogRefSpy.afterClosed.mockReturnValue(of(newResult));
  dialogMock.dialogRefSpy.beforeClosed.mockReturnValue(of(newResult));
}
