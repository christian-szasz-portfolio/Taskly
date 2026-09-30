import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import type { ErrorDialogData } from './error-dialog.interfaces';
import { DialogHeaderComponent } from '../dialog-header/dialog-header.component';
import { BaseDialogComponent } from '../base';

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, FontAwesomeModule, DialogHeaderComponent],
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorDialogComponent extends BaseDialogComponent<ErrorDialogData, void> {
  public readonly icon = Icons.error;

  public get dialogTitle(): string {
    return this.data.title ?? 'Error';
  }

  public reload(): void {
    window.location.reload();
  }

  public dismiss(): void {
    this.handleCancel();
  }
}
