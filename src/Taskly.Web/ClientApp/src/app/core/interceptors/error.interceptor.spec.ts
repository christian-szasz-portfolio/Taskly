import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { MatDialog, type MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { errorInterceptor } from './error.interceptor';
import { ErrorDialogComponent } from '../../shared/components/error-dialog/error-dialog.component';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let dialogSpy: MockedObject<MatDialog>;
  let dialogRefSpy: MockedObject<MatDialogRef<unknown>>;

  const setupTestBed = (platformId: string): void => {
    dialogRefSpy = createSpyObj<MatDialogRef<unknown>>(['afterClosed']);
    dialogRefSpy.afterClosed.mockReturnValue(of(undefined));

    dialogSpy = createSpyObj<MatDialog>(['open'], {
      openDialogs: []
    });
    dialogSpy.open.mockReturnValue(dialogRefSpy);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock?.verify();
    TestBed.resetTestingModule();
  });

  describe('in browser environment', () => {
    beforeEach(() => {
      setupTestBed('browser');
    });

    it('should show error dialog on 500 error', () => {
      httpClient.get('/api/test').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ title: 'Server Error', detail: 'Something went wrong' }, {
        status: 500,
        statusText: 'Internal Server Error'
      });

      expect(dialogSpy.open).toHaveBeenCalledOnceWith(
        ErrorDialogComponent,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            title: 'Server Error',
            description: 'Something went wrong'
          }),
          disableClose: true
        })
      );
    });

    it('should show error dialog on 400 error', () => {
      httpClient.get('/api/test').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ title: 'Bad Request', message: 'Validation failed' }, {
        status: 400,
        statusText: 'Bad Request'
      });

      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should extract title from error body', () => {
      httpClient.get('/api/test').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ title: 'Custom Title', detail: 'Custom Detail' }, {
        status: 400,
        statusText: 'Bad Request'
      });

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ErrorDialogComponent,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            title: 'Custom Title',
            description: 'Custom Detail'
          })
        })
      );
    });

    it('should use statusText when no title in error body', () => {
      httpClient.get('/api/test').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({}, { status: 503, statusText: 'Service Unavailable' });

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ErrorDialogComponent,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            title: '503 Service Unavailable'
          })
        })
      );
    });

    it('should extract message field as description', () => {
      httpClient.get('/api/test').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ message: 'An error message' }, { status: 400, statusText: 'Bad Request' });

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ErrorDialogComponent,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            description: 'An error message'
          })
        })
      );
    });

    it('should handle null error body', () => {
      httpClient.get('/api/test').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should handle array error body', () => {
      httpClient.get('/api/test').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush(['error1', 'error2'], { status: 400, statusText: 'Bad Request' });

      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should pass request through successfully when no error', () => {
      httpClient.get('/api/test').subscribe({
        next: (response) => {
          expect(response).toEqual({ data: 'test' });
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ data: 'test' });

      expect(dialogSpy.open).not.toHaveBeenCalled();
    });
  });

  describe('in server environment (SSR)', () => {
    beforeEach(() => {
      setupTestBed('server');
    });

    it('should NOT show error dialog on server', () => {
      httpClient.get('/api/test').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ title: 'Error' }, { status: 500, statusText: 'Internal Server Error' });

      expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('should still throw error on server', () => {
      let errorReceived = false;

      httpClient.get('/api/test').subscribe({
        error: (err: HttpErrorResponse) => {
          errorReceived = true;
          expect(err).toBeInstanceOf(HttpErrorResponse);
          expect(err.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });

      expect(errorReceived).toBe(true);
    });
  });

  describe('error extraction edge cases', () => {
    beforeEach(() => {
      setupTestBed('browser');
    });

    it('should prefer detail over message for description', () => {
      httpClient.get('/api/test').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ detail: 'Detail text', message: 'Message text' }, {
        status: 400,
        statusText: 'Bad Request'
      });

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ErrorDialogComponent,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            description: 'Detail text'
          })
        })
      );
    });

    it('should handle string error body', () => {
      httpClient.get('/api/test').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      expect(dialogSpy.open).toHaveBeenCalled();
    });
  });
});
