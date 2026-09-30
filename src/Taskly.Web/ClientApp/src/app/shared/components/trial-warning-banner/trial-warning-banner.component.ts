import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import { AuthStore } from '../../../core/state/auth.store';

/**
 * A banner component that displays a warning when the user's trial license is about to expire.
 * Shows the number of days remaining and provides an upgrade path.
 */
@Component({
  selector: 'app-trial-warning-banner',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, FontAwesomeModule],
  template: `
    @if (shouldShow()) {
      <div class="trial-banner" [class.urgent]="isUrgent()">
        <div class="banner-content">
          <fa-icon [icon]="icons.clock" class="banner-icon"></fa-icon>
          <span class="banner-text">
            @if (hoursRemaining() <= 1) {
              This demo resets within the hour — your changes will be cleared.
            } @else if (daysRemaining() <= 1) {
              Demo mode: this data will disappear in about {{ hoursRemaining() }} hours, then resets to a fresh workspace.
            } @else {
              Demo mode: this data will disappear in about {{ daysRemaining() }} days, then resets to a fresh workspace.
            }
          </span>
        </div>
        <div class="banner-actions">
          <button mat-icon-button class="dismiss-button" (click)="dismiss()" aria-label="Dismiss">
            <fa-icon [icon]="icons.close"></fa-icon>
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .trial-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.75rem 1.25rem;
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        color: white;
        font-size: 0.875rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

        &.urgent {
          background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        }
      }

      .banner-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
      }

      .banner-icon {
        font-size: 1.25rem;
        opacity: 0.9;
      }

      .banner-text {
        font-weight: 500;
      }

      .banner-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .upgrade-button {
        color: white;
        font-weight: 500;

        fa-icon {
          margin-left: 0.5rem;
        }
      }

      .dismiss-button {
        color: rgba(255, 255, 255, 0.8);

        &:hover {
          color: white;
        }
      }
    `,
  ],
})
export class TrialWarningBannerComponent {
  private readonly authStore = inject(AuthStore);

  public readonly icons = Icons;

  private readonly dismissed = signal(false);

  public readonly shouldShow = computed(() => !this.dismissed() && this.authStore.showTrialWarning());

  public readonly hoursRemaining = computed(() => this.authStore.trialHoursRemaining() ?? 0);

  public readonly daysRemaining = computed(() => this.authStore.trialDaysRemaining() ?? 0);

  public readonly isUrgent = computed(() => this.hoursRemaining() <= 2);

  public dismiss(): void {
    this.dismissed.set(true);
  }
}
