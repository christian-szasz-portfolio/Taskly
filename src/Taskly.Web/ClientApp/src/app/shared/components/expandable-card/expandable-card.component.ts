import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons, type IconDefinition } from '../../../core/icons/icon-registry';
import { CardTheme } from '../../../core/models/task.enums';
import { UserPreferencesService } from '../../../core/services/user/user-preferences.service';

export { CardTheme } from '../../../core/models/task.enums';

export interface ExpandableCardAction {
  icon: IconDefinition;
  label: string;
  tooltip?: string;
  accent?: CardTheme;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Tooltip to show when action is disabled (overrides tooltip) */
  disabledTooltip?: string;
}

@Component({
  selector: 'app-expandable-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, FontAwesomeModule],
  templateUrl: './expandable-card.component.html',
  styleUrl: './expandable-card.component.scss'
})
export class ExpandableCardComponent {
  private readonly userPreferences = inject(UserPreferencesService);

  /** The key/identifier displayed in the card header (e.g., project key, issue key) */
  public readonly cardKey = input<string | null | undefined>(null);

  /** Unique identifier for persistence. If provided, expansion state is saved to localStorage. */
  public readonly persistenceKey = input<string | null>(null);

  /** The title displayed in the card header */
  public readonly title = input.required<string>();

  /** The theme color for the key badge */
  public readonly theme = input<CardTheme>(CardTheme.Indigo);

  /** Whether the card has expandable content */
  public readonly hasDetails = input(false);

  /** Whether the card is expanded by default. Set to false for collapsed-by-default behavior. */
  public readonly defaultExpanded = input(true);

  /** Primary action button configuration */
  public readonly primaryAction = input<ExpandableCardAction | null>(null);

  /** Secondary action button configuration */
  public readonly secondaryAction = input<ExpandableCardAction | null>(null);

  /** Whether to show the open in new tab button */
  public readonly showOpenButton = input(true);

  /** Emitted when the card header is clicked (for expansion) */
  public readonly expanded = output<boolean>();

  /** Emitted when the open button is clicked */
  public readonly opened = output<void>();

  /** Emitted when the primary action button is clicked */
  public readonly primaryActionClicked = output<void>();

  /** Emitted when the secondary action button is clicked */
  public readonly secondaryActionClicked = output<void>();

  private readonly isExpandedInternal = signal(false);

  /**
   * Computed signal that determines the current expansion state.
   * If a persistenceKey is provided, reads from UserPreferencesService.
   * Otherwise, uses local component state.
   */
  public readonly isExpanded = computed(() => {
    const key = this.persistenceKey();
    if (key) {
      return this.userPreferences.isPanelExpanded(key, this.defaultExpanded());
    }
    return this.isExpandedInternal();
  });

  public readonly icons = computed(() => ({
    expand: Icons.chevronDown,
    collapse: Icons.chevronUp,
    open: Icons.externalLink
  }));

  public readonly displayKey = computed(() => this.cardKey() ?? 'Unkeyed');

  public toggleExpanded(event: Event): void {
    event.stopPropagation();
    if (this.hasDetails()) {
      const key = this.persistenceKey();
      if (key) {
        // Use persistence service for tracked panels
        const newState = this.userPreferences.togglePanel(key, this.defaultExpanded());
        this.expanded.emit(newState);
      } else {
        // Use local state for non-tracked panels
        this.isExpandedInternal.update((value) => !value);
        this.expanded.emit(this.isExpandedInternal());
      }
    }
  }

  public handleOpen(event: Event): void {
    event.stopPropagation();
    this.opened.emit();
  }

  public handlePrimaryAction(event: Event): void {
    event.stopPropagation();
    this.primaryActionClicked.emit();
  }

  public handleSecondaryAction(event: Event): void {
    event.stopPropagation();
    this.secondaryActionClicked.emit();
  }
}
