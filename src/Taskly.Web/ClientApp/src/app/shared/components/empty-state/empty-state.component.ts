import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * Reusable empty state component for displaying "no data" messages.
 *
 * Use this when a list, table, or collection has no items to display.
 *
 * @example Basic usage
 * ```html
 * <app-empty-state
 *   [icon]="icons.folder"
 *   title="No projects yet"
 *   hint="Click the + button to create your first project." />
 * ```
 *
 * @example With action button
 * ```html
 * <app-empty-state
 *   [icon]="icons.inbox"
 *   title="No messages"
 *   hint="Your inbox is empty."
 *   [showAction]="true"
 *   actionLabel="Refresh"
 *   (actionClick)="refresh()" />
 * ```
 *
 * @example Compact variant
 * ```html
 * <app-empty-state
 *   variant="compact"
 *   title="No items" />
 * ```
 *
 * @example With custom content
 * ```html
 * <app-empty-state [icon]="icons.search" title="No results">
 *   <p>Try adjusting your search filters.</p>
 * </app-empty-state>
 * ```
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatButtonModule, FontAwesomeModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  /** Icon to display (FontAwesome icon) */
  public readonly icon = input<IconDefinition | null>(null);

  /** Main title message */
  public readonly title = input<string>('No items found');

  /** Descriptive hint text */
  public readonly hint = input<string>('');

  /** Visual variant: 'default' or 'compact' */
  public readonly variant = input<'default' | 'compact'>('default');

  /** Whether to show the action button */
  public readonly showAction = input<boolean>(false);

  /** Label for the action button */
  public readonly actionLabel = input<string>('Action');

  /** Emitted when action button is clicked */
  public readonly actionClick = output<void>();

  /** ARIA role for the container */
  public readonly role = input<'status' | 'region'>('status');

  public onActionClick(): void {
    this.actionClick.emit();
  }
}
