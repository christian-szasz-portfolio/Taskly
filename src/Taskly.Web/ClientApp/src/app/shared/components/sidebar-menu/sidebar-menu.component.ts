import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * Represents a menu item in the sidebar.
 */
export interface SidebarMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label */
  label: string;
  /** FontAwesome icon */
  icon: IconDefinition;
  /** Whether the item is disabled */
  disabled?: boolean;
}

/**
 * Reusable sidebar menu component for navigation within dialogs.
 *
 * Use this for settings dialogs, maintenance panels, or any UI that needs
 * a vertical navigation menu alongside content.
 *
 * @example Basic usage
 * ```html
 * <app-sidebar-menu
 *   [items]="categories()"
 *   [selectedId]="selectedCategoryId()"
 *   ariaLabel="Settings categories"
 *   (selectionChange)="selectCategory($event)" />
 * ```
 *
 * @example With custom prefix class
 * ```html
 * <app-sidebar-menu
 *   [items]="menuItems"
 *   [selectedId]="activeId"
 *   classPrefix="maintenance"
 *   (selectionChange)="onSelect($event)" />
 * ```
 */
@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss'
})
export class SidebarMenuComponent {
  /** Menu items to display */
  public readonly items = input.required<readonly SidebarMenuItem[]>();

  /** Currently selected item ID */
  public readonly selectedId = input<string | null>(null);

  /** ARIA label for the navigation */
  public readonly ariaLabel = input<string>('Menu');

  /** CSS class prefix for custom styling */
  public readonly classPrefix = input<string>('sidebar');

  /** Emitted when a menu item is selected */
  public readonly selectionChange = output<string>();

  /**
   * Checks if an item is currently selected
   */
  public isSelected(itemId: string): boolean {
    return this.selectedId() === itemId;
  }

  /**
   * Handles item click
   */
  public onItemClick(item: SidebarMenuItem): void {
    if (!item.disabled) {
      this.selectionChange.emit(item.id);
    }
  }
}
