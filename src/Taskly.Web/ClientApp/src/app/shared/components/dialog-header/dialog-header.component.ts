import { Component, input, output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Icons } from '../../../core/icons/icon-registry';

/**
 * Reusable dialog header component with title and close button.
 * Provides consistent styling and accessibility across all dialogs.
 *
 * @example
 * // Basic usage
 * <app-dialog-header
 *   title="Edit Task"
 *   (close)="handleCancel()">
 * </app-dialog-header>
 *
 * @example
 * // With icon
 * <app-dialog-header
 *   title="Settings"
 *   [icon]="settingsIcon"
 *   (close)="handleClose()">
 * </app-dialog-header>
 *
 * @example
 * // With custom title class
 * <app-dialog-header
 *   title="About"
 *   titleClass="about-dialog__title"
 *   [icon]="infoIcon"
 *   (close)="close()">
 * </app-dialog-header>
 */
@Component({
  selector: 'app-dialog-header',
  standalone: true,
  imports: [MatDialogModule, MatTooltipModule, FontAwesomeModule],
  templateUrl: './dialog-header.component.html',
  styleUrl: './dialog-header.component.scss'
})
export class DialogHeaderComponent {
  /**
   * The dialog title text.
   */
  public readonly title = input<string>('');

  /**
   * Optional icon to display before the title.
   */
  public readonly icon = input<IconDefinition | null>(null);

  /**
   * Optional CSS class to add to the title element.
   */
  public readonly titleClass = input<string>('');

  /**
   * Whether to show the close button. Defaults to true.
   */
  public readonly showCloseButton = input<boolean>(true);

  /**
   * Emitted when the close button is clicked.
   */
  public readonly closeClick = output<void>();

  /**
   * Close button icon.
   */
  public readonly closeIcon = Icons.close;

  /**
   * Handles close button click.
   */
  public onClose(): void {
    this.closeClick.emit();
  }
}
