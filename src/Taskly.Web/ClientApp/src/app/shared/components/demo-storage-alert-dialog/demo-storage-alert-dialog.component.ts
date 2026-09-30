import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import { DialogHeaderComponent } from '../dialog-header/dialog-header.component';
import { BaseDialogComponent } from '../base';
import type { DemoStorageAlertData } from './demo-storage-alert-dialog.interfaces';

/**
 * Centered, closable warning modal for demo storage problems — either demo data was removed from the
 * browser (offer a reload to restore/re-seed) or the storage quota is full (acknowledge only).
 */
@Component({
  selector: 'app-demo-storage-alert-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, FontAwesomeModule, DialogHeaderComponent],
  templateUrl: './demo-storage-alert-dialog.component.html',
  styleUrl: './demo-storage-alert-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoStorageAlertDialogComponent extends BaseDialogComponent<DemoStorageAlertData, void> {
  public readonly icon = Icons.triangleExclamation;

  public get dialogTitle(): string {
    return this.data.title;
  }

  public reload(): void {
    window.location.reload();
  }

  public dismiss(): void {
    this.handleCancel();
  }
}
