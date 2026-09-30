import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  type TemplateRef
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../../core/icons/icon-registry';
import { SimplePaginatorComponent, type PageChangeEvent } from '../../../../shared/components/simple-paginator/simple-paginator.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

export type HeroVariant = 'slate' | 'rose';

/**
 * Shared layout component for maintenance pages (System Tasks, Notifications).
 * Provides consistent hero section, toolbar, filter panel wrapper, and content area.
 * Entity-specific content is projected via ng-template inputs.
 */
@Component({
  selector: 'app-maintenance-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatTooltipModule,
    FontAwesomeModule,
    SimplePaginatorComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './maintenance-page-layout.component.html',
  styleUrl: './maintenance-page-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaintenancePageLayoutComponent {
  // =========================================================================
  // Inputs - Page Configuration
  // =========================================================================

  /** Page title displayed in hero section */
  public readonly title = input.required<string>();

  /** Page description displayed in hero section */
  public readonly description = input.required<string>();

  /** Hero section color variant */
  public readonly heroVariant = input<HeroVariant>('slate');

  // =========================================================================
  // Inputs - State
  // =========================================================================

  /** Whether data is loading */
  public readonly loading = input(false);

  /** Error message to display */
  public readonly error = input<string | null>(null);

  /** Whether the entity list is empty */
  public readonly isEmpty = input(false);

  /** Message to display when empty */
  public readonly emptyMessage = input('No items found.');

  /** Hint text for empty state */
  public readonly emptyHint = input('Adjust your filters or check back later.');

  // =========================================================================
  // Inputs - Filter State
  // =========================================================================

  /** Whether the filter panel is visible */
  public readonly filtersVisible = input(false);

  /** Whether any filters are active */
  public readonly hasActiveFilters = input(false);

  // =========================================================================
  // Inputs - Pagination State
  // =========================================================================

  /** Current page index (0-based) */
  public readonly pageIndex = input(0);

  /** Number of items per page */
  public readonly pageSize = input(20);

  /** Total number of items */
  public readonly totalItems = input(0);

  // =========================================================================
  // Inputs - Templates
  // =========================================================================

  /** Template for entity-specific filter fields */
  public readonly filtersTemplate = input<TemplateRef<unknown> | null>(null);

  /** Template for entity-specific table content */
  public readonly tableTemplate = input<TemplateRef<unknown> | null>(null);

  /** Template for empty state icon */
  public readonly emptyIconTemplate = input<TemplateRef<unknown> | null>(null);

  // =========================================================================
  // Outputs
  // =========================================================================

  /** Emitted when refresh button is clicked */
  public readonly refreshClick = output<void>();

  /** Emitted when filter toggle button is clicked */
  public readonly toggleFiltersClick = output<void>();

  /** Emitted when Clear button is clicked */
  public readonly clearFiltersClick = output<void>();

  /** Emitted when page changes */
  public readonly pageChange = output<PageChangeEvent>();

  // =========================================================================
  // Icons
  // =========================================================================

  public readonly icons = {
    systemTasks: Icons.clipboardList,
    notifications: Icons.bell,
    filter: Icons.filter,
    refresh: Icons.sync,
    clear: Icons.close
  };

  // =========================================================================
  // Methods
  // =========================================================================

  public onRefresh(): void {
    this.refreshClick.emit();
  }

  public onToggleFilters(): void {
    this.toggleFiltersClick.emit();
  }

  public onClearFilters(): void {
    this.clearFiltersClick.emit();
  }

  public onPageChange(event: PageChangeEvent): void {
    this.pageChange.emit(event);
  }
}
