// =============================================================================
// Base Maintenance Page Component
// =============================================================================
// Abstract base class for maintenance page components (System Tasks, Notifications).
// Provides shared state, filtering, pagination, and formatting logic.
//
// Usage:
// @Component({...})
// export class SystemTasksPageComponent extends BaseMaintenancePageComponent<SystemTask, SystemTaskFilter> {
//   // Implement abstract properties and methods
// }

import { Directive, computed, effect, inject, signal, type Signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, skip } from 'rxjs';
import type { Observable } from 'rxjs';
import { BasePageComponent } from '../../../shared/components/base/base-page.component';
import { Icons } from '../../../core/icons/icon-registry';
import { MaintenanceApiService } from '../services/maintenance-api.service';
import type { PagedResult } from '../models/maintenance.interfaces';
import type { PageChangeEvent } from '../../../shared/components/simple-paginator/simple-paginator.component';

/**
 * Abstract base class for maintenance pages (System Tasks, Notifications).
 * Handles common filtering, pagination, loading states, and data formatting.
 *
 * @template TEntity - The entity type (SystemTask, Notification)
 * @template TFilter - The filter type (SystemTaskFilter, NotificationFilter)
 */
@Directive()
export abstract class BaseMaintenancePageComponent<TEntity, TFilter extends BaseFilter> extends BasePageComponent {
  protected readonly api = inject(MaintenanceApiService);
  private readonly destroyRef = inject(DestroyRef);

  // =========================================================================
  // Common Icons
  // =========================================================================

  public readonly baseIcons = {
    systemTasks: Icons.clipboardList,
    notifications: Icons.bell,
    filter: Icons.filter,
    clear: Icons.close,
    refresh: Icons.sync,
    search: Icons.search
  };

  // =========================================================================
  // Data State
  // =========================================================================

  /** The list of entities currently displayed */
  public readonly entities = signal<readonly TEntity[]>([]);

  /** Loading state for data fetches */
  public readonly loading = signal(false);

  /** Error message if data fetch fails */
  public readonly error = signal<string | null>(null);

  // =========================================================================
  // Pagination State
  // =========================================================================

  /** Current page index (0-based) */
  public readonly pageIndex = signal(0);

  /** Number of items per page */
  public readonly pageSize = signal(20);

  /** Total number of items across all pages */
  public readonly totalItems = signal(0);

  // =========================================================================
  // Common Filter State
  // =========================================================================

  /** Whether the filter panel is visible */
  public readonly filtersVisible = signal(false);

  /** Start date filter */
  public readonly fromDate = signal<Date | null>(null);

  /** End date filter */
  public readonly toDate = signal<Date | null>(null);

  /** Search text filter */
  public readonly searchTerm = signal('');

  /** The current filter that triggers API calls - track version to force refetch */
  protected readonly currentFilter = signal<TFilter>(this.getDefaultFilter());
  private readonly filterVersion = signal(0);

  // =========================================================================
  // Computed Properties
  // =========================================================================

  /** Whether the entity list is empty and not loading */
  public readonly isEmpty = computed(() => this.entities().length === 0 && !this.loading());

  /** Whether any filter is active (override in subclass if additional filters) */
  public readonly hasActiveFilters: Signal<boolean> = computed(() =>
    this.fromDate() !== null ||
    this.toDate() !== null ||
    this.searchTerm().trim().length > 0 ||
    this.hasEntitySpecificFilters()
  );

  // =========================================================================
  // Abstract Properties
  // =========================================================================

  /** Entity name for display (e.g., 'system tasks', 'notifications') */
  protected abstract readonly entityName: string;

  // =========================================================================
  // Abstract Methods
  // =========================================================================

  /** Get the default filter for this entity type */
  protected abstract getDefaultFilter(): TFilter;

  /** Build the filter from current input signals */
  protected abstract buildFilter(): TFilter;

  /** Check if entity-specific filters are active (beyond common filters) */
  protected abstract hasEntitySpecificFilters(): boolean;

  /** Reset entity-specific filter signals to defaults */
  protected abstract resetEntitySpecificFilters(): void;

  /** Fetch data from the API with the given filter */
  protected abstract fetchFromApi(filter: TFilter): Observable<PagedResult<TEntity>>;

  // =========================================================================
  // Constructor with Effect
  // =========================================================================

  constructor() {
    super();
    // Effect to fetch data when filter changes
    effect(() => {
      const filter = this.currentFilter();
      // Track version to allow re-fetch with same filter
      this.filterVersion();
      this.fetchData(filter);
    });

    // Auto-refresh on search term change (debounced)
    toObservable(this.searchTerm)
      .pipe(
        skip(1), // Skip initial value
        debounceTime(400),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.applyFilters());

    // Auto-refresh on date filter changes (immediate)
    toObservable(this.fromDate)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());

    toObservable(this.toDate)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
  }

  // =========================================================================
  // Protected Methods for Subclass Auto-Refresh
  // =========================================================================

  /**
   * Subscribe to an entity-specific filter signal for auto-refresh.
   * Call this in subclass constructor for each entity-specific filter.
   */
  protected watchFilterSignal<T>(filterSignal: Signal<T>): void {
    toObservable(filterSignal)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
  }

  // =========================================================================
  // Public Methods
  // =========================================================================

  /** Toggle filter panel visibility */
  public toggleFilters(): void {
    this.filtersVisible.set(!this.filtersVisible());
  }

  /** Apply current filter values and fetch data */
  public applyFilters(): void {
    const filter = this.buildFilter();
    this.pageIndex.set(0);
    this.currentFilter.set(filter);
    // Effect will trigger fetch
  }

  /** Clear all filters and reset to defaults */
  public clearFilters(): void {
    this.fromDate.set(null);
    this.toDate.set(null);
    this.searchTerm.set('');
    this.resetEntitySpecificFilters();
    this.pageIndex.set(0);
    const defaultFilter = this.getDefaultFilter();
    this.currentFilter.set(defaultFilter);
    // Effect will trigger fetch
  }

  /** Refresh data with current filter */
  public override refresh(): void {
    // Increment version to trigger effect with same filter
    this.filterVersion.update((v) => v + 1);
  }

  /** Handle page change from paginator */
  public onPageChange(event: PageChangeEvent): void {
    this.pageIndex.set(event.pageIndex);
    const filter = {
      ...this.currentFilter(),
      page: event.pageIndex + 1 // Convert 0-based to 1-based
    };
    this.currentFilter.set(filter);
    // Effect will trigger fetch
  }

  // =========================================================================
  // Protected Methods
  // =========================================================================

  /** Format a Date object for API transport */
  protected formatDateForApi(date: Date): string {
    return date.toISOString();
  }

  /** Fetch data from API and update state */
  protected fetchData(filter: TFilter): void {
    this.loading.set(true);
    this.error.set(null);

    this.fetchFromApi(filter).subscribe({
      next: (result) => {
        this.entities.set(result.items);
        this.totalItems.set(result.totalItems);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(`Failed to load ${this.entityName}:`, err);
        this.error.set(`Failed to load ${this.entityName}`);
        this.loading.set(false);
      }
    });
  }
}

/**
 * Base filter interface with pagination properties.
 * Entity-specific filters extend this interface.
 */
export interface BaseFilter {
  page: number;
  pageSize: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
}
