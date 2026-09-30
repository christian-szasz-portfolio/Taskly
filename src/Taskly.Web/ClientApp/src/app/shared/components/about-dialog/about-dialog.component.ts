import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import { AuthStore } from '../../../core/state/auth.store';
import { DialogHeaderComponent } from '../dialog-header/dialog-header.component';
import { BaseDialogComponent } from '../base';

@Component({
  selector: 'app-about-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatDividerModule, FontAwesomeModule, DialogHeaderComponent],
  templateUrl: './about-dialog.component.html',
  styleUrl: './about-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutDialogComponent extends BaseDialogComponent<void, void> {
  private readonly authStore = inject(AuthStore);

  public readonly dialogTitle = 'About';

  public readonly icons = {
    about: Icons.info,
    email: Icons.email,
    user: Icons.user,
    calendar: Icons.calendarCheck
  };

  public readonly currentYear = signal(new Date().getFullYear());
  public readonly fullName = this.authStore.fullName;
  public readonly email = this.authStore.email;
  public readonly trialExpiresAt = this.authStore.trialExpiresAt;

  public readonly formattedTrialExpiry = computed(() => {
    const expiresAt = this.trialExpiresAt();
    if (!expiresAt) {
      return null;
    }
    return new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  public close(): void {
    this.handleCancel();
  }
}
