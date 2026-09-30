// =============================================================================
// Base Page Component
// =============================================================================
// Abstract base class for list/catalog page components
// Extend this class and implement the abstract members.
//
// Usage:
// @Component({...})
// export class MyListPageComponent extends BasePageComponent {
//   public loading = computed(() => this.store.loading());
//   public isEmpty = computed(() => this.store.items().length === 0);
//   public refresh(): void { this.store.load(); }
// }

import { Directive, inject, type Signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Abstract base class for list/catalog page components.
 * Provides common platform detection and lifecycle patterns.
 */
@Directive()
export abstract class BasePageComponent {
  /** Injected platform ID for SSR detection */
  protected readonly platformId = inject(PLATFORM_ID);

  /** Whether the component is running in a browser environment */
  protected readonly isBrowser = isPlatformBrowser(this.platformId);

  // =========================================================================
  // Abstract Properties
  // =========================================================================

  /**
   * Override to provide the loading state signal.
   * Used by the template to show loading indicators.
   */
  public abstract readonly loading: Signal<boolean>;

  /**
   * Override to check if the list is empty.
   * Used by the template to show empty states.
   */
  public abstract readonly isEmpty: Signal<boolean>;

  // =========================================================================
  // Abstract Methods
  // =========================================================================

  /**
   * Override to refresh/reload the data.
   * Typically calls the store's load method.
   */
  public abstract refresh(): void;

  // =========================================================================
  // Common Methods
  // =========================================================================

  /**
   * Executes a function only in browser environment.
   * Use this for DOM/window operations that don't work in SSR.
   *
   * @param fn - Function to execute in browser only
   */
  protected runInBrowser(fn: () => void): void {
    if (this.isBrowser) {
      fn();
    }
  }

  /**
   * Safely scrolls an element into view (browser-only).
   *
   * @param element - Element to scroll into view
   * @param options - ScrollIntoView options
   */
  protected scrollIntoView(element: Element, options?: ScrollIntoViewOptions): void {
    this.runInBrowser(() => element.scrollIntoView(options));
  }

  /**
   * Safely focuses an element (browser-only).
   *
   * @param element - Element to focus
   */
  protected focusElement(element: HTMLElement): void {
    this.runInBrowser(() => element.focus());
  }
}
