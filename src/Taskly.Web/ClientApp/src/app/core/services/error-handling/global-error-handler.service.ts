import { inject, Injectable, Injector, NgZone, signal } from '@angular/core';
import type { ErrorHandler } from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../../shared/components/error-dialog/error-dialog.component';
import type { ErrorDialogData } from '../../../shared/components/error-dialog/error-dialog.interfaces';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly injector = inject(Injector);
  private readonly zone = inject(NgZone);
  private readonly isDialogOpen = signal(false);

  public handleError(error: unknown): void {
    console.error('Global error:', error);

    // Skip dialog for 401 Unauthorized errors - these are handled by auth flow
    if (this.isUnauthorizedError(error)) {
      return;
    }

    // Skip dialog for 400 Bad Request (validation errors) - handled inline in forms
    if (this.isBadRequestError(error)) {
      return;
    }

    if (this.isDialogOpen()) {
      return;
    }

    const errorTitle = this.extractErrorTitle(error);

    this.zone.run(() => {
      this.showErrorDialog(errorTitle);
    });
  }

  private isUnauthorizedError(error: unknown): boolean {
    return this.isHttpStatusError(error, HttpStatusCode.Unauthorized);
  }

  private isBadRequestError(error: unknown): boolean {
    return this.isHttpStatusError(error, HttpStatusCode.BadRequest);
  }

  private isHttpStatusError(error: unknown, status: HttpStatusCode): boolean {
    // Direct HttpErrorResponse
    if (error instanceof HttpErrorResponse && error.status === status) {
      return true;
    }

    // Promise rejection wrapping HttpErrorResponse
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      if ('rejection' in errorObj && errorObj['rejection'] instanceof HttpErrorResponse) {
        return errorObj['rejection'].status === status;
      }
    }

    return false;
  }

  private extractErrorTitle(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      if ('rejection' in errorObj && errorObj['rejection'] instanceof Error) {
        return errorObj['rejection'].message;
      }
      if ('message' in errorObj && typeof errorObj['message'] === 'string') {
        return errorObj['message'];
      }
    }

    return undefined;
  }

  private showErrorDialog(errorTitle?: string): void {
    const dialog = this.injector.get(MatDialog);

    this.isDialogOpen.set(true);

    const data: ErrorDialogData = {
      title: errorTitle
    };

    const dialogRef = dialog.open(ErrorDialogComponent, {
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(() => {
      this.isDialogOpen.set(false);
    });
  }
}
