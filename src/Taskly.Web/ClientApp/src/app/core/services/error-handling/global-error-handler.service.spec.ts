import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, type MatDialogRef } from '@angular/material/dialog';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { GlobalErrorHandler } from './global-error-handler.service';
import { Subject } from 'rxjs';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let dialogSpy: MockedObject<MatDialog>;
  let dialogRefSpy: MockedObject<MatDialogRef<unknown>>;
  let afterClosedSubject: Subject<void>;

  beforeEach(() => {
    afterClosedSubject = new Subject<void>();

    dialogRefSpy = createSpyObj<MatDialogRef<unknown>>(['afterClosed']);
    dialogRefSpy.afterClosed.mockReturnValue(afterClosedSubject.asObservable());

    dialogSpy = createSpyObj<MatDialog>(['open']);
    dialogSpy.open.mockReturnValue(dialogRefSpy);

    // Suppress expected console.error output during error handler tests
    spyOn(console, 'error');

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });

    handler = TestBed.inject(GlobalErrorHandler);
  });

  afterEach(() => {
    afterClosedSubject.complete();
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('handleError', () => {
    it('should log error to console', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      expect(console.error).toHaveBeenCalledWith('Global error:', error);
    });

    it('should open error dialog with Error message', () => {
      const error = new Error('Test error message');

      handler.handleError(error);

      expect(dialogSpy.open).toHaveBeenCalled();
      const dialogData = dialogSpy.open.mock.calls.at(-1)?.[1]?.data as { title: string };
      expect(dialogData.title).toBe('Test error message');
    });

    it('should extract message from rejection object', () => {
      const rejection = new Error('Rejected promise');
      const error = { rejection };

      handler.handleError(error);

      expect(dialogSpy.open).toHaveBeenCalled();
      const dialogData = dialogSpy.open.mock.calls.at(-1)?.[1]?.data as { title: string };
      expect(dialogData.title).toBe('Rejected promise');
    });

    it('should extract message from object with message property', () => {
      const error = { message: 'Object error message' };

      handler.handleError(error);

      expect(dialogSpy.open).toHaveBeenCalled();
      const dialogData = dialogSpy.open.mock.calls.at(-1)?.[1]?.data as { title: string };
      expect(dialogData.title).toBe('Object error message');
    });

    it('should handle unknown error types', () => {
      handler.handleError('string error');

      expect(dialogSpy.open).toHaveBeenCalled();
      const dialogData = dialogSpy.open.mock.calls.at(-1)?.[1]?.data as { title: string | undefined };
      expect(dialogData.title).toBeUndefined();
    });

    it('should not open multiple dialogs simultaneously', () => {
      // First error opens dialog
      handler.handleError(new Error('First error'));
      expect(dialogSpy.open).toHaveBeenCalledTimes(1);

      // Second error while dialog is still open (afterClosed hasn't emitted)
      handler.handleError(new Error('Second error'));
      expect(dialogSpy.open).toHaveBeenCalledTimes(1);
    });

    it('should reset dialog state after close', () => {
      // First error opens dialog
      handler.handleError(new Error('First error'));
      expect(dialogSpy.open).toHaveBeenCalledTimes(1);

      // Simulate dialog close by emitting on the afterClosed subject
      afterClosedSubject.next();

      // Now another error should open a new dialog
      handler.handleError(new Error('Second error'));
      expect(dialogSpy.open).toHaveBeenCalledTimes(2);
    });

    it('should set disableClose to true', () => {
      handler.handleError(new Error('Test'));

      const dialogConfig = dialogSpy.open.mock.calls.at(-1)?.[1];
      expect(dialogConfig?.disableClose).toBe(true);
    });

    it('should not open dialog for 401 Unauthorized HttpErrorResponse', () => {
      const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });

      handler.handleError(error);

      expect(console.error).toHaveBeenCalledWith('Global error:', error);
      expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('should not open dialog for 401 Unauthorized wrapped in rejection', () => {
      const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
      const error = { rejection: httpError };

      handler.handleError(error);

      expect(console.error).toHaveBeenCalledWith('Global error:', error);
      expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('should open dialog for non-401 HttpErrorResponse', () => {
      const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });

      handler.handleError(error);

      expect(dialogSpy.open).toHaveBeenCalled();
    });
  });
});
