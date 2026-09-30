import { isPlatformBrowser } from '@angular/common';
import type { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, Injector, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, throwError } from 'rxjs';
import { ErrorDialogComponent } from '../../shared/components/error-dialog/error-dialog.component';
import type { ErrorDialogData } from '../../shared/components/error-dialog/error-dialog.interfaces';

const isDialogOpen = signal(false);

export const errorInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const platformId = inject(PLATFORM_ID);
  const zone = inject(NgZone);
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!isPlatformBrowser(platformId)) {
        return throwError(() => error);
      }

      if (!isDialogOpen()) {
        const errorInfo = extractErrorInfo(error);

        zone.run(() => {
          showErrorDialog(injector, errorInfo);
        });
      }

      return throwError(() => error);
    })
  );
};

interface ExtractedError {
  title?: string;
  description?: string;
}

const extractErrorBody = (error: unknown): Record<string, unknown> | null => {
  if (error && typeof error === 'object' && !Array.isArray(error)) {
    return error as Record<string, unknown>;
  }
  return null;
};

const extractErrorInfo = (error: HttpErrorResponse): ExtractedError => {
  const errorBody = extractErrorBody(error.error);
  const result: ExtractedError = {};

  // Extract title
  if (errorBody && typeof errorBody['title'] === 'string') {
    result.title = errorBody['title'];
  } else if (error.statusText) {
    result.title = `${error.status} ${error.statusText}`;
  }

  // Extract description (detail or message)
  if (errorBody && typeof errorBody['detail'] === 'string') {
    result.description = errorBody['detail'];
  } else if (errorBody && typeof errorBody['message'] === 'string') {
    result.description = errorBody['message'];
  } else if (error.message && error.message !== result.title) {
    result.description = error.message;
  }

  return result;
};

const showErrorDialog = (injector: Injector, errorInfo: ExtractedError): void => {
  const dialog = injector.get(MatDialog);

  isDialogOpen.set(true);

  const data: ErrorDialogData = {
    title: errorInfo.title,
    description: errorInfo.description
  };

  const dialogRef = dialog.open(ErrorDialogComponent, {
    data,
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(() => {
    isDialogOpen.set(false);
  });
};
