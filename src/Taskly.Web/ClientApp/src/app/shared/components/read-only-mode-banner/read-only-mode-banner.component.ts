import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import { AuthStore } from '../../../core/state/auth.store';

/**
 * A permanent banner that displays when the user is in read-only mode.
 * Shows information about the restrictions and provides an expandable details dropdown.
 */
@Component({
  selector: 'app-read-only-mode-banner',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './read-only-mode-banner.component.html',
  styleUrl: './read-only-mode-banner.component.scss'
})
export class ReadOnlyModeBannerComponent {
  private readonly authStore = inject(AuthStore);

  public readonly icons = Icons;

  /** Whether the details dropdown is expanded */
  public readonly isExpanded = signal(false);

  /** Show the banner once the demo session is up and the trial no longer allows edits */
  public readonly shouldShow = computed(() => this.authStore.user() !== null && !this.authStore.canWrite());

  /** Toggle the expanded state of the details dropdown */
  public toggleExpanded(): void {
    this.isExpanded.update((v) => !v);
  }
}
