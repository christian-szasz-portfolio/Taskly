import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

/**
 * Service for managing user preferences stored in browser localStorage.
 * Preferences persist across sessions and are browser-specific (not synced across devices).
 *
 * SSR-safe: All localStorage operations are guarded by platform checks.
 *
 * Design note: We store COLLAPSED panels (not expanded) because the default state
 * is expanded. This means an empty storage = all panels expanded (the default).
 */
@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly storageKeys = {
    collapsedPanels: 'task-collapsed-panels',
    expandedPanels: 'task-expanded-panels'
  } as const;

  /**
   * Signal containing the set of COLLAPSED panel IDs.
   * Panels NOT in this set are considered expanded (the default state).
   */
  private readonly collapsedPanelsInternal = signal<Set<string>>(this.loadCollapsedPanels());

  /**
   * Signal containing the set of EXPANDED panel IDs for "collapsed by default" panels.
   * Used when defaultExpanded=false - panels IN this set are expanded.
   */
  private readonly expandedPanelsInternal = signal<Set<string>>(this.loadExpandedPanels());

  /**
   * Read-only signal exposing the current set of collapsed panel IDs.
   */
  public readonly collapsedPanels = this.collapsedPanelsInternal.asReadonly();

  /**
   * Read-only signal exposing the current set of explicitly expanded panel IDs.
   * Used for "collapsed by default" panels.
   */
  public readonly expandedPanels = this.expandedPanelsInternal.asReadonly();

  /**
   * Checks if a specific panel is expanded.
   * @param panelId The unique identifier for the panel (e.g., task issueKey or id)
   * @param defaultExpanded Whether the panel is expanded by default (true) or collapsed by default (false)
   * @returns true if the panel is expanded, false if collapsed
   */
  public isPanelExpanded(panelId: string, defaultExpanded = true): boolean {
    if (defaultExpanded) {
      // Expanded by default: check if it's been explicitly collapsed
      return !this.collapsedPanelsInternal().has(panelId);
    } else {
      // Collapsed by default: check if it's been explicitly expanded
      return this.expandedPanelsInternal().has(panelId);
    }
  }

  /**
   * Toggles the expansion state of a panel.
   * @param panelId The unique identifier for the panel
   * @param defaultExpanded Whether the panel is expanded by default (true) or collapsed by default (false)
   * @returns The new expansion state (true = expanded, false = collapsed)
   */
  public togglePanel(panelId: string, defaultExpanded = true): boolean {
    const isCurrentlyExpanded = this.isPanelExpanded(panelId, defaultExpanded);

    if (isCurrentlyExpanded) {
      this.collapsePanel(panelId, defaultExpanded);
      return false;
    } else {
      this.expandPanel(panelId, defaultExpanded);
      return true;
    }
  }

  /**
   * Expands a specific panel.
   * For expanded-by-default panels: removes from collapsed set.
   * For collapsed-by-default panels: adds to expanded set.
   * @param panelId The unique identifier for the panel
   * @param defaultExpanded Whether the panel is expanded by default
   */
  public expandPanel(panelId: string, defaultExpanded = true): void {
    if (defaultExpanded) {
      this.collapsedPanelsInternal.update((current) => {
        const updated = new Set(current);
        updated.delete(panelId);
        this.saveCollapsedPanels(updated);
        return updated;
      });
    } else {
      this.expandedPanelsInternal.update((current) => {
        const updated = new Set(current);
        updated.add(panelId);
        this.saveExpandedPanels(updated);
        return updated;
      });
    }
  }

  /**
   * Collapses a specific panel.
   * For expanded-by-default panels: adds to collapsed set.
   * For collapsed-by-default panels: removes from expanded set.
   * @param panelId The unique identifier for the panel
   * @param defaultExpanded Whether the panel is expanded by default
   */
  public collapsePanel(panelId: string, defaultExpanded = true): void {
    if (defaultExpanded) {
      this.collapsedPanelsInternal.update((current) => {
        const updated = new Set(current);
        updated.add(panelId);
        this.saveCollapsedPanels(updated);
        return updated;
      });
    } else {
      this.expandedPanelsInternal.update((current) => {
        const updated = new Set(current);
        updated.delete(panelId);
        this.saveExpandedPanels(updated);
        return updated;
      });
    }
  }

  /**
   * Sets the expansion state of a panel explicitly.
   * @param panelId The unique identifier for the panel
   * @param expanded Whether the panel should be expanded
   * @param defaultExpanded Whether the panel is expanded by default
   */
  public setPanelExpanded(panelId: string, expanded: boolean, defaultExpanded = true): void {
    if (expanded) {
      this.expandPanel(panelId, defaultExpanded);
    } else {
      this.collapsePanel(panelId, defaultExpanded);
    }
  }

  /**
   * Expands all panels (clears the collapsed set).
   */
  public expandAllPanels(): void {
    this.collapsedPanelsInternal.set(new Set());
    this.saveCollapsedPanels(new Set());
  }

  /**
   * Collapses multiple panels at once.
   * @param panelIds Array of panel identifiers to collapse
   */
  public collapsePanels(panelIds: readonly string[]): void {
    this.collapsedPanelsInternal.update((current) => {
      const updated = new Set(current);
      for (const id of panelIds) {
        updated.add(id);
      }
      this.saveCollapsedPanels(updated);
      return updated;
    });
  }

  private loadCollapsedPanels(): Set<string> {
    if (!this.isBrowser) {
      return new Set();
    }

    try {
      const stored = localStorage.getItem(this.storageKeys.collapsedPanels);
      if (!stored) {
        return new Set();
      }

      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed)) {
        return new Set();
      }

      // Filter to ensure we only have strings
      const validIds = parsed.filter((item): item is string => typeof item === 'string');
      return new Set(validIds);
    } catch {
      // If parsing fails, return empty set
      return new Set();
    }
  }

  private saveCollapsedPanels(panels: Set<string>): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const serialized = JSON.stringify([...panels]);
      localStorage.setItem(this.storageKeys.collapsedPanels, serialized);
    } catch {
      // Storage might be full or disabled - silently fail
      console.warn('Failed to save collapsed panels to localStorage');
    }
  }

  private loadExpandedPanels(): Set<string> {
    if (!this.isBrowser) {
      return new Set();
    }

    try {
      const stored = localStorage.getItem(this.storageKeys.expandedPanels);
      if (!stored) {
        return new Set();
      }

      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed)) {
        return new Set();
      }

      // Filter to ensure we only have strings
      const validIds = parsed.filter((item): item is string => typeof item === 'string');
      return new Set(validIds);
    } catch {
      // If parsing fails, return empty set
      return new Set();
    }
  }

  private saveExpandedPanels(panels: Set<string>): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const serialized = JSON.stringify([...panels]);
      localStorage.setItem(this.storageKeys.expandedPanels, serialized);
    } catch {
      // Storage might be full or disabled - silently fail
      console.warn('Failed to save expanded panels to localStorage');
    }
  }
}
