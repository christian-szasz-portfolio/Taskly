import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import type { ConfirmDialogData } from './confirm-dialog.interfaces';
import { ConfirmDialogResult } from './confirm-dialog.enums';
import { DialogHeaderComponent } from '../dialog-header/dialog-header.component';
import { BaseDialogComponent } from '../base';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, FontAwesomeModule, DialogHeaderComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent extends BaseDialogComponent<ConfirmDialogData, boolean> {
  public readonly icon = signal(Icons.triangleExclamation);

  public get dialogTitle(): string {
    return this.data.title ?? 'Confirm';
  }

  public close(result: boolean): void {
    this.closeWithResult(result);
  }

  public readonly confirmLabel = computed(() => this.data.confirmLabel ?? ConfirmDialogResult.Confirm);
  public readonly cancelLabel = computed(() => this.data.cancelLabel ?? ConfirmDialogResult.Cancel);
}
